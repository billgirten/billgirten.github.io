import {
    decodePolyline,
    extractAddresses,
    extractNumberedSteps,
    extractSubject,
    geocodeAddresses,
} from "./parser.js";

document.getElementById("emlInput").addEventListener("change", async (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const raw = await file.text();

  const subject = extractSubject(raw);

  // Phase 1
  const steps = extractNumberedSteps(raw);

  // Phase 2
  const addresses = extractAddresses(steps);

  // Phase 3
  const geocoded = await geocodeAddresses(addresses);

  // Phase 4
  const route = await buildRoute(geocoded);

  // Final output
  const finalOutput = {
    steps,
    addresses,
    geocoded,
    route,
  };

  // Show pretty JSON in UI
  document.getElementById("output").textContent = JSON.stringify(
    finalOutput,
    null,
    2
  );

  // Safe filename
  const safeName = subject.replace(/[^a-z0-9\-]+/gi, "_");

  // Save RAW object (server or download)
  saveJSON(finalOutput, `${safeName}.json`);
});

async function buildRoute(geocoded) {
  const coordString = geocoded.map((g) => g.coords.join(",")).join("|");

  const url = `http://localhost:3001/route?coords=${encodeURIComponent(
    coordString
  )}`;

  const res = await fetch(url);
  const data = await res.json();

  const encoded = data.routes[0].geometry;
  const decoded = decodePolyline(encoded);

  return {
    summary: data.routes[0].summary,
    geometry: decoded,
  };
}

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
