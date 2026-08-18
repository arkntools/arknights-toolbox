import test from 'node:test';
import assert from 'node:assert/strict';

import {
  parseMaaOperatorRoster,
  resolveOperatorProgress,
} from '../src/utils/maaOperatorRoster.mjs';

const operators = [
  {
    id: 'char_002_amiya',
    name: '阿米娅',
    elite: 2,
    level: 60,
    own: true,
    potential: 6,
    rarity: 5,
  },
  {
    id: 'char_003_kalts',
    name: '凯尔希',
    elite: 0,
    level: 0,
    own: false,
    potential: 0,
    rarity: 6,
  },
];

test('MAA JSON and CSV imports produce the same roster snapshot', () => {
  const json = parseMaaOperatorRoster(JSON.stringify(operators), 'json');
  const csv = parseMaaOperatorRoster(
    '\uFEFF干员,ID,星级,精英化等级,等级,是否拥有,潜能\r\n' +
      '阿米娅,char_002_amiya,5,2,60,是,6\r\n' +
      '凯尔希,char_003_kalts,6,0,0,否,0\r\n',
    'csv',
  );

  assert.equal(json.summary.total, 2);
  assert.equal(json.summary.owned, 1);
  assert.deepEqual(csv.validOperators, json.validOperators);
  assert.deepEqual(csv.errors, []);
});

test('operator progress resolves base fields from MAA and skill fields from Skland', () => {
  const result = resolveOperatorProgress(
    operators[0],
    {
      evolvePhase: 1,
      level: 50,
      mainSkillLevel: 7,
      skills: { skchr_amiya_3: 2 },
      equips: { uniequip_002_amiya: 3 },
    },
    {
      mainSkillLevel: 4,
      skills: { skchr_amiya_3: 1 },
      equips: { uniequip_002_amiya: 1 },
      currentExp: 123,
    },
  );

  assert.equal(result.elite, 2);
  assert.equal(result.level, 60);
  assert.equal(result.mainSkillLevel, 7);
  assert.equal(result.skills.skchr_amiya_3, 2);
  assert.equal(result.equips.uniequip_002_amiya, 3);
  assert.equal(result.currentExp, 123);
  assert.deepEqual(result.sources, { base: 'maa', skills: 'skland', currentExp: 'manual' });
});

test('conflicting duplicate IDs are excluded instead of accepting a later row', () => {
  const duplicate = { ...operators[0], level: 50 };
  const result = parseMaaOperatorRoster(
    JSON.stringify([operators[0], duplicate, operators[0]]),
    'json',
  );

  assert.equal(result.validOperators.length, 0);
  assert.equal(result.summary.conflicts, 1);
});

test('invalid rows, unknown IDs and completely wrong files are reported safely', () => {
  const unknown = { ...operators[0], id: 'char_future_operator' };
  const invalid = { ...operators[0], id: 'not-a-character-id', level: -1 };
  const mixed = parseMaaOperatorRoster(JSON.stringify([unknown, invalid]), 'json');
  const wrongJson = parseMaaOperatorRoster('{"operators":[]}', 'json');
  const wrongCsv = parseMaaOperatorRoster('name,id\r\nA,char_a\r\n', 'csv');

  assert.equal(mixed.validOperators.length, 1);
  assert.equal(mixed.validOperators[0].id, 'char_future_operator');
  assert.equal(mixed.summary.invalid, 1);
  assert.equal(wrongJson.validOperators.length, 0);
  assert.equal(wrongJson.errors.length, 1);
  assert.equal(wrongCsv.validOperators.length, 0);
  assert.equal(wrongCsv.errors.length, 1);
});

test('CSV accepts a BOM and blank lines but rejects malformed headers, rows and quotes', () => {
  const validCsv =
    '\uFEFF干员,ID,星级,精英化等级,等级,是否拥有,潜能\r\n\r\n' +
    '阿米娅,char_002_amiya,5,2,60,是,6\r\n';
  const valid = parseMaaOperatorRoster(validCsv, 'csv');
  const duplicateHeader = parseMaaOperatorRoster(
    '干员,ID,星级,精英化等级,等级,是否拥有,等级\n阿米娅,char_002_amiya,5,2,60,是,6\n',
    'csv',
  );
  const shortRow = parseMaaOperatorRoster(
    '干员,ID,星级,精英化等级,等级,是否拥有,潜能\n阿米娅,char_002_amiya,5,2,60,是\n',
    'csv',
  );
  const badQuote = parseMaaOperatorRoster(
    '干员,ID,星级,精英化等级,等级,是否拥有,潜能\n"阿米娅,char_002_amiya,5,2,60,是,6\n',
    'csv',
  );

  assert.equal(valid.validOperators.length, 1);
  assert.deepEqual(valid.errors, []);
  assert.equal(duplicateHeader.validOperators.length, 0);
  assert.equal(duplicateHeader.errors.length, 1);
  assert.equal(shortRow.validOperators.length, 0);
  assert.equal(shortRow.summary.invalid, 1);
  assert.equal(badQuote.validOperators.length, 0);
  assert.equal(badQuote.errors.length, 1);
});

test('empty and non-integer numeric fields never enter the effective roster', () => {
  const invalidOperators = [
    { ...operators[0], elite: '' },
    { ...operators[0], level: 'not-a-number' },
    { ...operators[0], potential: 1.5 },
    { ...operators[0], rarity: 7 },
  ];
  const result = parseMaaOperatorRoster(JSON.stringify(invalidOperators), 'json');

  assert.equal(result.validOperators.length, 0);
  assert.equal(result.summary.invalid, invalidOperators.length);
});

test('identical duplicate IDs collapse to one entry while conflicts are removed', () => {
  const identical = parseMaaOperatorRoster(
    JSON.stringify([operators[0], { ...operators[0] }]),
    'json',
  );

  assert.equal(identical.validOperators.length, 1);
  assert.equal(identical.summary.conflicts, 0);
});

test('manual skill progress is used when Skland progress is unavailable', () => {
  const result = resolveOperatorProgress(
    operators[0],
    {},
    {
      mainSkillLevel: 5,
      skills: { skchr_amiya_3: 1 },
      equips: { uniequip_002_amiya: 2 },
    },
  );

  assert.equal(result.mainSkillLevel, 5);
  assert.equal(result.skills.skchr_amiya_3, 1);
  assert.equal(result.equips.uniequip_002_amiya, 2);
  assert.equal(result.sources.skills, 'manual');
});
