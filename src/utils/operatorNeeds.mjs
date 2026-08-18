const addMaterialNeed = (result, need) => {
  if (!need || typeof need !== 'object') return;
  Object.entries(need).forEach(([id, value]) => {
    const amount = Number(value);
    if (Number.isFinite(amount) && amount > 0) result[id] = (result[id] || 0) + amount;
  });
};

export const calculateOperatorMaterialNeeds = (cultivate, setting) => {
  const result = {};
  if (!cultivate || !setting) return result;

  (cultivate.evolve || []).forEach((need, index) => {
    if (setting.evolve?.[index]) addMaterialNeed(result, need);
  });

  const normalSetting = setting.skills?.normal;
  if (normalSetting?.[0]) {
    for (let level = normalSetting[1] - 1; level < normalSetting[2] - 1; level++) {
      addMaterialNeed(result, cultivate.skills?.normal?.[level]);
    }
  }

  (cultivate.skills?.elite || []).forEach((skill, index) => {
    const masterySetting = setting.skills?.elite?.[index];
    if (!masterySetting?.[0]) return;
    const offset = (cultivate.skills?.normal?.length || 0) + 1;
    for (let level = masterySetting[1] - offset; level < masterySetting[2] - offset; level++) {
      addMaterialNeed(result, skill.cost?.[level]);
    }
  });

  (cultivate.uniequip || []).forEach(({ id, cost }) => {
    const moduleSetting = setting.uniequip?.[id];
    if (!moduleSetting?.[0]) return;
    for (let level = moduleSetting[1]; level < moduleSetting[2]; level++) {
      addMaterialNeed(result, cost?.[level]);
    }
  });

  return result;
};
