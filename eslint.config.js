import js from "@eslint/js";
import { defineConfig } from "eslint/config";
import tseslint from "typescript-eslint";
import stylistic from '@stylistic/eslint-plugin'
import pluginJest from "eslint-plugin-jest";

export default defineConfig([
  {
    name: "langfish eslint base production config",
    files: ["**/*.{js,ts,tsx}"],
    ignores: ["node_modules/**", "**/node_modules/**", "**/dist/**", "**/build/**"],
    extends: [js.configs.recommended, tseslint.configs.recommended],
    plugins: {
      "@stylistic": stylistic,
    },
    rules: {
      semi: ["error"],
      "@stylistic/indent": ["error", 2],
      "@stylistic/indent-binary-ops": ["error", 2]
    },
  },
  {
    files: ["**/*.spec.{js,ts,tsx}"],
    plugins: { jest: pluginJest },
    languageOptions: {
      globals: pluginJest.environments.globals.globals,
    },
    rules: {
      'jest/no-disabled-tests': 'warn',
      'jest/no-focused-tests': 'error',
      'jest/no-identical-title': 'error',
      'jest/prefer-to-have-length': 'warn',
      'jest/valid-expect': 'error',
    },
  },
]);
