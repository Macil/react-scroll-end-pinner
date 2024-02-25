import js from "@eslint/js";
import tseslint from "typescript-eslint";
import eslintConfigPrettier from "eslint-config-prettier";
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const reactRecommended = require("eslint-plugin-react/configs/recommended");
const reactJsxRuntime = require("eslint-plugin-react/configs/jsx-runtime");
import reactHooks from "eslint-plugin-react-hooks";

export default tseslint.config(
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
    },
  },
);
