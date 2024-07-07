import _ from 'lodash';
import { useNamespacedLocalStorage } from '@/utils/NamespacedLocalStorage';
import { fetchSkland } from '@/utils/skland';
import { defineStore } from 'pinia';
import { computed, watch, shallowRef } from 'vue';

const cnNumTextMap = ['零', '一', '二'];

const idStandardization = id => id.replace(/\[([0-9]+?)\]/g, '_$1');

const handleCharactersCultivateData = list => {
  let amiya;
  const otherAmiya = [];
  const mapHandleKeys = ['skills', 'equips'];
  const newList = list.filter(char => {
    char.id = char.id.replace(/^char_/, '');
    mapHandleKeys.forEach(key => {
      if (!char[key]) {
        char[key] = {};
        return;
      }
      char[key] = _.fromPairs(char[key].map(({ id, level }) => [idStandardization(id), level]));
    });
    if (char.id === '002_amiya') amiya = char;
    else if (/_amiya\d+$/.test(char.id)) {
      otherAmiya.push(char);
      return false;
    }
    return true;
  });
  if (amiya && otherAmiya.length) {
    otherAmiya.forEach(char => {
      mapHandleKeys.forEach(key => {
        Object.assign(amiya[key], char[key]);
      });
    });
  }
  return _.keyBy(newList, 'id');
};

export const useSklandStore = defineStore('skland', () => {
  const storage = useNamespacedLocalStorage('skland', {
    cred: '',
    token: '',
    uid: '',
    lastTokenRefresh: 0,
  });
  const { cred, token, uid } = storage;

  let cultivateLastFetch = 0;
  const cultivateCharacters = shallowRef({});

  const credValid = computed(() => cred.value.length === 32);

  watch(cred, () => {
    if (!credValid.value) return;
    token.value = '';
    uid.value = '';
    cultivateCharacters.value = {};
    cultivateLastFetch = 0;
  });

  const refreshToken = async () => {
    const now = Date.now();
    if (
      token.value &&
      now - storage.lastTokenRefresh.value < 1800e3 // 先随便假设个过期时间
    ) {
      return;
    }
    token.value = (await fetchSkland('/api/v1/auth/refresh', cred.value)).token;
    storage.lastTokenRefresh.value = now;
  };

  const fetchSklandCultivate = async () => {
    if (!credValid.value) return;
    cultivateLastFetch = Date.now();
    await refreshToken();
    await fetchSklandBinding();
    const data = await fetchSkland(
      `/api/v1/game/cultivate/player?uid=${uid.value}`,
      cred.value,
      token.value,
    );
    cultivateCharacters.value = handleCharactersCultivateData(data.characters);
    return data.items;
  };

  const fetchSklandBinding = async () => {
    if (uid.value) return;
    const data = await fetchSkland('/api/v1/game/player/binding', cred.value, token.value);
    const app = data.list.find(({ appCode }) => appCode === 'arknights');
    if (!app) throw new Error('Arknights app not found.');
    const newUid = app.defaultUid || app.bindingList[0]?.uid;
    if (!newUid) throw new Error('UID not found.');
    uid.value = newUid;
  };

  const updateSklandCultivateIfExpired = async () => {
    if (Date.now() - cultivateLastFetch < 1800e3) return;
    await fetchSklandCultivate();
  };

  const getCultivateCharLevelText = id => {
    const char = cultivateCharacters.value[id];
    if (!char) return '';
    return char.evolvePhase
      ? `精${cnNumTextMap[char.evolvePhase]}${char.level}级`
      : `${char.level}级`;
  };

  const getPresetItemCultivateText = id => {
    const char = cultivateCharacters.value[id];
    if (!char) return '';
    const skillValues = Object.values(char.skills);
    const equipValues = Object.values(char.equips);
    const parts = [
      getCultivateCharLevelText(id),
      `技${char.mainSkillLevel}`,
      _.sum(skillValues) ? `专${skillValues.join('')}` : null,
      _.sum(equipValues) ? `模${equipValues.join('')}` : null,
      `潜${char.potentialRank + 1}`,
    ];
    return parts.filter(_.identity).join('/');
  };

  return {
    cred,
    credValid,
    cultivateCharacters,
    fetchSklandCultivate,
    updateSklandCultivateIfExpired,
    getCultivateCharLevelText,
    getPresetItemCultivateText,
  };
});
