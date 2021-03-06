const tags = [
  'headfull',
  'webdriver',
  'mobile',
  'chrome',
  'firefox',
  'ie',
  'edge',
  'safari',
]
module.exports = {
  spec: [
    './test/generic/*.spec.js',
    'node_modules/@applitools/sdk-shared/coverage-tests/custom/**/*.spec.js',
  ],
  parallel: true,
  jobs: 15,
  timeout: 0,
  reporter: 'spec-xunit-file',
  require: ['node_modules/@applitools/sdk-shared/coverage-tests/util/mocha-hooks.js'],
  grep: new RegExp(`^[^\(]*?(\\((?:@(${tags.join('|')}) ?)+\\))?$`),
}
