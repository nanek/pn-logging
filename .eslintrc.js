module.exports = {
  env: {
    node: true,
    es6: true
  },
  extends: ["eslint:recommended", "prettier"],
  plugins: ["prettier"],
  rules: {
    "prettier/prettier": "error",
    "max-len": ["error", { code: 120 }],
    "prefer-const": "warn",
    "no-unused-vars": "warn",
    "no-var": "error"
  }
};
