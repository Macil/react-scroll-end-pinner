/** @type {import('jest').Config} */
export default {
  testEnvironment: "jsdom",
  modulePathIgnorePatterns: ["<rootDir>/dist/"],
  extensionsToTreatAsEsm: [".ts", ".tsx"],
  moduleNameMapper: {
    "^(\\.{1,2}/.*)\\.js$": "$1",
  },
};
