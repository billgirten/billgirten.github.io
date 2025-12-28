import { haversine } from "./geo.js";
import { precacheInstructions, speak } from "./tts.js";

export function createNavigator(steps, options = {}) {
  const proximity = options.proximityThresholdMeters ?? 20;
  const autoSpeak = options.autoSpeak ?? true;

  // Convert ORS coords [lng, lat] → { lat, lng }
  const normalizedSteps = (steps || []).map((s) => ({
    ...s,
    target: s.coords
      ? { lat: s.coords[1], lng: s.coords[0] }
      : null
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
      nextStep:
        normalizedSteps[index + 1] ? normalizedSteps[index + 1] : null
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

    const target = step.target; // now correctly populated
    if (!target) {
      currentInstruction = step.instruction;
      notify();
      return;
    }

    const dist = haversine(position, target);

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
  }

  function repeat() {
    if (currentInstruction) speak(currentInstruction);
  }

  return {
    onUpdate,
    updatePosition,
    repeat,
    getState
  };
}