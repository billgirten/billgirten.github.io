import dotenv from "dotenv";
import express from "express";
import fetch from "node-fetch";

dotenv.config();

const app = express();

app.get("/geocode", async (req, res) => {
  const address = req.query.address;
  if (!address) return res.status(400).json({ error: "Missing address" });

  const url = `https://api.openrouteservice.org/geocode/search?api_key=${process.env.ORS_API_KEY}&text=${encodeURIComponent(address)}`;

  try {
    const orsRes = await fetch(url);
    const raw = await orsRes.text();

    console.log("RAW ORS RESPONSE:", raw);

    let data;
    try {
      data = JSON.parse(raw);
    } catch (err) {
      console.error("JSON parse failed:", err);
      return res.status(500).json({ error: "ORS returned non-JSON", raw });
    }

    res.json(data);
  } catch (err) {
    res.status(500).json({ error: "Fetch failed", details: err.message });
  }
});

app.get("/route", async (req, res) => {
  const coords = req.query.coords;
  if (!coords) return res.status(400).json({ error: "Missing coords" });

  // coords arrives as: "-76.09,39.61|-76.10,39.67|..."
  const pairs = coords.split("|").map(pair => {
    const [lng, lat] = pair.split(",").map(Number);
    return [lng, lat];
  });

  const url = "https://api.openrouteservice.org/v2/directions/driving-car";

  try {
    const orsRes = await fetch(url, {
      method: "POST",
      headers: {
        "Authorization": process.env.ORS_API_KEY,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ coordinates: pairs })
    });

    const data = await orsRes.json();
    res.json(data);

  } catch (err) {
    res.status(500).json({ error: "ORS route failed", details: err.message });
  }
});

app.listen(3001, () => {
  console.log("ORS Proxy running at http://localhost:3001");
});
