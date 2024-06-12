import { useNamespacedLocalStorage } from '@/utils/NamespacedLocalStorage';
import { fetchSkland } from '@/utils/skland';
import { defineStore } from 'pinia';
import { computed, watch } from 'vue';

export const useSklandStore = defineStore('skland', () => {
  const storage = useNamespacedLocalStorage('skland', {
    cred: '',
    token: '',
    uid: '',
    lastTokenRefresh: 0,
  });
  const { cred, token, uid } = storage;

  const credValid = computed(() => cred.value.length === 32);

  watch(cred, () => {
    if (!credValid.value) return;
    token.value = '';
    uid.value = '';
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
    await refreshToken();
    await fetchSklandBinding();
    const data = await fetchSkland(
      `/api/v1/game/cultivate/player?uid=${uid.value}`,
      cred.value,
      token.value,
    );
    return data.items;
  };

  const fetchSklandBinding = async () => {
    if (uid.value) return;
    const data = await fetchSkland('/api/v1/game/player/binding', cred.value, token.value);
    const newUid = data.list
      .find(({ appCode }) => appCode === 'arknights')
      ?.bindingList.find(({ isDefault }) => isDefault)?.uid;
    if (!uid) throw new Error('UID not found.');
    uid.value = newUid;
  };

  return { cred, credValid, fetchSklandCultivate };
});
