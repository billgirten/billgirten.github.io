import { getAllRoutes, getRoute } from "./db.js";
import { clearWatch, watchPosition } from "./geolocation.js";
import { createNavigator } from "./navigation.js";
import { preloadRoutesIfNeeded } from "./preload.js";
import { isMuted, setMuted } from "./tts.js";
import {
  renderRouteList,
  setGeoStatus,
  setStatus,
  updateNavigationUI,
} from "./ui.js";

let geoWatchId = null;
let navigatorInstance = null;
let activeRoute = null;
let deferredPrompt = null;

/* -------------------------------------------------------
   INSTALL PROMPT HANDLING (Android Chrome)
------------------------------------------------------- */
window.addEventListener("beforeinstallprompt", (e) => {
  // Prevent Chrome from showing its automatic banner
  e.preventDefault();
  deferredPrompt = e;

  const installBtn = document.getElementById("install-btn");
  if (installBtn) installBtn.style.display = "inline-block";
});

export function installPWA() {
  if (!deferredPrompt) return;

  deferredPrompt.prompt();

  deferredPrompt.userChoice.then(() => {
    deferredPrompt = null;

    const installBtn = document.getElementById("install-btn");
    if (installBtn) installBtn.style.display = "none";
  });
}

/* -------------------------------------------------------
   SERVICE WORKER
------------------------------------------------------- */
async function initServiceWorker() {
  if ("serviceWorker" in navigator) {
    try {
      await navigator.serviceWorker.register("/errands/service-worker.js");
    } catch (e) {
      console.warn("SW registration failed", e);
    }
  }
}

/* -------------------------------------------------------
   MAIN APP INITIALIZATION
------------------------------------------------------- */
async function initApp() {
  setStatus("Initializing…");

  await initServiceWorker();

  // Preload routes from static JSON into IndexedDB
  await preloadRoutesIfNeeded();

  const routes = await getAllRoutes();
  renderRouteList(routes, async (routeMeta) => {
    const fullRoute = await getRoute(routeMeta.id);
    if (!fullRoute) return;
    activeRoute = fullRoute;
    navigatorInstance = createNavigator(fullRoute.data.route.tts_steps, {
      proximityThresholdMeters: 20,
      autoSpeak: true,
    });

    navigatorInstance.onUpdate((state) => {
      updateNavigationUI(state, activeRoute);
    });
  });

  setStatus("Ready.");

  /* -------------------------------------------------------
     BUTTON: Repeat instruction
  ------------------------------------------------------- */
  const repeatBtn = document.getElementById("repeat-btn");
  if (repeatBtn) {
    repeatBtn.addEventListener("click", () => {
      if (navigatorInstance) navigatorInstance.repeat();
    });
  }

  /* -------------------------------------------------------
     BUTTON: Mute / Unmute TTS
  ------------------------------------------------------- */
  const muteBtn = document.getElementById("mute-btn");
  if (muteBtn) {
    muteBtn.addEventListener("click", () => {
      const newMuted = !isMuted();
      setMuted(newMuted);
      muteBtn.textContent = newMuted ? "Unmute TTS" : "Mute TTS";
    });
  }

  /* -------------------------------------------------------
     BUTTON: Install PWA (recommended wiring)
  ------------------------------------------------------- */
  const installBtn = document.getElementById("install-btn");
  if (installBtn) {
    installBtn.addEventListener("click", installPWA);
  }

  /* -------------------------------------------------------
     START: Geolocation tracking
  ------------------------------------------------------- */
  geoWatchId = watchPosition(
    (pos) => {
      setGeoStatus(
        `Lat: ${pos.lat.toFixed(5)}, Lng: ${pos.lng.toFixed(5)} (±${Math.round(
          pos.accuracy
        )}m)`
      );

      if (navigatorInstance) {
        navigatorInstance.updatePosition(pos);
      }
    },
    (err) => {
      console.error(err);
      setGeoStatus(`Geolocation error: ${err.message}`);
    }
  );
}

/* -------------------------------------------------------
   LIFECYCLE EVENTS
------------------------------------------------------- */
window.addEventListener("load", () => {
  initApp();
});

window.addEventListener("beforeunload", () => {
  if (geoWatchId != null) {
    clearWatch(geoWatchId);
  }
});
