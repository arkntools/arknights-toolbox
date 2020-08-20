import _ from 'lodash';
import { contributors, developers, translators } from '../data/contributors.json';

_.each(contributors, (person, name) => {
  if (!('url' in person)) person.url = `https://github.com/${name}`;
  else if (person.url === null) delete person.url;
});

const mapContributors = list => list.map(name => contributors[name]);

export default {
  developers: mapContributors(developers),
  translators: mapContributors(translators),
};
