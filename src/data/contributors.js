import _ from 'lodash';
import { contributors, developers, translators } from './contributors.json';

_.each(contributors, (person, name) => {
  if (!('url' in person)) person.url = `https://github.com/${name}`;
  else if (person.url === null) delete person.url;
  if (person.avatar.startsWith('gh:')) {
    const id = person.avatar.replace('gh:', '');
    person.avatar = `https://avatars.githubusercontent.com/u/${id}?s=32`;
  }
});

const mapContributors = list => list.map(name => contributors[name]);

export default {
  developers: mapContributors(developers),
  translators: mapContributors(translators),
};
