module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  moduleFileExtensions: [ "js", "json", "ts" ],
  rootDir: "src",
  testRegex: ".*\\.spec\\.ts$",
  transform: {
    "^.+\\.(t|j)s$": "ts-jest"
  },
  collectCoverageFrom: [
    "**/*.(t|j)s"
  ],
  coverageDirectory: "../coverage",
  moduleNameMapper: {
    '@models/(.*)': [
      '<rootDir>/models/$1'
    ],
    "@modules/(.*)": [
      "<rootDir>/modules/$1"
    ]
  },
};