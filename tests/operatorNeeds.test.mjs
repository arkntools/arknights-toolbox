import test from 'node:test';
import assert from 'node:assert/strict';

import { calculateOperatorMaterialNeeds } from '../src/utils/operatorNeeds.mjs';

const cultivate = {
  evolve: [
    { chip: 3, rock: 2 },
    { chipPack: 4, rock: 5 },
  ],
  skills: {
    normal: [{ book1: 1 }, { book1: 2 }, { book2: 1 }, { book2: 2 }, { book2: 3 }, { book3: 4 }],
    elite: [
      { name: 's1', cost: [{ book3: 5 }, { rock: 3 }, { alloy: 2 }] },
      { name: 's2', cost: [{ book3: 6 }, { rock: 4 }, { alloy: 3 }] },
      { name: 's3', cost: [{ book3: 7 }, { rock: 5 }, { alloy: 4 }] },
    ],
  },
  uniequip: [
    {
      id: 'module-a',
      cost: [
        { module: 2, rock: 1 },
        { module: 2, alloy: 2 },
        { module: 2, alloy: 3 },
      ],
    },
  ],
};

test('promotion, skill 1-7, S3 M0-M3 and module 0-3 combine without omitted stages', () => {
  const result = calculateOperatorMaterialNeeds(cultivate, {
    evolve: [true, true],
    skills: {
      normal: [true, 1, 7],
      elite: [
        [false, 7, 10],
        [false, 7, 10],
        [true, 7, 10],
      ],
    },
    uniequip: { 'module-a': [true, 0, 3] },
  });

  assert.deepEqual(result, {
    chip: 3,
    rock: 13,
    chipPack: 4,
    book1: 3,
    book2: 6,
    book3: 11,
    alloy: 9,
    module: 6,
  });
});

test('completed or unselected ranges do not produce material needs', () => {
  const result = calculateOperatorMaterialNeeds(cultivate, {
    evolve: [false, false],
    skills: {
      normal: [false, 7, 7],
      elite: [
        [false, 10, 10],
        [false, 10, 10],
        [false, 10, 10],
      ],
    },
    uniequip: { 'module-a': [false, 3, 3] },
  });

  assert.deepEqual(result, {});
});
