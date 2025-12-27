import dotenv from "dotenv";
import express from "express";
import fetch from "node-fetch";

dotenv.config();

const app = express();

/* -----------------------------
   GEOCODE ENDPOINT (ORS Search)
------------------------------ */
app.get("/geocode", async (req, res) => {
  try {
    const address = req.query.address;
    if (!address) {
      return res.status(400).json({ error: "Missing address" });
    }

    const url = `https://api.openrouteservice.org/geocode/search?api_key=${process.env.ORS_API_KEY}&text=${encodeURIComponent(address)}&size=1`;

    let orsRes;
    try {
      orsRes = await fetch(url);
    } catch (err) {
      console.error("ORS geocoder fetch failed:", err);
      return res.status(500).json({ error: "ORS geocoder request failed" });
    }

    let data;
    try {
      data = await orsRes.json();
    } catch (err) {
      console.error("Failed to parse ORS geocoder JSON:", err);
      return res.status(500).json({ error: "Invalid ORS geocoder response" });
    }

    const first = data?.features?.[0];
    if (!first) {
      console.warn("ORS geocoder returned no results for:", address);
      return res.json({ address, coords: null });
    }

    const [lng, lat] = first.geometry.coordinates;

    // Snap to road
    let snapped;
    try {
      snapped = await snapToRoad([lng, lat]);
    } catch (err) {
      console.error("Snap-to-road failed:", err);
      snapped = [lng, lat]; // fallback
    }

    return res.json({
      address,
      coords: snapped
    });

  } catch (err) {
    console.error("Unexpected /geocode error:", err);
    return res.status(500).json({ error: "Unexpected server error" });
  }
});

/* -----------------------------
   ROUTE ENDPOINT (ORS Directions)
------------------------------ */
app.get("/route", async (req, res) => {
  const coords = req.query.coords;
  if (!coords) {
    return res.status(400).json({ error: "Missing coords" });
  }

  const pairs = coords.split("|").map((pair) => {
    const [lng, lat] = pair.split(",").map(Number);
    return [lng, lat];
  });

  const url = "https://api.openrouteservice.org/v2/directions/driving-car";

  try {
    const orsRes = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: process.env.ORS_API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        coordinates: pairs,
        instructions: true,
        maneuvers: true,
        preference: "recommended",
        units: "m",
        extra_info: ["waytype", "steepness"],
      }),
    });

    const data = await orsRes.json();

    if (!data?.routes?.length) {
      console.error("ORS Directions returned no routes:", data);
      return res.status(500).json({
        error: "No route returned",
        details: data
      });
    }

    console.log("ORS RESPONSE:", data);
    return res.json(data);

  } catch (err) {
    console.error("ORS route failed:", err);
    return res.status(500).json({
      error: "ORS route failed",
      details: err.message
    });
  }
});

/* -----------------------------
   SNAP-TO-ROAD HELPER
------------------------------ */
async function snapToRoad([lng, lat]) {
  try {
    const url = `https://api.openrouteservice.org/v2/snap/driving-car?point=${lat},${lng}`;

    const res = await fetch(url, {
      headers: {
        "Authorization": process.env.ORS_API_KEY,
        "Content-Type": "application/json"
      }
    });

    const data = await res.json();
    const snapped = data?.snapped_point?.coordinates;

    return snapped || [lng, lat];
  } catch (err) {
    console.error("Snap-to-road error:", err);
    return [lng, lat]; // fallback
  }
}

/* -----------------------------
   START SERVER
------------------------------ */
app.listen(3001, () => {
  console.log("ORS Proxy running at http://localhost:3001");
});