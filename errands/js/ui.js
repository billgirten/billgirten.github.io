/* ---------------------------------------
   STATUS HELPERS
---------------------------------------- */
export function setStatus(text) {
  const el = document.getElementById("status");
  if (el) el.textContent = text || "";
}

export function setGeoStatus(text) {
  const el = document.getElementById("geo-status");
  if (el) el.textContent = text || "";
}

/* ---------------------------------------
   ROUTE LIST RENDERING (UPDATED FOR NEW FORMAT)
---------------------------------------- */
export function renderRouteList(routes, onSelectRoute) {
  const container = document.getElementById("routes-container");
  if (!container) return;

  container.innerHTML = "";

  if (!routes || routes.length === 0) {
    container.innerHTML = '<p class="status">No routes available.</p>';
    return;
  }

  const select = document.createElement("select");
  select.className = "route-select";
  select.size = 1;

  // Placeholder
  const placeholder = document.createElement("option");
  placeholder.textContent = "Select a route…";
  placeholder.value = "";
  select.appendChild(placeholder);

  // Add all route options
  routes.forEach((route) => {
    const opt = document.createElement("option");
    opt.value = route.id;

    // NEW: read distance from wrapped JSON
    const meters = route.data?.route?.summary?.distance_meters ?? 0;
    const km = (meters / 1000).toFixed(1);

    // NEW: name fallback
    const displayName = route.name || route.id || "Unnamed Route";

    opt.textContent = `${displayName} (${km} km)`;
    select.appendChild(opt);
  });

  container.appendChild(select);

  /* ---------------------------------------
     AUTO‑OPEN + FILTER ON TYPING
  ---------------------------------------- */
  let typingTimer = null;
  let filterText = "";

  select.addEventListener("keydown", (e) => {
    if (["ArrowUp", "ArrowDown", "Enter"].includes(e.key)) return;

    if (e.key.length === 1) {
      filterText += e.key.toLowerCase();
    } else if (e.key === "Backspace") {
      filterText = filterText.slice(0, -1);
    }

    select.size = 6;

    Array.from(select.options).forEach((opt, index) => {
      if (index === 0) return;
      const match = opt.textContent.toLowerCase().includes(filterText);
      opt.style.display = match ? "block" : "none";
    });

    clearTimeout(typingTimer);
    typingTimer = setTimeout(() => {
      filterText = "";
      select.size = 1;
      Array.from(select.options).forEach((opt) => (opt.style.display = "block"));
    }, 800);
  });

  /* ---------------------------------------
     SELECT HANDLER
  ---------------------------------------- */
  select.addEventListener("change", () => {
    const selected = routes.find((r) => r.id === select.value);
    if (selected) onSelectRoute(selected);
  });
}

/* ---------------------------------------
   NAVIGATION UI (UPDATED FOR NEW FORMAT)
---------------------------------------- */
export function updateNavigationUI(state, activeRoute) {
  const nameEl = document.getElementById("route-name");
  const stepIndexEl = document.getElementById("step-index");
  const stepTotalEl = document.getElementById("step-total");
  const currentEl = document.getElementById("current-instruction");
  const upcomingEl = document.getElementById("upcoming-instruction");
  const repeatBtn = document.getElementById("repeat-btn");

  // NEW: route name fallback
  if (nameEl) nameEl.textContent = activeRoute ? (activeRoute.name || activeRoute.id) : "None";

  // NEW: total steps from tts_steps
  const steps = activeRoute?.data?.route?.tts_steps ?? [];
  if (stepIndexEl) stepIndexEl.textContent = state.index + 1;
  if (stepTotalEl) stepTotalEl.textContent = steps.length;

  // NEW: current instruction
  if (currentEl)
    currentEl.textContent =
      state.currentInstruction || "Waiting for instruction…";

  // NEW: upcoming instruction
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