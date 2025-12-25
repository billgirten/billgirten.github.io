export function setStatus(text) {
  const el = document.getElementById("status");
  if (el) el.textContent = text || "";
}

export function setGeoStatus(text) {
  const el = document.getElementById("geo-status");
  if (el) el.textContent = text || "";
}

export function renderRouteList(routes, onSelectRoute) {
  const container = document.getElementById("routes-container");
  if (!container) return;

  container.innerHTML = "";

  if (!routes || routes.length === 0) {
    container.innerHTML = '<p class="status">No routes available.</p>';
    return;
  }

  routes.forEach((route) => {
    const btn = document.createElement("button");
    btn.className = "secondary-btn";
    btn.textContent = `${route.name} (${(route.totalDistance / 1000).toFixed(
      1
    )} km)`;
    btn.addEventListener("click", () => onSelectRoute(route));
    container.appendChild(btn);
  });
}

export function updateNavigationUI(state, activeRoute) {
  const nameEl = document.getElementById("route-name");
  const stepIndexEl = document.getElementById("step-index");
  const stepTotalEl = document.getElementById("step-total");
  const currentEl = document.getElementById("current-instruction");
  const upcomingEl = document.getElementById("upcoming-instruction");
  const repeatBtn = document.getElementById("repeat-btn");

  if (nameEl) nameEl.textContent = activeRoute ? activeRoute.name : "None";
  if (stepIndexEl) stepIndexEl.textContent = state.index + 1;
  if (stepTotalEl) stepTotalEl.textContent = state.totalSteps;
  if (currentEl)
    currentEl.textContent =
      state.currentInstruction || "Waiting for instruction…";

  if (upcomingEl) {
    upcomingEl.textContent =
      state.nextStep && !state.isFinished
        ? `Upcoming: ${state.nextStep.instruction}`
        : "";
  }

  if (repeatBtn) {
    repeatBtn.disabled = !state.currentInstruction || state.isFinished;
  }
}