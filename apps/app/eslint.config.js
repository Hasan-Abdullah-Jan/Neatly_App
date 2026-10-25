{
  "extends": "eslint:recommended",
  "plugins": ["react-hooks", "react-refresh"],
  "rules": {
    "react-hooks/rules-of-hooks": "error",
    "react-hooks/exhaustive-deps": "warn",
    "react-refresh/only-export-components": "warn",
    "@typescript-eslint/no-unused-vars": "warn",
    "@typescript-eslint/no-explicit-any": "error",
    "no-console": "warn"
  },
  "languageOptions": {
    "parser": "@typescript-eslint/parser",
    "ecmaVersion": 2022,
    "sourceType": "module"
  },
  "ignorePatterns": ["dist/", "node_modules/", "*.config.js", "*.config.ts"]
}
