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
    ...Object.fromEntries(['vue/no-unused-components', 'no-unused-vars'].map(name => [name, DWPE])),
    curly: ['error', 'multi-line'],
    'no-console': [DWPE, { allow: ['warn', 'error'] }],
    'no-empty': ['error', { allowEmptyCatch: true }],
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
      files: ['tools/**/*.js', '*.config.js'],
      rules: Object.fromEntries(['no-console'].map(name => [name, 'off'])),
    },
    {
      files: ['**/*.vue'],
      globals: {
        defineProps: 'readonly',
        defineEmits: 'readonly',
        defineExpose: 'readonly',
        withDefaults: 'readonly',
      },
    },
  ],
};
