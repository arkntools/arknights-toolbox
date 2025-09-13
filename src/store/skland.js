import _ from 'lodash';
import { defineStore } from 'pinia';
import { ref, computed, watch, shallowRef } from 'vue';
import NamespacedLocalStorage, {
  useDynamicNamespacedLocalStorage,
} from '@/utils/NamespacedLocalStorage';
import { fetchSkland, isNotLoginError, sklandOAuthLogin } from '@/utils/skland';
import { PROXY_SERVER } from '@/utils/env';
import { DEFAULT_ID as MULTI_ACCOUNT_DEFAULT_ID } from '@/utils/MultiAccount';
import { useGmAvailable } from '@/utils/gmFetch';

const STORAGE_NAME = 'skland';

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
  const storageName = ref(STORAGE_NAME);
  const [storage, storageNameChanging] = useDynamicNamespacedLocalStorage(storageName, {
    useOAuth: false,
    oauthToken: '',
    cred: '',
    token: '',
    uid: '',
    lastTokenRefresh: 0,
  });
  const { useOAuth, oauthToken, cred, token, uid } = storage;

  const hasProxyServer = !!PROXY_SERVER;
  const gmAvailable = useGmAvailable();
  const oauthAvailable = computed(() => hasProxyServer || gmAvailable.value);
  const canUseOAuth = computed(() => gmAvailable.value && useOAuth.value && oauthTokenValid.value);

  const cultivateCache = new Map();
  let cultivateLastFetch = 0;
  const cultivateCharacters = shallowRef({});

  const oauthTokenValid = computed(() => oauthToken.value.length === 24);
  const credValid = computed(() => cred.value.length === 32);

  const resetStates = () => {
    token.value = '';
    uid.value = '';
    cultivateCharacters.value = {};
    cultivateLastFetch = 0;
  };

  watch(storageName, (newName, oldName) => {
    cultivateCache.set(oldName, [cultivateLastFetch, cultivateCharacters.value]);
    [cultivateLastFetch, cultivateCharacters.value] = cultivateCache.get(newName) || [0, {}];
  });

  watch(oauthToken, () => {
    if (storageNameChanging.value || !oauthTokenValid.value) return;
    cred.value = '';
    resetStates();
  });

  watch(cred, () => {
    if (storageNameChanging.value || !credValid.value || canUseOAuth.value) return;
    resetStates();
  });

  const refreshCredAndToken = async () => {
    const { cred, token } = await sklandOAuthLogin(oauthToken.value);
    storage.cred.value = cred;
    storage.token.value = token;
    storage.lastTokenRefresh.value = Date.now();
  };

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
    if (!credValid.value) {
      if (canUseOAuth.value) {
        await refreshCredAndToken();
      } else return;
    }
    cultivateLastFetch = Date.now();
    await refreshToken();
    await fetchSklandBinding();
    const doFetch = () =>
      fetchSkland(`/api/v1/game/cultivate/player?uid=${uid.value}`, cred.value, token.value);
    const data = await doFetch().catch(async e => {
      if (isNotLoginError(e) && canUseOAuth.value) {
        await refreshCredAndToken();
        return await doFetch();
      }
      throw e;
    });
    cultivateCharacters.value = handleCharactersCultivateData(data.characters);
    return data.items;
  };

  const fetchSklandBinding = async () => {
    if (uid.value) return;
    const doFetch = () => fetchSkland('/api/v1/game/player/binding', cred.value, token.value);
    const data = await doFetch().catch(async e => {
      if (isNotLoginError(e) && canUseOAuth.value) {
        await refreshCredAndToken();
        return await doFetch();
      }
      throw e;
    });
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

  const handleMultiAccountIdChange = id => {
    storageName.value = id === MULTI_ACCOUNT_DEFAULT_ID ? STORAGE_NAME : `${STORAGE_NAME}-${id}`;
  };

  const handleMultiAccountIdDelete = id => {
    if (id === MULTI_ACCOUNT_DEFAULT_ID) return;
    new NamespacedLocalStorage(`${STORAGE_NAME}-${id}`).clear();
  };

  return {
    ready: computed(() => canUseOAuth.value || credValid.value),
    gmAvailable,
    oauthAvailable,
    useOAuth,
    oauthToken,
    oauthTokenValid,
    cred,
    credValid,
    cultivateCharacters,
    fetchSklandCultivate,
    updateSklandCultivateIfExpired,
    getCultivateCharLevelText,
    getPresetItemCultivateText,
    handleMultiAccountIdChange,
    handleMultiAccountIdDelete,
  };
});
