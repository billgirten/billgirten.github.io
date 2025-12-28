// -----------------------------
// SUBJECT EXTRACTION
// -----------------------------
export function extractSubject(raw) {
  const match = raw.match(/^Subject:\s*(.*)$/m);
  return match ? match[1].trim() : "Route";
}

// -----------------------------
// STOPS EXTRACTION
// -----------------------------
export function extractNumberedStops(raw) {
  const lines = raw.split(/\r?\n/);
  return lines
    .map((line) => line.trim())
    .filter((line) => /^#\d+/.test(line));
}

// -----------------------------
// ADDRESS EXTRACTION
// -----------------------------
export function extractAddresses(stops) {
  return stops
    .map((stop) => {
      const parts = stop.split(" - ");
      if (parts.length < 3) return null;
      return parts.slice(2).join(" - ").trim();
    })
    .filter(Boolean);
}

// -----------------------------
// ADDRESS NORMALIZATION
// -----------------------------
function normalizeAddress(addr) {
  let clean = addr
    .replace(/\(.*?\)/g, "")        // remove notes
    .replace(/@/g, " and ")         // replace @
    .replace(/\s+/g, " ")           // collapse spaces
    .trim();

  clean = clean.replace(/\b([A-Z])([A-Z]+)\b/g, (_, first, rest) =>
    first + rest.toLowerCase()
  );
  return clean;
}

// -----------------------------
// GEOCODING (via tiny server)
// -----------------------------
export async function geocodeAddress(address) {
  const clean = normalizeAddress(address);
  const url = `http://localhost:3001/geocode?address=${encodeURIComponent(clean)}`;

  const res = await fetch(url);
  return await res.json(); // { address, coords }
}

export async function geocodeAddresses(addresses) {
  const results = [];
  for (const address of addresses) {
    const geo = await geocodeAddress(address);
    results.push(geo);
  }
  return results;
}

// -----------------------------
// POLYLINE DECODING
// -----------------------------
export function decodePolyline(encoded) {
  let points = [];
  let index = 0,
    lat = 0,
    lng = 0;

  while (index < encoded.length) {
    let b,
      shift = 0,
      result = 0;

    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);

    let dlat = result & 1 ? ~(result >> 1) : result >> 1;
    lat += dlat;

    shift = 0;
    result = 0;

    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);

    let dlng = result & 1 ? ~(result >> 1) : result >> 1;
    lng += dlng;

    points.push([lng / 1e5, lat / 1e5]);
  }

  return points;
}