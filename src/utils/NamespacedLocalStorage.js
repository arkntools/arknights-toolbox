import _ from 'lodash';
import { nextTick, ref } from 'vue';
import i18n from '../i18n';
import snackbar from './snackbar';
import { reactive, toRefs, watch } from 'vue';

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
    this.name = name;
  }

  get prefix() {
    return this.name ? `${this.name}.` : '';
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

  object() {
    return _.fromPairs(this.entries());
  }

  /**
   * @param {(value, key: string) => {}} iteratee
   */
  each(iteratee) {
    this.entries().forEach(([k, v]) => iteratee(v, k));
  }
}

const isSameType = (a, b) => {
  const typeA = typeof a;
  const typeB = typeof b;
  if (typeA !== typeB) return false;
  if (typeA === 'object' && Array.isArray(a) !== Array.isArray(b)) return false;
  return true;
};

const mergeObjWithDefault = (obj, defaultObj) => {
  const result = { ...defaultObj };
  for (const [key, value] of Object.entries(obj)) {
    if (key in defaultObj && isSameType(defaultObj[key], value)) {
      result[key] = value;
    }
  }
  return result;
};

/**
 * @template T
 * @param {string} name
 * @param {T} defaultValue
 * @returns {import('vue').ToRefs<T>}
 */
export const useNamespacedLocalStorage = (name, defaultValue) => {
  const nls = new NamespacedLocalStorage(name);

  const refs = toRefs(reactive(mergeObjWithDefault(nls.object(), defaultValue)));

  _.each(refs, (target, key) => {
    watch(target, val => {
      nls.setItem(key, val);
    });
  });

  return refs;
};

/**
 * @template T
 * @param {import('vue').Ref<string>} name
 * @param {T} defaultValue
 * @returns {[import('vue').ToRefs<T>, import('vue').Ref<boolean>]}
 */
export const useDynamicNamespacedLocalStorage = (name, defaultValue) => {
  const nls = new NamespacedLocalStorage(name.value);
  const nameChanging = ref(false);

  const refs = toRefs(reactive(mergeObjWithDefault(nls.object(), defaultValue)));

  watch(name, async newName => {
    nameChanging.value = true;
    nls.name = newName;
    _.each(mergeObjWithDefault(nls.object(), defaultValue), (value, key) => {
      refs[key].value = value;
    });
    await nextTick();
    nameChanging.value = false;
  });

  _.each(refs, (target, key) => {
    watch(target, val => {
      if (nameChanging.value) return;
      nls.setItem(key, val);
    });
  });

  return [refs, nameChanging];
};
