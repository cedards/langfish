import { defineConfig } from "eslint/config";
import react from "eslint-plugin-react";
import globals from "globals";
import babelParser from "@babel/eslint-parser";

export default defineConfig([{
  languageOptions: {
    parser: babelParser,
    globals: {
      ...globals.browser,
      ...globals.jest,
    },
    parserOptions: {
      sourceType: 'module',
      requireConfigFile: false,
    },
  },
  plugins: {
    react,
  },
  rules: {
    'react/jsx-uses-vars': 'warn',
    'react/jsx-uses-react': 'warn',
  },
}]);