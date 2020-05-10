module.exports = {
  root: true,
  env: {
    node: true,
  },
  extends: ['plugin:vue/essential', 'eslint:recommended'],
  parserOptions: {
    parser: 'babel-eslint',
  },
  rules:
    process.env.ESLINT_ENV === 'dev'
      ? {
          'vue/no-unused-components': 'warn',
          'no-console': 'warn',
          'no-unused-vars': 'warn',
        }
      : {},
};
