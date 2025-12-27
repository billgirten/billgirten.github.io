export function extractSubject(raw) {
  const match = raw.match(/^Subject:\s*(.*)$/m);
  return match ? match[1].trim() : "Route";
}

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

export function decodePolyline(encoded) {
  let points = [];
  let index = 0, lat = 0, lng = 0;

  while (index < encoded.length) {
    let b, shift = 0, result = 0;
    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);

    let dlat = (result & 1) ? ~(result >> 1) : (result >> 1);
    lat += dlat;

    shift = 0;
    result = 0;

    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);

    let dlng = (result & 1) ? ~(result >> 1) : (result >> 1);
    lng += dlng;

    points.push([lng / 1e5, lat / 1e5]);
  }

  return points;
}