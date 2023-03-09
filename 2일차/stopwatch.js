export default class Stopwatch {
  constructor(cur = 0) {
    this.cur = cur;
    this.startTime = null;
    this.isWorking = false;
  }

  result() {
    if (this.isWorking) {
      this.cur += Date.now() - this.startTime;
      this.startTime = Date.now();
    }
    return [
      this.cur / 3600000,
      (this.cur / 60000) % 60,
      (this.cur / 1000) % 60,
      (this.cur % 1000) / 10,
    ].map((k) => {
      const l = Math.floor(k);
      return `${"0".repeat(2 - `${l}`.length)}${l}`;
    });
  }

  operate() {
    if (!this.isWorking) {
      this.startTime = Date.now();
      this.isWorking = true;
    } else this.isWorking = false;
  }

  reset() {
    this.isWorking = false;
    this.cur = 0;
  }
}
