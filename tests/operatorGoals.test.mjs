import test from 'node:test';
import assert from 'node:assert/strict';

import {
  applyOperatorQuickGoalSetting,
  canRaiseOperatorMainSkill,
  synchronizeProgressSelect,
} from '../src/utils/operatorGoals.mjs';

test('S3 M3 quick goal adds skill 7, E2 and only the selected mastery', () => {
  const setting = {
    evolve: [false, false],
    level: {
      enabled: false,
      current: { elite: 0, level: 1, exp: 0 },
      target: { elite: 0, level: 1 },
    },
    skills: {
      normal: [false, 1, 7],
      elite: [
        [false, 7, 10],
        [false, 7, 10],
        [false, 7, 10],
      ],
    },
  };

  const result = applyOperatorQuickGoalSetting(setting, 'mastery3', {
    maxElite: 2,
    skillIndex: 2,
    mainSkillLevel: 5,
    masteryLevel: 0,
  });

  assert.deepEqual(result.evolve, [true, true]);
  assert.deepEqual(result.level.target, { elite: 2, level: 1 });
  assert.deepEqual(result.skills.normal, [true, 5, 7]);
  assert.deepEqual(result.skills.elite, [
    [false, 7, 10],
    [false, 7, 10],
    [true, 7, 10],
  ]);
});

test('skill quick goal is hidden when an operator has no normal skill material table', () => {
  assert.equal(canRaiseOperatorMainSkill(undefined, null), false);
  assert.equal(canRaiseOperatorMainSkill({ skills: { normal: Array(6) } }, null), true);
  assert.equal(canRaiseOperatorMainSkill({ skills: { normal: Array(6) } }, 7), false);
});

test('quick prerequisites never lower an existing higher level target', () => {
  const setting = {
    evolve: [false, false],
    level: {
      enabled: true,
      current: { elite: 0, level: 1, exp: 0 },
      target: { elite: 2, level: 60 },
    },
    skills: {
      normal: [false, 7, 7],
      elite: [[false, 7, 10]],
    },
  };

  const result = applyOperatorQuickGoalSetting(setting, 'mastery3', {
    maxElite: 2,
    skillIndex: 0,
    mainSkillLevel: 7,
    masteryLevel: 0,
  });

  assert.deepEqual(result.level.target, { elite: 2, level: 60 });
  assert.deepEqual(result.evolve, [true, true]);
  assert.deepEqual(result.skills.elite[0], [true, 7, 10]);
});

test('known completed skill and module progress is displayed as complete and cannot stay selected', () => {
  assert.deepEqual(synchronizeProgressSelect([true, 1, 7], 7, 7), [false, 7, 7]);
  assert.deepEqual(synchronizeProgressSelect([true, 7, 10], 3, 3, 7), [false, 10, 10]);
  assert.deepEqual(synchronizeProgressSelect([true, 0, 3], 3, 3), [false, 3, 3]);
});

test('known partial progress updates the start while preserving an unfinished higher target', () => {
  assert.deepEqual(synchronizeProgressSelect([true, 7, 10], 2, 3, 7), [true, 9, 10]);
  assert.deepEqual(synchronizeProgressSelect([false, 0, 3], 2, 3), [false, 2, 3]);
});
