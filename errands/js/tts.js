let muted = false;

export function setMuted(value) {
  muted = value;
}

export function isMuted() {
  return muted;
}

export function speak(text, opts = {}) {
  if (typeof window === "undefined") return;
  if (!("speechSynthesis" in window)) return;
  if (!text || muted) return;

  const utter = new SpeechSynthesisUtterance(text);
  utter.rate = opts.rate ?? 1;
  utter.pitch = opts.pitch ?? 1;
  utter.volume = opts.volume ?? 1;
  window.speechSynthesis.speak(utter);
}

export function precacheInstructions(instructions) {
  if (typeof window === "undefined") return;
  if (!("speechSynthesis" in window)) return;

  instructions.forEach((text) => {
    if (!text) return;
    const utter = new SpeechSynthesisUtterance(text);
    utter.rate = 1.3;
    utter.volume = 0.0; // silent pre-cache
    window.speechSynthesis.speak(utter);
  });
}