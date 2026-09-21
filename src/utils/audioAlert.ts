// Web Audio API chime generator for kitchen order alerts
class KitchenSoundManager {
  private ctx: AudioContext | null = null;
  private intervalId: any = null;
  private isRinging: boolean = false;
  private isMuted: boolean = false;

  public init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  public playKitchenBell() {
    try {
      this.init();
      if (!this.ctx || this.isMuted) return;

      const now = this.ctx.currentTime;

      // First Ding (High bell note)
      const osc1 = this.ctx.createOscillator();
      const gain1 = this.ctx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(880, now); // A5
      osc1.frequency.exponentialRampToValueAtTime(1760, now + 0.1);
      gain1.gain.setValueAtTime(0.35, now);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
      osc1.connect(gain1);
      gain1.connect(this.ctx.destination);
      osc1.start(now);
      osc1.stop(now + 0.5);

      // Second Dong (Harmonic note)
      const osc2 = this.ctx.createOscillator();
      const gain2 = this.ctx.createGain();
      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(1174.66, now + 0.18); // D6
      gain2.gain.setValueAtTime(0.4, now + 0.18);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.85);
      osc2.connect(gain2);
      gain2.connect(this.ctx.destination);
      osc2.start(now + 0.18);
      osc2.stop(now + 0.85);
    } catch (e) {
      console.warn('Audio play error:', e);
    }
  }

  public startRinging() {
    if (this.isRinging) return;
    this.isRinging = true;
    this.playKitchenBell();
    this.intervalId = setInterval(() => {
      this.playKitchenBell();
    }, 2500);
  }

  public stopRinging() {
    this.isRinging = false;
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    if (this.isMuted) {
      this.stopRinging();
    }
    return this.isMuted;
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  public getIsRinging(): boolean {
    return this.isRinging;
  }
}

export const kitchenSound = new KitchenSoundManager();
