import dotenv from "dotenv";
import express from "express";
import fetch from "node-fetch";

dotenv.config();

const app = express();

// REQUIRED for JSON POST bodies
app.use(express.json());

// CORS (you already added this)
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "http://127.0.0.1:5500");
  res.header("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.sendStatus(200);
  next();
});

/* ============================================================
   GEOCODE ENDPOINT (Google Geocoding API)
   ------------------------------------------------------------
   - Input: address string
   - Output: { lat, lng }
   - No snapping needed
============================================================ */
app.get("/geocode", async (req, res) => {
  const address = req.query.address;
  if (!address) {
    return res.status(400).json({ error: "Missing address parameter" });
  }

  try {
    const url =
      `https://maps.googleapis.com/maps/api/geocode/json?address=` +
      encodeURIComponent(address) +
      `&key=${process.env.GOOGLE_MAPS_API_KEY}`;

    const geoResp = await fetch(url);
    const geoData = await geoResp.json();

    console.log("Google Geocode raw:", geoData);

    if (!geoData.results || geoData.results.length === 0) {
      return res.json({ address, coords: null });
    }

    const { lat, lng } = geoData.results[0].geometry.location;

    res.json({
      address,
      coords: [lng, lat], // your app expects [lng, lat]
    });

  } catch (err) {
    console.error("Google geocode error:", err);
    res.status(500).json({ error: "Geocoding failed" });
  }
});

/* ============================================================
   ROUTE ENDPOINT (Google Directions API)
   ------------------------------------------------------------
   - Input: { coords: [[lng, lat], [lng, lat], ...] }
   - Output: Raw Google Directions JSON
   - Uses driving mode, imperial units
============================================================ */
app.post("/route", async (req, res) => {
  const coords = req.body.coords;

  if (!coords || !Array.isArray(coords) || coords.length < 2) {
    return res.status(400).json({ error: "Missing or invalid coords" });
  }

  console.log("REQ BODY /route:", req.body);

  try {
    const data = await routeWithGoogle(coords); // coords: [[lng, lat], ...]
    res.json(data);
  } catch (err) {
    console.error("Google route error:", err);
    res.status(500).json({ error: "Google routing failed" });
  }
});

/* ============================================================
   HELPER: Routing via Google Directions API
============================================================ */
async function routeWithGoogle(coords) {
  // coords are [[lng, lat], ...], but Google wants "lat,lng"
  const toLatLng = ([lng, lat]) => `${lat},${lng}`;

  const origin = toLatLng(coords[0]);
  const destination = toLatLng(coords[coords.length - 1]);

  // Any points between first and last become waypoints
  const waypointCoords = coords.slice(1, -1);
  const waypoints =
    waypointCoords.length > 0
      ? waypointCoords.map(toLatLng).join("|")
      : null;

  const baseUrl = "https://maps.googleapis.com/maps/api/directions/json";

  const params = new URLSearchParams({
    origin,
    destination,
    mode: "driving",
    units: "imperial",
    key: process.env.GOOGLE_MAPS_API_KEY,
  });

  if (waypoints) {
    // If you want Google to preserve order, leave as-is.
    // If you want optimized order, prepend "optimize:true|".
    params.append("waypoints", waypoints);
    // For optimization instead:
    // params.append("waypoints", "optimize:true|" + waypoints);
  }

  const url = `${baseUrl}?${params.toString()}`;

  const resp = await fetch(url);
  const json = await resp.json();

  console.log("=== RAW GOOGLE DIRECTIONS RESPONSE START ===");
  console.log(JSON.stringify(json, null, 2));
  console.log("=== RAW GOOGLE DIRECTIONS RESPONSE END ===");

  // Basic sanity check
  if (json.status !== "OK") {
    throw new Error(`Google Directions error: ${json.status} (${json.error_message || "no message"})`);
  }

  return json;
}

/* ============================================================
   START SERVER
============================================================ */
app.listen(3001, () => {
  console.log(
    "Tiny server running at http://localhost:3001 (Google routing enabled)"
  );
});
