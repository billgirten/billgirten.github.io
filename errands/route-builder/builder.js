import {
  extractAddresses,
  extractNumberedStops,
  extractSubject,
  geocodeAddresses,
} from "./parser.js";

/* ---------------------------------------
   VALHALLA → PWA TTS CONVERTER
---------------------------------------- */

export function convertValhallaToTTS(valhallaJson) {
  const trip = valhallaJson?.trip;
  if (!trip || !trip.legs || trip.legs.length === 0) {
    throw new Error("Invalid Valhalla response: missing trip legs");
  }

  const leg = trip.legs[0];

  // Decode the polyline geometry for the entire leg
  // Valhalla's shape is an encoded polyline string
  if (!leg.shape) {
    throw new Error("Invalid Valhalla response: missing leg.shape");
  }

  const shape = polyline.decode(leg.shape); // [ [lat, lng], ... ]

  const maneuvers = leg.maneuvers || [];
  const steps = maneuvers.map((m, index) => {
    const endIndex = m.end_shape_index;
    const coord = shape[endIndex];

    const instruction =
      m.verbal_pre_transition_instruction ||
      m.instruction ||
      "Continue";

    return {
      id: index,
      instruction,
      coords: coord ? [coord[1], coord[0]] : null, // [lng, lat]
      distance: (m.length ?? 0) * 1609.34,         // miles → meters
      duration: m.time ?? 0,                       // seconds
      is_turn: m.type >= 1 && m.type <= 15,
      is_arrival: m.type === 4,
    };
  });

  const summary = trip.summary || {};
  const totalDistanceMeters = (summary.length ?? 0) * 1609.34; // miles → meters
  const totalDurationSeconds = summary.time ?? 0;

  return {
    summary: {
      distance: totalDistanceMeters,
      duration: totalDurationSeconds,
    },
    geometry: shape.map(([lat, lng]) => [lng, lat]), // [lng, lat]
    tts_steps: steps,
  };
}

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

  // Phase 3 — Geocode (via tiny server → LocationIQ → whatever backend)
  const geocoded = await geocodeAddresses(addresses);

  // Phase 4 — Build route via Stadia/Valhalla through tiny server
  let route = null;
  let finalOutput = null;

  try {
    route = await buildRoute(geocoded); // returns { summary, geometry, tts_steps }

    finalOutput = buildFinalJSON(subject, stops, geocoded, route);
  } catch (err) {
    console.error("Route build failed:", err);

    finalOutput = {
      id: subject.replace(/[^a-z0-9\-]+/gi, "_"),
      name: subject,
      data: {
        stops,
        route: { error: err.message },
      },
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
   BUILD ROUTE (Stadia / Valhalla)
---------------------------------------- */

export async function buildRoute(geocoded) {
  // Filter out failed geocodes
  const valid = geocoded.filter((g) => g.coords !== null);

  if (valid.length < 2) {
    throw new Error("Not enough valid coordinates to build a route.");
  }

  // Build coordinate string for tiny server: "lng,lat|lng,lat|..."
  const coordString = valid
    .map((g) => g.coords.join(",")) // [lng, lat]
    .join("|");

    console.log('>>> ABOUT TO CALL tiny server');

  const url = `http://localhost:3001/route?coords=${encodeURIComponent(
    coordString
  )}`;

  const res = await fetch(url);
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(
      `Tiny server routing failed: ${res.status}${text ? ` - ${text}` : ""}`
    );
  }

  const valhalla = await res.json();

  // Normalize to PWA-friendly structure
  return convertValhallaToTTS(valhalla);
}

/* ---------------------------------------
   FINAL JSON BUILDER (PWA-ready + UI wrapper)
---------------------------------------- */

export function buildFinalJSON(subject, parsedStops, geocoded, route) {
  // route: { summary, geometry, tts_steps } from convertValhallaToTTS

  const stops = parsedStops.map((step, i) => {
    const geo = geocoded[i];
    return {
      label: step.split(" - ")[0],  // "#1", "#2", etc.
      time: step.split(" - ")[1],   // "7:58 AM"
      address: geo?.address ?? "",
      coords: geo?.coords ?? null,
    };
  });

  const safeId = subject.replace(/[^a-z0-9\-]+/gi, "_");

  return {
    id: safeId,
    name: subject,
    data: {
      stops,
      route: {
        summary: {
          distance_meters: route.summary.distance,
          duration_seconds: route.summary.duration,
        },
        geometry: route.geometry,
        tts_steps: route.tts_steps,
      },
    },
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