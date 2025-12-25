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

  // Searchable select
  const select = document.createElement("select");
  select.className = "route-select";
  select.size = 1; // collapsed by default

  // Placeholder
  const placeholder = document.createElement("option");
  placeholder.textContent = "Select a route…";
  placeholder.value = "";
  select.appendChild(placeholder);

  // Add all options
  routes.forEach((route) => {
    const opt = document.createElement("option");
    opt.value = route.id;
    opt.textContent = `${route.name} (${(route.totalDistance / 1000).toFixed(1)} km)`;
    select.appendChild(opt);
  });

  container.appendChild(select);

  /* -------------------------------------------------------
     AUTO‑OPEN + FILTER ON TYPING
  ------------------------------------------------------- */
  let typingTimer = null;
  let filterText = "";

  select.addEventListener("keydown", (e) => {
    // Ignore navigation keys
    if (["ArrowUp", "ArrowDown", "Enter"].includes(e.key)) return;

    // Build filter text
    if (e.key.length === 1) {
      filterText += e.key.toLowerCase();
    } else if (e.key === "Backspace") {
      filterText = filterText.slice(0, -1);
    }

    // Expand select to show up to 6 items
    select.size = 6;

    // Filter options
    Array.from(select.options).forEach((opt, index) => {
      if (index === 0) return; // keep placeholder
      const match = opt.textContent.toLowerCase().includes(filterText);
      opt.style.display = match ? "block" : "none";
    });

    // Reset collapse timer
    clearTimeout(typingTimer);
    typingTimer = setTimeout(() => {
      filterText = "";
      select.size = 1; // collapse back
      Array.from(select.options).forEach((opt) => (opt.style.display = "block"));
    }, 800);
  });

  /* -------------------------------------------------------
     SELECT HANDLER
  ------------------------------------------------------- */
  select.addEventListener("change", () => {
    const selected = routes.find((r) => r.id === select.value);
    if (selected) onSelectRoute(selected);
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
