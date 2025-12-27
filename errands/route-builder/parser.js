export function extractNumberedSteps(raw) {
  const lines = raw.split(/\r?\n/);

  return lines
    .map(line => line.trim())
    .filter(line => /^#\d+/.test(line));
}

export function extractAddresses(steps) {
  return steps
    .map(step => {
      const parts = step.split(" - ");
      if (parts.length < 3) return null;

      return parts.slice(2).join(" - ").trim();
    })
    .filter(Boolean);
}

export async function geocodeAddress(address) {
  const url = `http://localhost:3001/geocode?address=${encodeURIComponent(address)}`;

  const res = await fetch(url);
  if (!res.ok) return null;

  const data = await res.json();
  const feature = data.features?.[0];
  if (!feature) return null;

  return {
    address,
    coords: feature.geometry.coordinates
  };
}

export async function geocodeAddresses(addresses) {
  const results = [];

  for (const addr of addresses) {
    const result = await geocodeAddress(addr);
    results.push(result);
  }

  return results;
}