import { countRoutes, saveRoute } from "./db.js";

export async function preloadRoutesIfNeeded() {
  const existing = await countRoutes();
  if (existing > 0) return;

  const indexRes = await fetch("/errands/routes/index.json");
  if (!indexRes.ok) return;
  const routeIds = await indexRes.json();

  for (const id of routeIds) {
    const res = await fetch(`/errands/routes/${id}.json`);
    if (!res.ok) continue;
    const data = await res.json();
    await saveRoute({
      id,
      ...data
    });
  }
}