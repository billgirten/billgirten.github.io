
/* ============================================================
   Convert Google Directions → Flat TTS Steps
============================================================ */
export function convertGoogleToTTS(googleJson) {
  if (!googleJson || !googleJson.routes || googleJson.routes.length === 0) {
    return [];
  }

  const route = googleJson.routes[0];
  const legs = route.legs || [];

  const ttsSteps = [];

  for (const leg of legs) {
    for (const step of leg.steps) {
      let instr = step.html_instructions || "";
      instr = instr.replace(/<[^>]+>/g, "");
      instr = instr.replace(/\s+/g, " ").trim();

      ttsSteps.push({
        instruction: instr,
        distance_meters: step.distance?.value ?? null,
        duration_seconds: step.duration?.value ?? null,

        // Convert Google lat/lng → your [lng, lat]
        start: [
          step.start_location.lng,
          step.start_location.lat
        ],
        end: [
          step.end_location.lng,
          step.end_location.lat
        ],

        maneuver: step.maneuver || null
      });
    }
  }

  return ttsSteps;
}