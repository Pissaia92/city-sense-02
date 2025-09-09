import globals from "globals";
import pluginJs from "@eslint/js";
import tseslint from "typescript-eslint";
import pluginReact from "eslint-plugin-react";

export default [
  {
    files: ["**/*.{js,mjs,cjs,ts,jsx,tsx}"],
    languageOptions: { 
      globals: globals.browser,
      parser: tseslint.parser,
      parserOptions: {
        ecmaFeatures: { jsx: true },
        ecmaVersion: 2020,
        sourceType: "module"
      }
    },
    plugins: {
      react: pluginReact,
      "@typescript-eslint": tseslint.plugin
    },
    rules: {
      "react/react-in-jsx-scope": "off",
      "no-unused-vars": "warn",
      "prefer-const": "error"
    },
    settings: {
      react: {
        version: "detect"
      }
    }
  }
];