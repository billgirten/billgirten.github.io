import { haversine } from "./geo.js";
import { precacheInstructions, speak } from "./tts.js";

export function createNavigator(steps, options = {}) {
  const proximity = options.proximityThresholdMeters ?? 20;
  const autoSpeak = options.autoSpeak ?? true;

  let index = 0;
  let finished = false;
  let currentInstruction = steps?.[0]?.instruction || "";
  let listeners = [];

  if (steps && steps.length > 0) {
    precacheInstructions(steps.map((s) => s.instruction));
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
      totalSteps: steps?.length || 0,
      nextStep: steps && steps[index + 1] ? steps[index + 1] : null
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
    if (!steps || steps.length === 0 || finished) return;

    const step = steps[index];
    if (!step) {
      finished = true;
      currentInstruction = "Route completed.";
      speak("You have reached your final destination.");
      notify();
      return;
    }

    const target = step.target; // { lat, lng } precomputed
    if (!target) {
      currentInstruction = step.instruction;
      notify();
      return;
    }

    const dist = haversine(position, target);

    if (dist <= proximity) {
      const nextIndex = index + 1;
      if (nextIndex >= steps.length) {
        finished = true;
        currentInstruction = "Route completed.";
        speak("You have reached your final destination.");
      } else {
        index = nextIndex;
        currentInstruction = steps[nextIndex].instruction;
        if (autoSpeak && currentInstruction) speak(currentInstruction);
      }
      notify();
    } else {
      currentInstruction = step.instruction;
      notify();
    }
  }

  function repeat() {
    if (currentInstruction) {
      speak(currentInstruction);
    }
  }

  return {
    onUpdate,
    updatePosition,
    repeat,
    getState
  };
}