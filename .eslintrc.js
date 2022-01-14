module.exports = {
  // extends: ["eslint:recommended", "plugin:@typescript-eslint/recommended"],
  // The next three lines can be removed and and the above uncommented, but
  // there are currently 113 problems that need resolving
  plugins: ["@typescript-eslint"],
  extends: ["eslint:recommended"],
  parser: "@typescript-eslint/parser",
  env: {
    node: true,
    es6: true,
  },
};
