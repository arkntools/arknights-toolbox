import _ from 'lodash';
import { v4 as uuid } from 'uuid';
import EventEmitter from 'eventemitter3';
import i18n from '@/i18n';
import NamespacedLocalStorage from './NamespacedLocalStorage';

const DEFAULT_ID = 'default';

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
    this.nls = new NamespacedLocalStorage(name);
    this.configNls = new NamespacedLocalStorage(`${name ? `${name}.` : ''}multiAccountConfig`);
    this.emitter = new EventEmitter();

    this.currentId = this.configNls.getItem(ConfigKey.CURRENT);
    /** @type {Array<{ id: string, name: string }>} */
    this.list = this.configNls.getItem(ConfigKey.LIST);
    if (!Array.isArray(this.list) || !this.list.length) {
      this.list = [{ id: DEFAULT_ID, name: i18n.t('common.default') }];
    }
    if (!this.currentAccount) {
      this.currentId = DEFAULT_ID;
    }
  }

  /**
   * @returns {string}
   */
  get currentId() {
    return this._currentId || DEFAULT_ID;
  }

  set currentId(val) {
    if (!val || typeof val !== 'string') {
      val = DEFAULT_ID;
    }
    this._currentId = val;
    this.nls.name = val === DEFAULT_ID ? this.name : `${this.name}.${val}`;
  }

  get currentAccount() {
    return this.getAccount(this.currentId);
  }

  saveCurrentId() {
    this.configNls.setItem(ConfigKey.CURRENT, this.currentId);
  }

  saveList() {
    this.configNls.setItem(ConfigKey.LIST, this.list);
  }

  getAccount(targetId) {
    return this.list.find(({ id }) => id === targetId);
  }

  /**
   * @param {string} name
   */
  addAccount(name) {
    const item = { id: uuid(), name };
    this.list.push(item);
    this.currentId = item.id;
    this.saveCurrentId();
    this.saveList();
    this.emitter.emit('change');
  }

  delAccount(targetId) {
    if (targetId === DEFAULT_ID) return;
    if (this.currentId === targetId) {
      this.currentId = DEFAULT_ID;
      this.saveCurrentId();
      this.emitter.emit('change');
    }
    if (_.remove(this.list, ({ id }) => id === targetId).length) {
      this.saveList();
    }
  }

  renameAccount(id, name) {
    const item = this.getAccount(id);
    if (!item) return;
    item.name = name;
    this.saveList();
  }
}
