import { reactive, watch } from 'vue';
import { v4 as uuid } from 'uuid';
import EventEmitter from 'eventemitter3';
import i18n from '@/i18n';
import NamespacedLocalStorage from './NamespacedLocalStorage';

export const DEFAULT_ID = 'default';

const ConfigKey = {
  CURRENT: 'current',
  LIST: 'list',
};

export default class MultiAccount {
  /**
   * @param {string} name
   */
  constructor(name) {
    this.name = name;
    this.storage = new NamespacedLocalStorage(name);
    this.config = new NamespacedLocalStorage(`${name ? `${name}.` : ''}multiAccountConfig`);
    this.emitter = new EventEmitter();

    /** @type {{ id: string, list: Array<{ id: string, name: string }> }} */
    this.data = reactive({
      id: this.config.getItem(ConfigKey.CURRENT),
      list: this.config.getItem(ConfigKey.LIST),
    });

    if (!Array.isArray(this.data.list) || !this.data.list.length) {
      this.data.list = [{ id: DEFAULT_ID, name: i18n.t('common.default') }];
    }
    if (!this.data.id || typeof this.data.id !== 'string' || !this.currentAccount) {
      this.data.id = DEFAULT_ID;
    }
    this.updateStoreName();

    watch(
      () => this.data.id,
      val => {
        this.updateStoreName();
        this.config.setItem(ConfigKey.CURRENT, val);
        this.emitter.emit('change');
      },
    );
    watch(
      () => this.data.list,
      val => {
        this.config.setItem(ConfigKey.LIST, val);
      },
      { deep: true },
    );
  }

  get currentAccount() {
    return this.getAccount(this.data.id);
  }

  updateStoreName() {
    this.storage.name = this.data.id === DEFAULT_ID ? this.name : `${this.name}.${this.data.id}`;
  }

  getAccount(targetId) {
    return this.data.list.find(({ id }) => id === targetId);
  }

  switchAccount(id) {
    this.data.id = id;
  }

  /**
   * @param {string} name
   */
  addAccount(name) {
    const item = { id: uuid(), name };
    this.data.list.push(item);
    this.data.id = item.id;
  }

  delAccount(targetId) {
    if (targetId === DEFAULT_ID) return;
    this.data.list = this.data.list.filter(({ id }) => id !== targetId);
    if (this.data.id === targetId) {
      this.data.id = DEFAULT_ID;
    }
    const storage = new NamespacedLocalStorage(`${this.name}.${targetId}`);
    storage.clear();
  }

  renameAccount(id, name) {
    const item = this.getAccount(id);
    if (!item) return;
    item.name = name;
  }
}

MultiAccount.DEFAULT_ID = DEFAULT_ID;
