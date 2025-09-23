/**
 * @see https://prettier.io/docs/en/configuration.html
 * @type {import("prettier").Config}
 */

const config = {
  plugins: ['@trivago/prettier-plugin-sort-imports'],
  importOrder: ['<THIRD_PARTY_MODULES>', '^[.@]/'],
  importOrderSeparation: true,
  importOrderSortSpecifiers: true,
  trailingComma: 'all',
  singleQuote: true,
  tabWidth: 2,
  semi: true,
  printWidth: 100,
};

export default config;
