import { haversine } from "./geo.js";
import { precacheInstructions, speak } from "./tts.js";

export function createNavigator(steps, options = {}) {
  const baseProximity = options.proximityThresholdMeters ?? 20;
  const autoSpeak = options.autoSpeak ?? true;

  // Convert Google coords [lng, lat] → { lat, lng }
  const normalizedSteps = (steps || []).map((s) => ({
    ...s,
    target: s.end ? { lat: s.end[1], lng: s.end[0] } : null,
  }));

  let index = 0;
  let finished = false;
  let currentInstruction = normalizedSteps?.[0]?.instruction || "";
  let listeners = [];

  if (normalizedSteps.length > 0) {
    precacheInstructions(normalizedSteps.map((s) => s.instruction));
    if (autoSpeak && currentInstruction) speak(currentInstruction);
  }

  function notify() {
    const state = getState();
    listeners.forEach((fn) => fn(state));
  }

  function getState() {
    return {
      index,
      isFinished: finished,
      currentInstruction,
      totalSteps: normalizedSteps.length,
      nextStep: normalizedSteps[index + 1] ? normalizedSteps[index + 1] : null,
    };
  }

  function onUpdate(fn) {
    listeners.push(fn);
    fn(getState());
    return () => {
      listeners = listeners.filter((l) => l !== fn);
    };
  }

  function updatePosition(position) {
    if (normalizedSteps.length === 0 || finished) return;

    const step = normalizedSteps[index];
    if (!step) {
      finished = true;
      currentInstruction = "Route completed.";
      speak("You have reached your final destination.");
      notify();
      return;
    }

    const target = step.target;
    if (!target) {
      currentInstruction = step.instruction;
      notify();
      return;
    }

    // Dynamic threshold
    const accuracy = position.accuracy ?? 15;
    const proximity = Math.max(baseProximity, accuracy * 1.5);

    const dist = haversine(position, target);

    // ------------------------------------------------------------
    // PASS-THROUGH LOGIC
    // ------------------------------------------------------------
    const next = normalizedSteps[index + 1];
    if (next) {
      const distToNext = haversine(position, next.target);

      if (distToNext < dist) {
        index++;
        currentInstruction = next.instruction;
        if (autoSpeak && currentInstruction) speak(currentInstruction);
        notify();
        return;
      }
    }

    // ------------------------------------------------------------
    // NORMAL PROXIMITY LOGIC
    // ------------------------------------------------------------
    if (dist <= proximity) {
      const nextIndex = index + 1;

      if (nextIndex >= normalizedSteps.length) {
        finished = true;
        currentInstruction = "Route completed.";
        speak("You have reached your final destination.");
      } else {
        index = nextIndex;
        currentInstruction = normalizedSteps[nextIndex].instruction;
        if (autoSpeak && currentInstruction) speak(currentInstruction);
      }

      notify();
    } else {
      currentInstruction = step.instruction;
      notify();
    }

    debugLog(
      `GPS: lat=${position.lat.toFixed(6)}, lng=${position.lng.toFixed(
        6
      )}, acc=${position.accuracy}`
    );

    debugLog(
      `Step ${index}: dist=${dist.toFixed(1)}m, prox=${proximity.toFixed(1)}m`
    );

    debugLog(`Target: ${target.lat.toFixed(6)}, ${target.lng.toFixed(6)}`);

    debugLog(`Next step: ${next?.instruction || "none"}`);
  }

  function repeat() {
    if (currentInstruction) speak(currentInstruction);
  }

  return {
    onUpdate,
    updatePosition,
    repeat,
    getState,
  };
}

function debugLog(msg) {
  const el = document.getElementById("debug");
  if (!el) return;

  const timestamp = new Date().toLocaleTimeString();
  el.value += `[${timestamp}] ${msg}\n`;
  el.scrollTop = el.scrollHeight; // auto-scroll to bottom
}
