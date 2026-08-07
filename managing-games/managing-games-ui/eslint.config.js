import { defineConfig } from "eslint/config";
import react from "eslint-plugin-react";
import globals from "globals";
import babelParser from "@babel/eslint-parser";
import baseConfig from "../../eslint.config.js";


export default defineConfig([
  {
    extends: [baseConfig],
    ignores: ["scripts/**/*.js", "config/**/*.js", "node_modules/**", "**/node_modules/**", "**/dist/**", "**/build/**"],
    languageOptions: {
      globals: {
        ...globals.browser,
      },
    },
    plugins: {
      react,
    },
    rules: {
      'react/jsx-uses-vars': 'warn',
      'react/jsx-uses-react': 'warn',
    },
  },
  {
    files: ["scripts/**/*.js", "config/**/*.js"],
    ignores: ["node_modules/**", "**/node_modules/**", "**/dist/**", "**/build/**"],
    languageOptions: {
      parser: babelParser,
      globals: {
        ...globals.node,
      },
      parserOptions: {
        sourceType: 'module',
        requireConfigFile: false,
      },
    },
  },
]);