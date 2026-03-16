// Simple sound utility using Web Audio API
const audioCtx = typeof window !== "undefined" ? new (window.AudioContext || (window as any).webkitAudioContext)() : null;

function playTone(freq: number, duration: number, type: OscillatorType = "sine", volume = 0.08) {
  if (!audioCtx) return;
  // Resume context if suspended (autoplay policy)
  if (audioCtx.state === "suspended") audioCtx.resume();
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  gain.gain.value = volume;
  gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);
  osc.connect(gain);
  gain.connect(audioCtx.destination);
  osc.start();
  osc.stop(audioCtx.currentTime + duration);
}

export function playOpenSound() {
  playTone(520, 0.12, "sine", 0.06);
  setTimeout(() => playTone(780, 0.1, "sine", 0.05), 60);
}

export function playCloseSound() {
  playTone(780, 0.1, "sine", 0.05);
  setTimeout(() => playTone(520, 0.12, "sine", 0.04), 60);
}

export function playNavSound() {
  playTone(440, 0.08, "triangle", 0.04);
}

export function playSaveSound() {
  playTone(660, 0.1, "sine", 0.06);
  setTimeout(() => playTone(880, 0.15, "sine", 0.05), 80);
}

export function playDeleteSound() {
  playTone(300, 0.15, "sawtooth", 0.04);
}
