export default class {
  constructor() {
    this.times = [];
    this.step('start');
  }
  step(name) {
    this.times.push({ name, time: Date.now() });
  }
  getResult() {
    return this.times.slice(1).map(({ name, time }, i) => ({ name, time: time - this.times[i].time }));
  }
}
