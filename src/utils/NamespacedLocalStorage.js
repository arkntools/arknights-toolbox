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
   */
  _getKey(key) {
    return this.prefix.concat(key);
  }

  /**
   * @param {string} key
   */
  getItem(key) {
    const value = localStorage.getItem(this._getKey(key));
    try {
      return JSON.parse(value);
    } catch (error) {
      return value;
    }
  }

  /**
   * @param {string} key
   * @param {*} value
   */
  setItem(key, value) {
    if (value === undefined) value = null;
    localStorage.setItem(this._getKey(key), JSON.stringify(value));
  }

  /**
   * @param {string} key
   */
  removeItem(key) {
    localStorage.removeItem(this._getKey(key));
  }

  clear() {
    this.keys().forEach(key => this.removeItem(key));
  }

  /**
   * @param {string} key
   */
  has(key) {
    return this._getKey(key) in localStorage;
  }

  keys() {
    if (!this.prefix) return Object.keys(localStorage);
    return Object.keys(localStorage)
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
