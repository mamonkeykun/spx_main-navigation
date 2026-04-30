require('@rushstack/eslint-config/patch/modern-module-resolution');

module.exports = {
  extends: ['@rushstack/eslint-config/profile/web-app'],
  parserOptions: {
    project: './tsconfig.eslint.json',
    tsconfigRootDir: __dirname
  },
  plugins: ['@microsoft/spfx'],
  rules: {
    '@microsoft/spfx/pair-react-dom-render-unmount': 'error',
    '@typescript-eslint/no-explicit-any': 'error',
    '@typescript-eslint/no-unused-vars': 'error',
    '@typescript-eslint/naming-convention': 'off',
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/typedef': 'off',
    '@rushstack/no-new-null': 'off',
    '@rushstack/typedef-var': 'off',
    'eqeqeq': 'off',
    'no-void': 'off',
    'promise/param-names': 'off'
  },
  overrides: [
    {
      files: ['**/*.test.ts', '**/*.test.tsx'],
      env: {
        jest: true
      },
      rules: {
        '@rushstack/hoist-jest-mock': 'off',
        '@typescript-eslint/no-floating-promises': 'off'
      }
    }
  ]
};
