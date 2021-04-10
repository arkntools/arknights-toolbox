import _ from 'lodash';
import { isTrustSim } from './trustSim';

export default data =>
  _.fromPairs(
    data
      .filter(({ sim }) => isTrustSim(sim))
      .map(({ num: { value }, sim: { name } }) => [name, value]),
  );
