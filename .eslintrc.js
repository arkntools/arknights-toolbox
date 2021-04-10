const DWPE = process.env.NODE_ENV === 'production' ? 'error' : 'warn';

module.exports = {
  root: true,
  env: {
    node: true,
  },
  extends: ['plugin:vue/essential', 'eslint:recommended'],
  parserOptions: {
    parser: 'babel-eslint',
  },
  rules: {
    ...Object.fromEntries(
      ['vue/no-unused-components', 'no-console', 'no-unused-vars'].map(name => [name, DWPE]),
    ),
    curly: ['error', 'multi-line'],
  },
  overrides: [
    {
      files: ['**/*.spec.js', '**/*.jm.js'],
      env: {
        jest: true,
      },
      plugins: ['jest'],
      extends: ['plugin:jest/recommended'],
      rules: {
        'jest/no-export': 'off',
      },
    },
    {
      files: ['src/workers/depotRecognition/*.js'],
      globals: Object.fromEntries(
        ['_', 'OCRAD', 'Jimp', 'JSZip', 'ss'].map(name => [name, 'readonly']),
      ),
    },
    {
      files: ['tools/**/*.js'],
      rules: Object.fromEntries(['no-console'].map(name => [name, 'off'])),
    },
  ],
};
