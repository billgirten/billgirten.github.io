import { getAllRoutes, getRoute } from "./db.js";
import { clearWatch, watchPosition } from "./geolocation.js";
import { createNavigator } from "./navigation.js";
import { preloadRoutesIfNeeded } from "./preload.js";
import { isMuted, setMuted } from "./tts.js";
import {
    renderRouteList,
    setGeoStatus,
    setStatus,
    updateNavigationUI
} from "./ui.js";

let geoWatchId = null;
let navigatorInstance = null;
let activeRoute = null;

async function initServiceWorker() {
  if ("serviceWorker" in navigator) {
    try {
      await navigator.serviceWorker.register("/errands/service-worker.js");
    } catch (e) {
      console.warn("SW registration failed", e);
    }
  }
}

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
    navigatorInstance = createNavigator(fullRoute.steps, {
      proximityThresholdMeters: 20,
      autoSpeak: true
    });

    navigatorInstance.onUpdate((state) => {
      updateNavigationUI(state, activeRoute);
    });
  });

  setStatus("Ready.");

  // Setup repeat button
  const repeatBtn = document.getElementById("repeat-btn");
  if (repeatBtn) {
    repeatBtn.addEventListener("click", () => {
      if (navigatorInstance) {
        navigatorInstance.repeat();
      }
    });
  }

  // Mute toggle
  const muteBtn = document.getElementById("mute-btn");
  if (muteBtn) {
    muteBtn.addEventListener("click", () => {
      const newMuted = !isMuted();
      setMuted(newMuted);
      muteBtn.textContent = newMuted ? "Unmute TTS" : "Mute TTS";
    });
  }

  // Start geolocation
  geoWatchId = watchPosition(
    (pos) => {
      setGeoStatus(
        `Lat: ${pos.lat.toFixed(5)}, Lng: ${pos.lng.toFixed(
          5
        )} (±${Math.round(pos.accuracy)}m)`
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

window.addEventListener("load", () => {
  initApp();
});

window.addEventListener("beforeunload", () => {
  if (geoWatchId != null) {
    clearWatch(geoWatchId);
  }
});