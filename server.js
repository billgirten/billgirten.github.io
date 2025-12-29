import dotenv from "dotenv";
import express from "express";
import fetch from "node-fetch";

dotenv.config();

const app = express();

/* ------------------
   GEOCODE ENDPOINT
--------------------- */
app.get("/geocode", async (req, res) => {
  const address = req.query.address;
  if (!address) {
    return res.status(400).json({ error: "Missing address parameter" });
  }

  try {
    // 1. LocationIQ Geocoding
    const liqUrl = `https://us1.locationiq.com/v1/search?key=${
      process.env.LOCATIONIQ_KEY
    }&q=${encodeURIComponent(address)}&format=json&addressdetails=1&limit=1`;

    const liqResp = await fetch(liqUrl);
    const liqData = await liqResp.json();

    if (!Array.isArray(liqData) || liqData.length === 0) {
      return res.json({ address, coords: null });
    }

    const { lat, lon } = liqData[0];
    const rawCoords = [parseFloat(lon), parseFloat(lat)];

    // 2. ORS Snap-to-Road
    const snapUrl = "https://api.openrouteservice.org/v2/snap/driving-car";
    const snapResp = await fetch(snapUrl, {
      method: "POST",
      headers: {
        Authorization: `${process.env.ORS_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        coordinates: [rawCoords],
      }),
    });

    const snapData = await snapResp.json();

    const snapped = snapData?.locations?.[0]?.location;
    const finalCoords = snapped || rawCoords;

    res.json({
      address,
      coords: finalCoords,
    });
  } catch (err) {
    console.error("Geocode error:", err);
    res.status(500).json({ error: "Geocoding failed" });
  }
});

/* -----------------------------
   ROUTE ENDPOINT (ORS Directions)
------------------------------ */
// app.get("/route", async (req, res) => {
//   const coords = req.query.coords;
//   if (!coords) {
//     return res.status(400).json({ error: "Missing coords" });
//   }

//   const pairs = coords.split("|").map((pair) => {
//     const [lng, lat] = pair.split(",").map(Number);
//     return [lng, lat];
//   });

//   const url = "https://api.openrouteservice.org/v2/directions/driving-car";

//   try {
//     const orsRes = await fetch(url, {
//       method: "POST",
//       headers: {
//         Authorization: process.env.ORS_API_KEY,
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify({
//         coordinates: pairs,
//         instructions: true,
//         maneuvers: true,
//         preference: "recommended",
//         units: "m",
//         extra_info: ["waytype", "steepness"],
//       }),
//     });

//     const data = await orsRes.json();

//     if (!data?.routes?.length) {
//       console.error("ORS Directions returned no routes:", data);
//       return res.status(500).json({
//         error: "No route returned",
//         details: data
//       });
//     }

//     // console.log("ORS RESPONSE:", data);
//     return res.json(data);

//   } catch (err) {
//     console.error("ORS route failed:", err);
//     return res.status(500).json({
//       error: "ORS route failed",
//       details: err.message
//     });
//   }
// });

/* ------------------------------------
   ROUTE ENDPOINT (Valhalla Directions)
--------------------------------------- */
app.get("/route", async (req, res) => {
  const coords = req.query.coords;
  if (!coords) {
    return res.status(400).json({ error: "Missing coords" });
  }

  // coords arrives as: "-76.09,39.61|-76.10,39.67|..."
  const pairs = coords.split("|").map(pair => {
    const [lng, lat] = pair.split(",").map(Number);
    return { lon: lng, lat: lat, type: "break" };
  });

  const url = `https://api.stadiamaps.com/route/v1?api_key=${process.env.STADIA_API_KEY}`;

  const body = {
    locations: pairs,
    costing: "auto",
    costing_options: {
      auto: { use_highways: 0.3 }
    },
    units: "miles"
  };

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      const text = await response.text().catch(() => "");
      return res.status(response.status).json({
        error: "Stadia routing failed",
        status: response.status,
        details: text
      });
    }

    const data = await response.json();
    res.json(data);

  } catch (err) {
    res.status(500).json({
      error: "Server routing error",
      details: err.message
    });
  }
});

async function routeWithStadia(coords) {
  const url = `https://api.stadiamaps.com/route/v1?api_key=${process.env.STADIA_API_KEY}`;

  const body = {
    locations: coords.map(([lng, lat]) => ({
      lon: lng,
      lat,
      type: "break",
    })),
    costing: "auto",
    costing_options: {
      auto: {
        use_highways: 0.3,
      },
    },
    units: "miles",
    // Optionally:
    // format: "osrm", // if you want OSRM-style maneuvers
  };

console.log("3. Inside routeWithStadia");
console.log("4. About to call fetch...");

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
console.log("5. Fetch sent");
console.log("6. Fetch returned:", res.status);

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    console.error("Stadia response:", res.status, text);
    throw new Error(`Stadia routing failed: ${res.status}`);
  }

  return res.json();
}

/* -----------------------------
   SNAP-TO-ROAD HELPER
------------------------------ */
async function snapToRoad([lng, lat]) {
  try {
    const url = `https://api.openrouteservice.org/v2/snap/driving-car?point=${lat},${lng}`;

    const res = await fetch(url, {
      headers: {
        Authorization: process.env.ORS_API_KEY,
        "Content-Type": "application/json",
      },
    });

    const data = await res.json();
    const snapped = data?.snapped_point?.coordinates;

    return snapped || [lng, lat];
  } catch (err) {
    console.error("Snap-to-road error:", err);
    return [lng, lat]; // fallback
  }
}

async function snapWithStadia(coords) {
  const url = `https://api.stadiamaps.com/trace_route/v1/driving?api_key=${process.env.STADIA_API_KEY}`;

  const body = {
    shape: coords.map(([lng, lat]) => ({ lon: lng, lat })),
  };

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) throw new Error(`Snap failed: ${res.status}`);
  return res.json();
}

/* -----------------------------
   START SERVER
------------------------------ */
app.listen(3001, () => {
  console.log("ORS Proxy running at http://localhost:3001");
});
