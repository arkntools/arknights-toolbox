import _ from 'lodash';

const pickAssign = (target, source) => {
  if (typeof target !== typeof source) return target;
  if (_.isPlainObject(target)) {
    return _.mapValues(target, (v, k) => pickAssign(v, source[k]));
  }
  return source;
};

export default (target, source) => pickAssign(_.cloneDeep(target), source);
