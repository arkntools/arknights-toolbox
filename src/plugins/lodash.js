import defineVueProperty from './defineVueProperty';
import _ from 'lodash';

defineVueProperty('_', _);
defineVueProperty('now', _.now);
