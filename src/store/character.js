import _ from 'lodash';
import character from '@/data/character.json';

export const characterTable = _.mapValues(character, (obj, name) => ({ name, ...obj }));
export const characterList = Object.values(characterTable);

export default {
  characterTable,
  characterList: Object.values(characterTable),
};
