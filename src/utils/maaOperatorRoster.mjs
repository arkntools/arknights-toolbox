const CSV_HEADERS = {
  干员: 'name',
  ID: 'id',
  星级: 'rarity',
  精英化等级: 'elite',
  等级: 'level',
  是否拥有: 'own',
  潜能: 'potential',
};

const REQUIRED_FIELDS = ['id', 'name', 'elite', 'level', 'own', 'potential', 'rarity'];

const parseCsvRows = text => {
  const rows = [];
  let row = [];
  let value = '';
  let quoted = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if (quoted) {
      if (char === '"' && text[i + 1] === '"') {
        value += '"';
        i++;
      } else if (char === '"') {
        quoted = false;
      } else {
        value += char;
      }
    } else if (char === '"') {
      quoted = true;
    } else if (char === ',') {
      row.push(value);
      value = '';
    } else if (char === '\n') {
      row.push(value.replace(/\r$/, ''));
      if (row.some(cell => cell !== '')) rows.push(row);
      row = [];
      value = '';
    } else {
      value += char;
    }
  }

  if (quoted) throw new Error('MAA operator CSV contains an unterminated quoted field');

  row.push(value.replace(/\r$/, ''));
  if (row.some(cell => cell !== '')) rows.push(row);
  return rows;
};

const parseCsv = text => {
  const rows = parseCsvRows(text.replace(/^\uFEFF/, ''));
  if (!rows.length) throw new Error('MAA operator CSV is empty');
  const fields = rows[0].map(header => CSV_HEADERS[header.trim()]);
  const missing = REQUIRED_FIELDS.filter(field => !fields.includes(field));
  if (missing.length) throw new Error(`MAA operator CSV is missing fields: ${missing.join(', ')}`);
  if (new Set(fields).size !== fields.length || fields.some(field => !field)) {
    throw new Error('MAA operator CSV contains unknown or duplicate headers');
  }
  return rows.slice(1).map(row => {
    if (row.length !== fields.length) return null;
    return Object.fromEntries(fields.map((field, index) => [field, row[index]]));
  });
};

const parseBoolean = value => {
  if (value === true || value === '是' || String(value).toLowerCase() === 'true') return true;
  if (value === false || value === '否' || String(value).toLowerCase() === 'false') return false;
  return null;
};

const parseInteger = (value, min, max) => {
  if (typeof value !== 'number' && String(value ?? '').trim() === '') return null;
  const parsed = typeof value === 'number' ? value : Number(String(value).trim());
  return Number.isInteger(parsed) && parsed >= min && parsed <= max ? parsed : null;
};

const normalizeOperator = value => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  const id = typeof value.id === 'string' ? value.id.trim() : '';
  const name = typeof value.name === 'string' ? value.name.trim() : '';
  const own = parseBoolean(value.own);
  const rarity = parseInteger(value.rarity, 1, 6);
  const elite = parseInteger(value.elite, 0, 2);
  const level = parseInteger(value.level, 0, 100);
  const potential = parseInteger(value.potential, 0, 6);
  if (!/^char_[a-zA-Z0-9_]+$/.test(id) || !name || own === null) return null;
  if ([rarity, elite, level, potential].some(item => item === null)) return null;
  if (own && level < 1) return null;
  return {
    id,
    internalId: id.slice(5),
    name,
    elite,
    level,
    own,
    potential,
    rarity,
  };
};

const equalOperator = (left, right) => REQUIRED_FIELDS.every(field => left[field] === right[field]);

export const parseMaaOperatorRoster = (text, format) => {
  const errors = [];
  const warnings = [];
  let values;
  try {
    if (format === 'json') {
      values = JSON.parse(String(text).replace(/^\uFEFF/, ''));
      if (!Array.isArray(values)) throw new Error('MAA operator JSON must be an array');
    } else if (format === 'csv') {
      values = parseCsv(String(text));
    } else {
      throw new Error(`Unsupported MAA operator format: ${format}`);
    }
  } catch (error) {
    return {
      snapshot: {},
      validOperators: [],
      warnings,
      errors: [String(error.message || error)],
      summary: { total: 0, owned: 0, unowned: 0, invalid: 1, conflicts: 0 },
    };
  }

  const snapshot = {};
  const conflictingIds = new Set();
  values.forEach((value, index) => {
    const operator = normalizeOperator(value);
    if (!operator) {
      errors.push(`Invalid operator at row ${index + 1}`);
      return;
    }
    if (conflictingIds.has(operator.id)) return;
    if (snapshot[operator.id]) {
      if (!equalOperator(snapshot[operator.id], operator)) {
        warnings.push(`Conflicting duplicate operator ID: ${operator.id}`);
        conflictingIds.add(operator.id);
        delete snapshot[operator.id];
      }
      return;
    }
    snapshot[operator.id] = operator;
  });

  const validOperators = Object.values(snapshot);
  const owned = validOperators.filter(operator => operator.own).length;
  return {
    snapshot,
    validOperators,
    warnings,
    errors,
    summary: {
      total: values.length,
      owned,
      unowned: validOperators.length - owned,
      invalid: errors.length,
      conflicts: warnings.length,
    },
  };
};

export const resolveOperatorProgress = (maa, skland = {}, manual = {}) => {
  const hasMaa = maa && typeof maa === 'object';
  const hasSklandBase = Number.isInteger(skland.evolvePhase) && Number.isInteger(skland.level);
  const hasSklandSkills =
    Number.isInteger(skland.mainSkillLevel) ||
    (skland.skills && typeof skland.skills === 'object') ||
    (skland.equips && typeof skland.equips === 'object');
  const hasManualSkills =
    Number.isInteger(manual.mainSkillLevel) ||
    (manual.skills && typeof manual.skills === 'object') ||
    (manual.equips && typeof manual.equips === 'object');

  return {
    id: maa?.id,
    internalId: maa?.internalId || maa?.id?.replace(/^char_/, ''),
    name: maa?.name,
    own: hasMaa ? Boolean(maa.own) : Boolean(hasSklandBase),
    rarity: hasMaa ? maa.rarity : undefined,
    elite: hasMaa ? maa.elite : hasSklandBase ? skland.evolvePhase : 0,
    level: hasMaa ? maa.level : hasSklandBase ? skland.level : 0,
    potential: hasMaa ? maa.potential : undefined,
    mainSkillLevel: Number.isInteger(skland.mainSkillLevel)
      ? skland.mainSkillLevel
      : Number.isInteger(manual.mainSkillLevel)
        ? manual.mainSkillLevel
        : null,
    skills: { ...(manual.skills || {}), ...(skland.skills || {}) },
    equips: { ...(manual.equips || {}), ...(skland.equips || {}) },
    currentExp: Math.max(0, Number(manual.currentExp) || 0),
    sources: {
      base: hasMaa ? 'maa' : hasSklandBase ? 'skland' : 'unknown',
      skills: hasSklandSkills ? 'skland' : hasManualSkills ? 'manual' : 'unknown',
      currentExp: Number.isFinite(Number(manual.currentExp)) ? 'manual' : 'default',
    },
  };
};
