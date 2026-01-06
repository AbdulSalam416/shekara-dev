const nextJest = require('next/jest.js');

const createJestConfig = nextJest({
  dir: './',
});

const config = {
  displayName: '@shekara-dev/llm-knowledge-graph',
  preset: '../jest.preset.js',
  transform: {
    '^(?!.*\\.\\.(js|jsx|ts|tsx|css|json)$)': '@nx/react/plugins/jest',
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  coverageDirectory: '../coverage/llm-knowledge-graph',
  testEnvironment: 'jsdom',
};

module.exports = createJestConfig(config);
