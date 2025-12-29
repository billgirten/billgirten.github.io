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
