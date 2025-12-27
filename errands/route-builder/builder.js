import {
  decodePolyline,
  extractAddresses,
  extractNumberedSteps,
  extractSubject,
  geocodeAddresses,
} from "./parser.js";

/* ---------------------------------------
   MAIN FILE INPUT HANDLER
---------------------------------------- */
document.getElementById("emlInput").addEventListener("change", async (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const raw = await file.text();
  const subject = extractSubject(raw);

  // Phase 1 — Extract numbered steps
  const steps = extractNumberedSteps(raw);

  // Phase 2 — Extract addresses
  const addresses = extractAddresses(steps);

  // Phase 3 — Geocode (via tiny server → ORS Search → Snap-to-Road)
  const geocoded = await geocodeAddresses(addresses);

  // Phase 4 — Build ORS route
  let route = null;
  try {
    route = await buildRoute(geocoded);
  } catch (err) {
    console.error("Route build failed:", err);
    route = { error: err.message };
  }

  // Final output object
  const finalOutput = {
    steps,
    addresses,
    geocoded,
    route,
  };

  // Display JSON in UI
  document.getElementById("output").textContent = JSON.stringify(
    finalOutput,
    null,
    2
  );

  // Safe filename
  const safeName = subject.replace(/[^a-z0-9\-]+/gi, "_");

  // Save JSON file
  saveJSON(finalOutput, `${safeName}.json`);
});

/* ---------------------------------------
   BUILD ROUTE (ORS Directions)
---------------------------------------- */
export async function buildRoute(geocoded) {
  // Filter out failed geocodes
  const valid = geocoded.filter((g) => g.coords !== null);

  if (valid.length < 2) {
    throw new Error("Not enough valid coordinates to build a route.");
  }

  // Build ORS coordinate string
  const coordString = valid
    .map((g) => g.coords.join(","))
    .join("|");

  const url = `http://localhost:3001/route?coords=${encodeURIComponent(
    coordString
  )}`;

  const res = await fetch(url);
  const data = await res.json();

  if (!data?.routes?.length) {
    throw new Error("ORS returned no routes.");
  }

  const route = data.routes[0];

  // Decode geometry
  const encoded = route.geometry;
  const decoded = decodePolyline(encoded);

  // Flatten all segment steps into one array
  const segments = route.segments || [];
  const instructions = segments.flatMap((seg) => seg.steps || []);

  return {
    summary: route.summary,
    geometry: decoded,
    steps: instructions,
  };
}

/* ---------------------------------------
   SAVE JSON FILE
---------------------------------------- */
function saveJSON(data, filename) {
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();

  URL.revokeObjectURL(url);
}