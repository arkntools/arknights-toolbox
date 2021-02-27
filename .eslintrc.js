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
  rules: Object.fromEntries(
    ['vue/no-unused-components', 'no-console', 'no-unused-vars'].map(name => [name, DWPE]),
  ),
  overrides: [
    {
      files: ['src/workers/depotRecognition/*.js'],
      globals: Object.fromEntries(
        ['_', 'OCRAD', 'Jimp', 'JSZip', 'ss'].map(name => [name, 'readonly']),
      ),
    },
  ],
};
