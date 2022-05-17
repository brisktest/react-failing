'use strict';

module.exports = {
  /* ... */
  // IMPORTANT: set the test sequencer
  testSequencer: require.resolve('@split-tests/jest'),

  // report the run times of the tests, use `jest-unit` reporter
  reporters: [
    'default',
    [
      'jest-junit',
      {
        outputDirectory: 'unit',
        addFileAttribute: true,
      },
    ],
  ],

  globals: {
    'split-tests': {
      // collect the times
      junit: '<rootDir>/unit/junit.xml',
    },
  },
  globalSetup: require.resolve('./setupGlobal.js'),
  haste: {
    hasteImplModulePath: require.resolve('./noHaste.js'),
  },
  modulePathIgnorePatterns: [
    '<rootDir>/scripts/rollup/shims/',
    '<rootDir>/scripts/bench/',
  ],
  transform: {
    '.*': require.resolve('./preprocessor.js'),
  },
  setupFiles: [require.resolve('./setupEnvironment.js')],
  setupFilesAfterEnv: [require.resolve('./setupTests.js')],
  // Only include files directly in __tests__, not in nested folders.
  testRegex: '/__tests__/[^/]*(\\.js|\\.coffee|[^d]\\.ts)$',
  moduleFileExtensions: ['js', 'json', 'node', 'coffee', 'ts'],
  rootDir: process.cwd(),
  roots: ['<rootDir>/packages', '<rootDir>/scripts'],
  collectCoverageFrom: ['packages/**/*.js'],
  timers: 'fake',
  snapshotSerializers: [require.resolve('jest-snapshot-serializer-raw')],

  //testSequencer: require.resolve('./jestSequencer'),

  testEnvironment: 'jsdom',
};
