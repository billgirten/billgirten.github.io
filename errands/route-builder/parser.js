// -----------------------------
// SUBJECT EXTRACTION
// -----------------------------
export function extractSubject(raw) {
  const match = raw.match(/^Subject:\s*(.+)$/m);
  return match ? match[1].trim() : "Untitled Route";
}

// -----------------------------
// STOPS EXTRACTION
// -----------------------------
export function extractNumberedStops(raw) {
  // Split header and body at the first blank line
  const parts = raw.split(/\r?\n\r?\n/);
  const body = parts[1] || raw;

  return body
    .split(/\r?\n/)
    .map(line => line.trim())
    .filter(line => /^#\d+\s*-/.test(line));
}

// -----------------------------
// ADDRESS EXTRACTION
// -----------------------------
export function extractAddresses(stops) {
  return stops.map(stop => {
    const parts = stop.split(" - ");
    return parts[1] ? parts[1].trim() : stop.trim();
  });
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

  try {
    const res = await fetch(url);

    if (!res.ok) {
      console.error("Geocode failed:", clean, res.status);
      return { address: clean, coords: null };
    }

    const data = await res.json();

    // Validate coords
    if (
      !data ||
      !Array.isArray(data.coords) ||
      data.coords.length !== 2 ||
      !Number.isFinite(data.coords[0]) ||
      !Number.isFinite(data.coords[1])
    ) {
      console.warn("Invalid coords from server:", clean, data);
      return { address: clean, coords: null };
    }

    return data;

  } catch (err) {
    console.error("Geocode error:", clean, err);
    return { address: clean, coords: null };
  }
}


// -----------------------------
// PARALLEL GEOCODING (FAST + STABLE)
// -----------------------------
function delay(ms) {
  return new Promise(res => setTimeout(res, ms));
}

export async function geocodeAddresses(addresses) {
  const results = [];

  for (const address of addresses) {
    const geo = await geocodeAddress(address);
    results.push(geo);

    // Respect LocationIQ rate limit
    await delay(1000);
  }

  return results;
}
