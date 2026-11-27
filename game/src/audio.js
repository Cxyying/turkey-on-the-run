const sounds = {
  jump: [[0, 320, 0.13, 'sine', 600]],
  corn: [[0, 740, 0.07], [0.06, 988, 0.10]],
  gold: [[0, 740, 0.08], [0.07, 988, 0.08], [0.14, 1480, 0.17]],
  near: [[0, 520, 0.08, 'triangle', 860]],
  feather: [[0, 660, 0.17], [0.055, 988, 0.15], [0.12, 1319, 0.28]],
  shield: [[0, 540, 0.16, 'triangle', 220], [0.03, 880, 0.14, 'sine']],
  frenzy: [[0, 523, 0.11], [0.07, 659, 0.12], [0.14, 784, 0.12], [0.22, 1047, 0.28, 'square']],
  hit: [[0, 185, 0.18, 'triangle', 62]],
  caught: [[0.12, 392, 0.14], [0.25, 330, 0.14], [0.39, 247, 0.31, 'triangle']],
  escaped: [[0, 523, 0.13], [0.11, 659, 0.13], [0.22, 784, 0.13], [0.34, 1047, 0.32],
    [0.34, 523, 0.36, 'sine']],
};

// Four bars in G with a swung lead and an alternating root and fifth.
const tune = [
  { lead: [67, 71, 74, 76, 74, 71, 69, 0], bass: [43, 50], chord: [59, 62] },
  { lead: [67, 69, 72, 76, 79, 76, 72, 0], bass: [48, 43], chord: [60, 64] },
  { lead: [74, 71, 67, 71, 76, 74, 71, 69], bass: [43, 50], chord: [59, 62] },
  { lead: [69, 74, 78, 76, 74, 69, 66, 0], bass: [50, 45], chord: [57, 66] },
];
const beat = 60 / 120;
const pitch = note => 440 * 2 ** ((note - 69) / 12);

function synth(context, output, time, frequency, duration, wave, peak, endPitch = frequency) {
  const voice = context.createOscillator();
  const volume = context.createGain();
  voice.type = wave;
  voice.frequency.setValueAtTime(frequency, time);
  if (endPitch !== frequency) voice.frequency.exponentialRampToValueAtTime(endPitch, time + duration);
  volume.gain.setValueAtTime(0.001, time);
  volume.gain.exponentialRampToValueAtTime(peak, time + 0.012);
  volume.gain.exponentialRampToValueAtTime(0.001, time + duration);
  voice.connect(volume).connect(output);
  voice.start(time);
  voice.stop(time + duration + 0.01);
  return voice;
}

export function createAudio() {
  let context;
  let master;
  let muted = false;
  let musicActive = false;
  let nextNote = 0;
  let step = 0;
  const musicVoices = new Set();

  function clearMusic() {
    for (const voice of musicVoices) voice.stop();
    musicVoices.clear();
    nextNote = 0;
  }

  function musicNote(note, duration, wave, volume) {
    const voice = synth(context, master, nextNote, pitch(note), duration, wave, volume);
    musicVoices.add(voice);
    voice.onended = () => musicVoices.delete(voice);
  }

  function scheduleStep() {
    const eighth = step % 8;
    const bar = tune[Math.floor(step / 8)];
    if (bar.lead[eighth]) musicNote(bar.lead[eighth], eighth % 2 ? 0.16 : 0.21, 'triangle', 0.078);
    if (eighth % 4 === 0) musicNote(bar.bass[eighth / 4], 0.25, 'triangle', 0.095);
    if (eighth % 4 === 2) {
      for (const note of bar.chord) musicNote(note, 0.13, 'square', 0.014);
    }
    nextNote += beat * (eighth % 2 ? 0.43 : 0.57);
    step = (step + 1) % (tune.length * 8);
  }

  return {
    unlock() {
      if (muted) return;
      try {
        const Audio = window.AudioContext || window.webkitAudioContext;
        if (!Audio) return;
        if (!context) {
          context = new Audio();
          master = context.createGain();
          master.gain.value = 0.55;
          master.connect(context.destination);
        }
        if (context.state === 'suspended') context.resume().catch(() => {});
      } catch {
        // Audio is optional.
      }
    },
    mute() {
      muted = !muted;
      if (master) master.gain.value = muted ? 0 : 0.55;
      if (muted) clearMusic();
      return muted;
    },
    setMusic(active) {
      musicActive = active;
      if (!active) {
        clearMusic();
        step = 0;
      }
    },
    update() {
      if (!musicActive || muted || context?.state !== 'running' || !master) return;
      // A short lookahead keeps the beat steady across animation frames.
      if (nextNote < context.currentTime) nextNote = context.currentTime + 0.025;
      while (nextNote < context.currentTime + 0.16) scheduleStep();
    },
    play(name) {
      if (muted || context?.state !== 'running' || !master) return;
      const pattern = sounds[name];
      if (!pattern) return;
      try {
        for (const [delay, frequency, duration, wave = 'triangle', endPitch = frequency] of pattern) {
          synth(context, master, context.currentTime + delay, frequency, duration, wave, 0.18, endPitch);
        }
      } catch {
        // An unavailable device must never interrupt the run.
      }
    },
  };
}
