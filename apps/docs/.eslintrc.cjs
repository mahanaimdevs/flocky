/** @type {import("eslint").Linter.Config} */
module.exports = {
  root: true,
  extends: ["@flocky/eslint-config/.eslintrc.js"],
  ignorePatterns: [".docusaurus/**", "build/**"],
};
