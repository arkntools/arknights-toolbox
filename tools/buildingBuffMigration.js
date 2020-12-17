const patch20201217 = buffs => !('power_rec_spd[002]' in buffs);

module.exports = {
  dorm_rec_all_020: ['dorm_rec_all_011', buffs => !('dorm_rec_all[011]' in buffs)],
  dorm_rec_all_030: 'dorm_rec_all_013',
  dorm_rec_all_040: 'dorm_rec_all_020',
  dorm_rec_all_050: 'dorm_rec_all_022',
  dorm_rec_all_060: 'dorm_rec_all_021',
  workshop_formula_cost3_000: 'workshop_formula_cost3_111',
  'dorm_rec_all&oneself_013': 'dorm_rec_all&oneself_021',
  manu_formula_spd_220: 'manu_formula_spd_212',
  manu_formula_limit_000: 'manu_formula_limit_0000',
  // 2020-12-17
  power_rec_spd_001: ['power_rec_spd_010', patch20201217],
  power_rec_spd_002: 'power_rec_spd_020',
  power_rec_spd_003: ['power_rec_spd_011', patch20201217],
  power_rec_spd_010: ['power_rec_spd_001', patch20201217],
  power_rec_spd_020: ['power_rec_spd_013', patch20201217],
  power_rec_spd_030: 'power_rec_spd_014',
  power_rec_spd_031: 'power_rec_spd_021',
  power_rec_spd_040: 'power_rec_spd_003',
  power_rec_spd_041: 'power_rec_spd_015',
  'manu_prod_limit&cost_001': 'manu_prod_limit&cost_002',
  workshop_formula_cost3_111: 'workshop_formula_cost3_120',
};

Object.freeze(module.exports);
