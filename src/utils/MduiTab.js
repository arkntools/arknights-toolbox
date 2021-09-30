import Vue from 'vue';
import { Tab } from 'mdui';

export default class MduiTab {
  constructor(selector) {
    this.selector = selector;
  }
  init() {
    this.tab = new Tab(this.selector);
  }
  async show(index) {
    if (!this.tab) return;
    await Vue.nextTick();
    this.tab.show(index);
  }
}
