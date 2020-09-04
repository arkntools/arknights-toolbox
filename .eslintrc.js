module.exports = {
  root: true,
  env: {
    node: true,
  },
  extends: ['plugin:vue/essential', 'eslint:recommended'],
  parserOptions: {
    parser: 'babel-eslint',
  },
  rules: {},
};

const DWPE = process.env.NODE_ENV === 'production' ? 'error' : 'warn';
['vue/no-unused-components', 'no-console', 'no-unused-vars'].forEach(name => {
  module.exports.rules[name] = DWPE;
});
