import {
    extractAddresses,
    extractNumberedSteps,
    geocodeAddresses
} from './parser.js';

document.getElementById("emlInput").addEventListener("change", async (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const raw = await file.text();

  // Phase 1
  const steps = extractNumberedSteps(raw);

  // Phase 2
  const addresses = extractAddresses(steps);

  // Phase 3
  const geocoded = await geocodeAddresses(addresses);

  document.getElementById("output").textContent =
    JSON.stringify({ steps, addresses, geocoded }, null, 2);
});

