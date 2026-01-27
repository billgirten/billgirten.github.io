import {
  extractAddresses,
  extractNumberedStops,
  extractSubject,
  geocodeAddresses,
} from "./parser.js";

import { humanizeGoogleTTS } from "./humanize-google.js";
import { convertGoogleToTTS } from "./tts-google.js";

/* ============================================================
   MAIN FILE INPUT HANDLER
============================================================ */
document.getElementById("emlInput").addEventListener("change", async (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const raw = await file.text();
  const subject = extractSubject(raw);

  const parsedStops = extractNumberedStops(raw);
  const addresses = extractAddresses(parsedStops);
  const geocoded = await geocodeAddresses(addresses);

  let route = null;
  let finalOutput = null;

  try {
    console.log("GEOCODED BEFORE ROUTE:", geocoded);
    route = await buildRoute(geocoded, parsedStops); // Google Directions → TTS
    finalOutput = buildFinalJSON(subject, parsedStops, geocoded, route);
  } catch (err) {
    console.error("Route build failed:", err);

    finalOutput = {
      id: subject.replace(/[^a-z0-9\-]+/gi, "_"),
      name: subject,
      data: {
        stops: parsedStops,
        route: { error: err.message },
      },
    };
  }

  document.getElementById("output").textContent = JSON.stringify(
    finalOutput,
    null,
    2
  );

  const safeName = subject.replace(/[^a-z0-9\-]+/gi, "_");
  saveJSON(finalOutput, `${safeName}.json`);
});

/* ============================================================
   BUILD ROUTE (Google Directions)
============================================================ */
export async function buildRoute(geocoded, parsedStops) {
  const valid = geocoded.filter(g => g.coords !== null);

  if (valid.length < 2) {
    throw new Error("Not enough valid coordinates to build a route.");
  }

  // ------------------------------------------------------------
  // 1. Chunk coordinates into groups of ≤ 25 waypoints
  // ------------------------------------------------------------
  const CHUNK_LIMIT = 25; // Google max waypoints
  const chunks = [];

  for (let i = 0; i < valid.length; i += CHUNK_LIMIT) {
    const slice = valid.slice(i, i + CHUNK_LIMIT + 1);

    // Ensure overlap: last point of previous chunk = first of next
    if (i > 0) {
      slice.unshift(valid[i - 1]);
    }

    chunks.push(slice);
  }

  // ------------------------------------------------------------
  // 2. Fetch Google Directions for each chunk
  // ------------------------------------------------------------
  const segmentResults = [];

  for (const coordsChunk of chunks) {
    const res = await fetch("http://localhost:3001/route", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ coords: coordsChunk.map(g => g.coords) })
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(
        `Routing failed: ${res.status}${text ? ` - ${text}` : ""}`
      );
    }

    const googleJson = await res.json();
    segmentResults.push(googleJson);
  }

  // ------------------------------------------------------------
  // 3. Convert each Google segment → TTS steps
  // ------------------------------------------------------------
  const allRawSteps = [];
  const allGeometry = [];
  let totalDistance = 0;
  let totalDuration = 0;

  for (const segment of segmentResults) {
    const leg = segment.routes[0].legs[0];

    totalDistance += leg.distance.value;
    totalDuration += leg.duration.value;

    // Geometry
    const geom = decodeGooglePolyline(segment.routes[0].overview_polyline.points);
    allGeometry.push(...geom);

    // Raw TTS steps
    const rawSteps = convertGoogleToTTS(segment);
    allRawSteps.push(...rawSteps);
  }

  // ------------------------------------------------------------
  // 4. Build final stop objects
  // ------------------------------------------------------------
  const finalStops = parsedStops.map((step, i) => ({
    label: step.split(" - ")[0],
    address: geocoded[i]?.address ?? "",
    coords: geocoded[i]?.coords ?? null
  }));

  // ------------------------------------------------------------
  // 5. Humanize TTS steps
  // ------------------------------------------------------------
  const tts_steps = humanizeGoogleTTS(allRawSteps, finalStops);

  // ------------------------------------------------------------
  // 6. Final merged route object
  // ------------------------------------------------------------
  return {
    summary: {
      distance_meters: totalDistance,
      distance_miles: totalDistance / 1609.34,
      duration_seconds: totalDuration
    },
    geometry: allGeometry,
    tts_steps
  };
}

/* ============================================================
   DECODE GOOGLE POLYLINE
============================================================ */
function decodeGooglePolyline(encoded) {
  const decoded = polyline.decode(encoded); // [lat, lng]
  return decoded.map(([lat, lng]) => [lng, lat]); // convert to [lng, lat]
}

/* ============================================================
   FINAL JSON BUILDER
============================================================ */
export function buildFinalJSON(subject, parsedStops, geocoded, route) {
  const stops = parsedStops.map((step, i) => {
    const geo = geocoded[i];
    return {
      label: step.split(" - ")[0],
      time: step.split(" - ")[1],
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
        summary: route.summary,
        geometry: route.geometry,
        tts_steps: route.tts_steps,
      },
    },
  };
}

/* ============================================================
   SAVE JSON FILE
============================================================ */
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