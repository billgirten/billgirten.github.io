// humanize-google.js
// Cleans Google TTS steps + adds arrival labels

export function humanizeGoogleTTS(ttsSteps, stops) {
  const cleaned = [];

  for (let i = 0; i < ttsSteps.length; i++) {
    const step = ttsSteps[i];
    let instruction = step.instruction;

    // ------------------------------------------------------------
    // 1. OPTIONAL: Convert long straight segments into "Continue for X miles"
    // ------------------------------------------------------------
    if (!step.maneuver && step.distance_meters > 200) {
      const miles = step.distance_meters / 1609.34;
      instruction = `Continue for ${miles.toFixed(1)} miles`;
    }

    // ------------------------------------------------------------
    // 2. Detect Google arrival phrases
    // ------------------------------------------------------------
    const isArrivalPhrase =
      instruction.includes("Destination will be") ||
      instruction.includes("Your destination");

    if (isArrivalPhrase) {
      const end = step.end;

      const stop = stops.find(s =>
        s.coords &&
        Math.abs(s.coords[0] - end[0]) < 0.0005 &&
        Math.abs(s.coords[1] - end[1]) < 0.0005
      );

      if (stop) {
        instruction = `Arrive at ${stop.label} — ${stop.address}`;
      } else {
        instruction = "Arrive at destination";
      }
    }

    // ------------------------------------------------------------
    // 3. Fallback: last step = arrival
    // ------------------------------------------------------------
    const isLastStep = i === ttsSteps.length - 1;

    if (!isArrivalPhrase && isLastStep) {
      const end = step.end;

      const stop = stops.find(s =>
        s.coords &&
        Math.abs(s.coords[0] - end[0]) < 0.0005 &&
        Math.abs(s.coords[1] - end[1]) < 0.0005
      );

      if (stop) {
        instruction = `Arrive at ${stop.label} — ${stop.address}`;
      } else {
        instruction = "Arrive at destination";
      }
    }

    cleaned.push({
      ...step,
      instruction
    });
  }

  return cleaned;
}