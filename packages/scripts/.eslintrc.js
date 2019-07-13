let parent = require('../../.eslintrc');
module.exports = {
  ...parent,
  rules: {
    ...parent.rules,
    'no-console': 'off',
    'no-restricted-properties': 'off',
  }
};
