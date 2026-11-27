const sounds = {
  jump: [[0, 320, 0.13, 'sine', 600]],
  corn: [[0, 740, 0.07], [0.06, 988, 0.10]],
  gold: [[0, 740, 0.08], [0.07, 988, 0.08], [0.14, 1480, 0.17]],
  hit: [[0, 185, 0.18, 'triangle', 62]],
  caught: [[0.12, 392, 0.14], [0.25, 330, 0.14], [0.39, 247, 0.31, 'triangle']],
  escaped: [[0, 523, 0.13], [0.11, 659, 0.13], [0.22, 784, 0.13], [0.34, 1047, 0.32],
    [0.34, 523, 0.36, 'sine']],
};

export function createAudio() {
  let context;
  let master;
  let muted = false;
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
      return muted;
    },
    play(name) {
      if (muted || context?.state !== 'running' || !master) return;
      try {
        for (const [delay, pitch, duration, wave = 'triangle', endPitch = pitch] of sounds[name]) {
          const start = context.currentTime + delay;
          const oscillator = context.createOscillator();
          const volume = context.createGain();
          oscillator.type = wave;
          oscillator.frequency.setValueAtTime(pitch, start);
          oscillator.frequency.exponentialRampToValueAtTime(endPitch, start + duration);
          volume.gain.setValueAtTime(0.001, start);
          volume.gain.exponentialRampToValueAtTime(0.18, start + 0.014);
          volume.gain.exponentialRampToValueAtTime(0.001, start + duration);
          oscillator.connect(volume).connect(master);
          oscillator.start(start);
          oscillator.stop(start + duration + 0.01);
        }
      } catch {
        // An unavailable device must never interrupt the run.
      }
    },
  };
}
