import { contributors, contribution, translation } from '../data/contributors.json';

const mapContributors = list => list.map(name => contributors[name]);

export default {
  contribution: mapContributors(contribution),
  translation: mapContributors(translation),
};
