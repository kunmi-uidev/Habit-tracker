/**
 * A lightweight sound utility using Web Audio API to play pleasant UI sounds 
 * without external dependencies.
 */

class SoundService {
  private context: AudioContext | null = null;

  private init() {
    if (!this.context) {
      this.context = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
  }

  /**
   * Plays a subtle, high-pitched "ping" or "chime" sound.
   */
  async playSuccess() {
    try {
      this.init();
      if (!this.context) return;

      const ctx = this.context;
      if (ctx.state === 'suspended') {
        await ctx.resume();
      }

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, ctx.currentTime); // A5
      osc.frequency.exponentialRampToValueAtTime(1320, ctx.currentTime + 0.1); // E6

      gain.gain.setValueAtTime(0, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.2, ctx.currentTime + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.5);
    } catch (e) {
      console.warn('Audio playback failed:', e);
    }
  }

  /**
   * Plays a lower, "pop" sound for adding items.
   */
  async playPop() {
    try {
      this.init();
      if (!this.context) return;

      const ctx = this.context;
      if (ctx.state === 'suspended') {
        await ctx.resume();
      }

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(220, ctx.currentTime + 0.1);

      gain.gain.setValueAtTime(0, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.1, ctx.currentTime + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.15);
    } catch (e) {
      console.warn('Audio playback failed:', e);
    }
  }

  /**
   * Plays a triumphant cheer/fanfare sound.
   */
  async playCheer() {
    try {
      this.init();
      if (!this.context) return;

      const ctx = this.context;
      if (ctx.state === 'suspended') {
        await ctx.resume();
      }

      const playNote = (freq: number, start: number, duration: number) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + start);
        
        gain.gain.setValueAtTime(0, ctx.currentTime + start);
        gain.gain.linearRampToValueAtTime(0.1, ctx.currentTime + start + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + start + duration);
        
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + start);
        osc.stop(ctx.currentTime + start + duration);
      };

      // F4, A4, C5, F5 major chord sequence
      playNote(349.23, 0, 0.4);
      playNote(440.00, 0.1, 0.4);
      playNote(523.25, 0.2, 0.4);
      playNote(698.46, 0.3, 0.8);
    } catch (e) {
      console.warn('Audio playback failed:', e);
    }
  }
}

export const soundService = new SoundService();
