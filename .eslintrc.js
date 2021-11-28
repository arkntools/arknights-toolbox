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
    'prefer-const': [
      'error',
      {
        destructuring: 'all',
        ignoreReadBeforeAssign: false,
      },
    ],
    'vue/multi-word-component-names': 'off',
  },
  overrides: [
    {
      files: ['tools/**/*.js'],
      rules: Object.fromEntries(['no-console'].map(name => [name, 'off'])),
    },
  ],
};
