let parent = require('../../.eslintrc');
module.exports =  {
  ...parent,
  extends:  [
    'plugin:@typescript-eslint/recommended',
    'plugin:react/recommended',
  ],
  settings:  {
    react:  {
      version:  'detect',
    },
  },
  rules:  {
    ...parent.rules,
  },
};
