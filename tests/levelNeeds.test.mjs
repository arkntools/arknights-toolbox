import test from 'node:test';
import assert from 'node:assert/strict';
import Linprog from 'javascript-lp-solver';

import {
  calculateLevelNeeds,
  calculateLevelResourceDeficit,
  materializeLevelLmdStage,
} from '../src/utils/levelNeeds.mjs';

const levelTable = {
  maxLevel: [[3, 3]],
  characterExp: [
    [100, 200],
    [300, 400],
  ],
  characterUpgradeCost: [
    [10, 20],
    [30, 40],
  ],
  eliteCost: [[1000]],
};

test('level needs include experience, upgrade LMD and promotion LMD exactly once', () => {
  const result = calculateLevelNeeds(
    levelTable,
    1,
    { elite: 0, level: 1, exp: 0 },
    {
      elite: 1,
      level: 2,
    },
  );

  assert.deepEqual(result, { exp: 600, lmd: 1060 });
});

test('partial current-level experience is deducted and completed targets cost nothing', () => {
  assert.deepEqual(
    calculateLevelNeeds(
      levelTable,
      1,
      { elite: 0, level: 1, exp: 40 },
      {
        elite: 0,
        level: 2,
      },
    ),
    { exp: 60, lmd: 6 },
  );
  assert.deepEqual(
    calculateLevelNeeds(
      levelTable,
      1,
      { elite: 1, level: 2, exp: 0 },
      {
        elite: 1,
        level: 2,
      },
    ),
    { exp: 0, lmd: 0 },
  );
});

test('level resource deficit deducts imported battle records and LMD', () => {
  const result = calculateLevelResourceDeficit(
    { exp: 10000, lmd: 20000 },
    { 2001: 1, 2002: 2, 2003: 3, 2004: 1, 4001: 7500 },
  );

  assert.deepEqual(result, { exp: 4000, lmd: 12500, expOwned: 6000, lmdOwned: 7500 });
});

test('level LMD planner result is exposed as a CE stage only for level goals', () => {
  const stage = { code: 'CE-6', cost: 36, lmd: 10000 };

  assert.deepEqual(materializeLevelLmdStage(58.9841, 589841, stage), {
    code: 'CE-6',
    sampleNum: Infinity,
    times: 59,
    cost: 2124,
    money: 590000,
    cardExp: 0,
    drops: [],
  });
  assert.equal(materializeLevelLmdStage(2, 0, stage), null);
});

test('invalid or impossible level states are ignored instead of producing negative needs', () => {
  const invalidStates = [
    [
      { elite: 0, level: 0, exp: 0 },
      { elite: 1, level: 2 },
    ],
    [
      { elite: 0, level: 4, exp: 0 },
      { elite: 1, level: 2 },
    ],
    [
      { elite: 0, level: 1, exp: 0 },
      { elite: 2, level: 1 },
    ],
    [
      { elite: 1, level: 2, exp: 0 },
      { elite: 0, level: 2 },
    ],
  ];

  invalidStates.forEach(([current, target]) => {
    assert.deepEqual(calculateLevelNeeds(levelTable, 1, current, target), { exp: 0, lmd: 0 });
  });
  assert.deepEqual(
    calculateLevelNeeds(
      levelTable,
      1,
      { elite: 0, level: 1, exp: 0 },
      {
        elite: 1,
        level: 2,
      },
      1.5,
    ),
    { exp: 0, lmd: 0 },
  );
});

test('level EXP and LMD deficits keep the planner model feasible and bounded', () => {
  const model = {
    optimize: 'cost',
    opType: 'min',
    constraints: {
      lmd: { equal: 0 },
      cardExp: { equal: 0 },
      init: { equal: 1 },
    },
    variables: {
      have: { init: 1, lmd: -589841, cardExp: -361400 },
      'conv-lmd+': { lmd: 10000, cost: 36 },
      'conv-lmd': { lmd: -10000, cost: -36 },
      'conv-cardExp': { cardExp: -10000, lmd: -432, cost: -36 },
      'LS-6': { cardExp: 10000, lmd: 432, cost: 36 },
    },
  };

  const result = Linprog.Solve(model);

  assert.equal(result.feasible, true);
  assert.equal(result.bounded, true);
  assert.ok(result['LS-6'] > 0);
  assert.ok(result['conv-lmd+'] > 0);
});
