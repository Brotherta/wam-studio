export class ProgressTracker {
  private debutMs = Date.now();
  private dernierTickMs = Date.now();
  private dernierCurrent = 0;

  constructor(private readonly total: number) {}

  public tick(current: number): {
    current: number;
    total: number;
    percent: number;
    speed: number;
    remainingSeconds: number;
  } {
    const now = Date.now();
    const elapsedSec = Math.max((now - this.debutMs) / 1000, 0.001);
    const deltaSec = Math.max((now - this.dernierTickMs) / 1000, 0.001);
    const deltaBytes = Math.max(current - this.dernierCurrent, 0);
    const instantSpeed = deltaBytes / deltaSec;
    const averageSpeed = current / elapsedSec;
    const speed = instantSpeed > 0 ? instantSpeed : averageSpeed;
    const remainingBytes = Math.max(this.total - current, 0);
    const remainingSeconds = speed > 0 ? remainingBytes / speed : 0;
    const percent = this.total > 0 ? Math.min(100, (current / this.total) * 100) : 0;

    this.dernierTickMs = now;
    this.dernierCurrent = current;

    return {
      current,
      total: this.total,
      percent: Math.round(percent * 10) / 10,
      speed: Math.round(speed / 1024 / 1024 * 10) / 10,
      remainingSeconds: Math.round(remainingSeconds),
    };
  }
}
