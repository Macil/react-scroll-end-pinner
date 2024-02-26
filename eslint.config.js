const js = require("@eslint/js");
const tseslint = require("typescript-eslint");
const eslintConfigPrettier = require("eslint-config-prettier");
const reactRecommended = require("eslint-plugin-react/configs/recommended");
const reactJsxRuntime = require("eslint-plugin-react/configs/jsx-runtime");
const reactHooks = require("eslint-plugin-react-hooks");

module.exports = tseslint.config(
  { ignores: ["dist/"] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  reactRecommended,
  reactJsxRuntime,
  eslintConfigPrettier,
  {
    files: ["*.js"],
    rules: {
      "no-undef": "off",
      "@typescript-eslint/no-var-requires": "off",
    },
  },
  {
    settings: {
      react: {
        version: "detect",
      },
    },
    plugins: {
      "react-hooks": reactHooks,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      "react-hooks/exhaustive-deps": [
        "error",
        { additionalHooks: "useIsomorphicLayoutEffect" },
      ],
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
    },
  },
);
