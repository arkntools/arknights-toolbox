export const canRaiseOperatorMainSkill = (cultivate, currentLevel) => {
  const costLength = cultivate?.skills?.normal?.length || 0;
  if (costLength < 1) return false;
  return !Number.isInteger(currentLevel) || currentLevel < costLength + 1;
};

export const synchronizeProgressSelect = (select, currentLevel, maxLevel, offset = 0) => {
  const result = [...select];
  if (!Number.isInteger(currentLevel) || !Number.isInteger(maxLevel)) return result;

  const current = Math.min(Math.max(currentLevel, 0), maxLevel) + offset;
  const max = maxLevel + offset;
  if (current >= max) return [false, max, max];

  if (!result[0]) return [false, current, max];
  if (result[1] < current) result[1] = current;
  if (result[2] <= current) return [false, current, max];
  return result;
};

export const applyOperatorQuickGoalSetting = (setting, kind, options) => {
  const result = JSON.parse(JSON.stringify(setting));
  const { maxElite = 2, skillIndex = 0, mainSkillLevel = 1, masteryLevel = 0 } = options || {};
  const current = result.level.current;
  const requiredElite =
    kind === 'elite2' || kind === 'mastery3' ? Math.min(2, maxElite) : Math.min(1, maxElite);

  if (current.elite < requiredElite) {
    result.level.enabled = true;
    if (result.level.target.elite < requiredElite) {
      result.level.target = { elite: requiredElite, level: 1 };
    }
    result.evolve = result.evolve.map(
      (checked, index) => checked || (index + 1 > current.elite && index + 1 <= requiredElite),
    );
  }
  if ((kind === 'skill7' || kind === 'mastery3') && mainSkillLevel < 7) {
    result.skills.normal = [true, mainSkillLevel, 7];
  }
  if (kind === 'mastery3' && result.skills.elite[skillIndex] && masteryLevel < 3) {
    result.skills.elite[skillIndex] = [true, masteryLevel + 7, 10];
  }
  return result;
};
