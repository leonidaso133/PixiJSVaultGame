export default class Timer {
  private elapsedSeconds = 0;
  private running = false;

  suspended = false;

  get elapsed() {
    return this.elapsedSeconds;
  }

  get isRunning() {
    return this.running;
  }

  start() {
    this.running = true;
  }

  stop() {
    this.running = false;
  }

  reset() {
    this.running = false;
    this.elapsedSeconds = 0;
  }

  update(deltaSeconds: number) {
    if (this.running && !this.suspended) this.elapsedSeconds += deltaSeconds;
  }

  static format(seconds: number) {
    const total = Math.floor(seconds * 100);
    const minutes = Math.floor(total / 6000);
    const secs = Math.floor(total / 100) % 60;
    const centis = total % 100;
    const pad = (n: number) => String(n).padStart(2, "0");

    return `${pad(minutes)}:${pad(secs)}.${pad(centis)}`;
  }
}
