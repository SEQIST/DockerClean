// jest.config.cjs
module.exports = {
  roots: ['<rootDir>/tests'],
  testMatch: ['**/unit/**/*.[jt]s?(x)', '**/?(*.)+(spec|test).[tj]s?(x)'],
  testPathIgnorePatterns: ['/node_modules/'],
  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest',
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  moduleDirectories: ['node_modules', '<rootDir>/src'],
  moduleNameMapper: {
    '^.+\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    '^features/(.*)$': '<rootDir>/src/features/$1',
  },
  testEnvironment: 'jest-environment-jsdom',
  setupFiles: ['<rootDir>/tests/setupEnv.js'], // Bereits vorhanden
  setupFilesAfterEnv: ['<rootDir>/tests/setupTests.ts'],
};