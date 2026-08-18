export const calculateLevelNeedsWithSteps = (levelTable, rarity, current, target, count = 1) => {
  const empty = { exp: 0, lmd: 0, steps: [] };
  if (!levelTable || !current || !target || !Number.isInteger(count) || count < 1) return empty;
  if (![rarity, current.elite, current.level, target.elite, target.level].every(Number.isInteger)) {
    return empty;
  }
  if (target.elite < current.elite) return empty;
  if (target.elite === current.elite && target.level <= current.level) {
    return empty;
  }

  const rarityIndex = rarity - 1;
  const maxLevelByElite = levelTable.maxLevel?.[rarityIndex];
  const promotionLmd = levelTable.eliteCost?.[rarityIndex];
  if (!maxLevelByElite || !promotionLmd) return empty;
  if (
    current.elite < 0 ||
    target.elite < 0 ||
    current.elite >= maxLevelByElite.length ||
    target.elite >= maxLevelByElite.length ||
    current.level < 1 ||
    target.level < 1 ||
    current.level > maxLevelByElite[current.elite] ||
    target.level > maxLevelByElite[target.elite]
  ) {
    return empty;
  }

  let exp = 0;
  let lmd = 0;
  const steps = [];
  for (let operator = 0; operator < count; operator++) {
    if (current.level < maxLevelByElite[current.elite]) {
      const firstExp = levelTable.characterExp[current.elite]?.[current.level - 1];
      if (firstExp) {
        const currentExp = Math.max(0, Number(current.exp) || 0);
        const firstNeed = Math.max(0, firstExp - currentExp);
        exp += firstNeed;
        lmd +=
          (firstNeed / firstExp) *
          (levelTable.characterUpgradeCost[current.elite]?.[current.level - 1] || 0);
      }
    }

    for (let elite = current.elite; elite <= target.elite; elite++) {
      if (elite > current.elite) lmd += promotionLmd[elite - 1] || 0;
      const maxLevel = elite === target.elite ? target.level : maxLevelByElite[elite];
      const firstLevel = elite === current.elite ? current.level + 1 : 1;
      for (let level = firstLevel; level < maxLevel; level++) {
        exp += levelTable.characterExp[elite]?.[level - 1] || 0;
        lmd += levelTable.characterUpgradeCost[elite]?.[level - 1] || 0;
      }
      steps.push(exp);
    }
  }

  return { exp, lmd, steps };
};

export const calculateLevelNeeds = (...args) => {
  const { exp, lmd } = calculateLevelNeedsWithSteps(...args);
  return { exp, lmd };
};

const BATTLE_RECORD_EXP = {
  2001: 200,
  2002: 400,
  2003: 1000,
  2004: 2000,
};

export const calculateLevelResourceDeficit = (needs, stock = {}) => {
  const expOwned = Object.entries(BATTLE_RECORD_EXP).reduce(
    (sum, [id, exp]) => sum + (Number(stock[id]) || 0) * exp,
    0,
  );
  const lmdOwned = Math.max(0, Number(stock[4001]) || 0);
  return {
    exp: Math.max(0, (Number(needs?.exp) || 0) - expOwned),
    lmd: Math.max(0, (Number(needs?.lmd) || 0) - lmdOwned),
    expOwned,
    lmdOwned,
  };
};

export const materializeLevelLmdStage = (runs, levelLmdDeficit, stage) => {
  if (!(Number(levelLmdDeficit) > 0) || !(Number(runs) > 0) || !stage) return null;
  const times = Math.ceil(Number(runs));
  return {
    code: stage.code,
    sampleNum: Infinity,
    times,
    cost: times * stage.cost,
    money: times * stage.lmd,
    cardExp: 0,
    drops: [],
  };
};
