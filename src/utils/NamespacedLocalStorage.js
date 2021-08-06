import _ from 'lodash';
import i18n from '../i18n';
import snackbar from './snackbar';

if (!window.localStorage) {
  snackbar({
    message: i18n.t('warning.noLocalStorage'),
    buttonText: i18n.t('common.okay'),
    timeout: 0,
    closeOnOutsideClick: false,
    noSkip: true,
  });
}

export default class NamespacedLocalStorage {
  /**
   * @param {string} name
   */
  constructor(name) {
    Object.defineProperties(this, {
      name: { value: name, writable: false },
      prefix: { value: name ? `${name}.` : '', writable: false },
    });
  }

  get length() {
    return this.keys().length;
  }

  /**
   * @param {string} key
   * @private
   */
  getKey(key) {
    return this.prefix.concat(key);
  }

  /**
   * @param {string} key
   */
  getItem(key) {
    const value = window.localStorage?.getItem(this.getKey(key));
    try {
      return JSON.parse(value);
    } catch (error) {
      return value;
    }
  }

  /**
   * @param {string} key
   */
  getObject(key) {
    const value = window.localStorage?.getItem(this.getKey(key));
    try {
      const obj = JSON.parse(value);
      return _.isPlainObject(obj) ? obj : {};
    } catch (error) {
      return {};
    }
  }

  /**
   * @param {string} key
   * @param {*} value
   */
  setItem(key, value) {
    if (value === undefined) value = null;
    window.localStorage?.setItem(this.getKey(key), JSON.stringify(value));
  }

  /**
   * @param {string} key
   */
  removeItem(key) {
    window.localStorage?.removeItem(this.getKey(key));
  }

  clear() {
    this.keys().forEach(key => this.removeItem(key));
  }

  /**
   * @param {string} key
   */
  has(key) {
    return this.getKey(key) in (window.localStorage || {});
  }

  keys() {
    if (!this.prefix) return Object.keys(window.localStorage || {});
    return Object.keys(window.localStorage || {})
      .filter(key => key.startsWith(this.prefix))
      .map(key => key.replace(this.prefix, ''));
  }

  /**
   * @returns {[string, any][]}
   */
  entries() {
    return this.keys().map(key => [key, this.getItem(key)]);
  }

  /**
   * @param {(value, key: string) => {}} iteratee
   */
  each(iteratee) {
    this.entries().forEach(([k, v]) => iteratee(v, k));
  }
}
