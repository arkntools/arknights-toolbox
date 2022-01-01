import _ from 'lodash';
import cn from '@/locales/cn/tag.json';
import jp from '@/locales/jp/tag.json';
import kr from '@/locales/kr/tag.json';
import tw from '@/locales/tw/tag.json';
import us from '@/locales/us/tag.json';

const deprecatedTag = ['1012', '1013'];

export const enumTagMap = _.mapValues({ cn, jp, kr, tw, us }, map => {
  const enumTag = _.mapValues(_.invert(_.omit(map, deprecatedTag)), Number);
  Object.freeze(enumTag);
  return enumTag;
});
Object.freeze(enumTagMap);
