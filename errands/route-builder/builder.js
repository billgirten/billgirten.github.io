import {
  decodePolyline,
  extractAddresses,
  extractNumberedStops,
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

  // Phase 1 — Extract numbered stops
  const stops = extractNumberedStops(raw);

  // Phase 2 — Extract addresses
  const addresses = extractAddresses(stops);

  // Phase 3 — Geocode (via tiny server → LocationIQ → ORS Snap)
  const geocoded = await geocodeAddresses(addresses);

  // Phase 4 — Build ORS route
  let route = null;
  let finalOutput = null;

  try {
    route = await buildRoute(geocoded);

    // ⭐ Build final JSON (already wrapped for UI)
    finalOutput = buildFinalJSON(subject, stops, geocoded, route);

  } catch (err) {
    console.error("Route build failed:", err);

    // Fallback wrapper so UI still works
    finalOutput = {
      id: subject.replace(/[^a-z0-9\-]+/gi, "_"),
      name: subject,
      data: {
        stops,
        route: { error: err.message }
      }
    };
  }

  // Display JSON in UI
  document.getElementById("output").textContent =
    JSON.stringify(finalOutput, null, 2);

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
   FINAL JSON BUILDER (PWA-ready + UI wrapper)
---------------------------------------- */
export function buildFinalJSON(subject, parsedStops, geocoded, orsRoute) {
  // 1. Normalize stops into a clean structure
  const stops = parsedStops.map((step, i) => {
    const geo = geocoded[i];
    return {
      label: step.split(" - ")[0],        // "#1", "#2", etc.
      time: step.split(" - ")[1],         // "7:58 AM"
      address: geo.address,               // normalized address
      coords: geo.coords                  // snapped or raw coords
    };
  });

  // 2. Extract ORS summary
  const summary = {
    distance_meters: orsRoute.summary.distance,
    duration_seconds: orsRoute.summary.duration
  };

  // 3. Extract decoded geometry (already decoded in buildRoute)
  const geometry = orsRoute.geometry;

  // 4. Flatten ORS turn-by-turn steps into PWA-friendly TTS steps
  const tts_steps = orsRoute.steps.map((s, index) => ({
    id: index,
    instruction: s.instruction,
    coords: s.maneuver.location,
    distance: s.distance,
    duration: s.duration,
    is_arrival: s.type === 10,
    is_turn: [0,1,2,3,4,5,6,7,8].includes(s.type)
  }));

  // 5. Wrap in UI-ready structure
  const safeId = subject.replace(/[^a-z0-9\-]+/gi, "_");

  return {
    id: safeId,
    name: subject,
    data: {
      stops,
      route: {
        summary,
        geometry,
        tts_steps
      }
    }
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