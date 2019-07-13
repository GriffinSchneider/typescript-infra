module.exports = {
  env: {
    node: true,
  },
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint'],
  extends: [
    'eslint:recommended',
    'plugin:import/errors',
    'plugin:import/warnings',
    'plugin:import/typescript',
    'plugin:@typescript-eslint/eslint-recommended',
    'plugin:@typescript-eslint/recommended',
    'airbnb-typescript'
  ],
  parserOptions: {
    ecmaVersion: 2018, // Allows for the parsing of modern ECMAScript features
    sourceType: 'module', // Allows for the use of imports
    ecmaFeatures: {
      jsx: true, // Allows for the parsing of JSX
    },
  },
  rules: {
    indent: 'off',
    'object-curly-newline': 'off',
    'max-len': ['error', 160, 2, {
      ignoreUrls: true,
      ignoreComments: false,
      ignoreRegExpLiterals: true,
      ignoreStrings: true,
      ignoreTemplateLiterals: true,
    }],
    'no-restricted-properties': ['error', {
      object: 'JSON',
      property: 'parse',
      message: 'JSON.parse() returns `any`, which turns off the type system. Use @griffins/json instead.'
    }],
    'no-param-reassign': ['error', { props: false }],
    'lines-between-class-members': ['error', 'always', { exceptAfterSingleLine: true }],
    'import/no-extraneous-dependencies': 'error',
    'import/no-unused-modules': ['error', { unusedExports: true }],
    'import/prefer-default-export': 'off',
    '@typescript-eslint/indent': ['error', 2],
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/no-empty-interface': 'off', // Empty interfaces are required for circularly-referenced types.
  },
};
