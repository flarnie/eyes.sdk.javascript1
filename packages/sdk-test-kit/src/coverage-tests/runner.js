const throat = require('throat')
const {getNameFromObject} = require('./common-util')
const {makeSendReport} = require('./send-report-util')
const {makeCoverageTests} = require('./tests')

/**
 * Creates a coverage-test runner for a given SDK implementation.
 * params:
 * - sdkName: string of the SDK name
 * - intializeSdkImplementation: a function that initializes state and implements
 *     all coverage-test DSL functions for a given SDK. Returns all of the functions
 *     expected by makeCoverageTests (e.g., visit, open, check, and close) plus
 *     optional functions the runner can use for lifecycle management (e.g., cleanup)
 * returns: a runTests function
 */
function makeRunTests(sdkName, initializeSdkImplementation) {
  const p = []
  const e = {}

  /**
   * Runs coverage-tests for a given SDK implementation.
   * params:
   * - supportedTests: an array of objects, each with keys of "name" and "executionMode"
   *    - name: name of a test (found in makeCoverageTests)
   *    - executionMode: e.g., {isVisualGrid: true} -- although an SDK can implement
   *        whatever it needs, just so long as it is what the initializeSdkImplementation
   *        function is using internally
   * - options: an object which can be used to alter the behavior of runTests
   *    - host: url to run tests on (e.g., a Selenium Grid)
   *    - concurrency: number of parallel executions at one time
   * returns: a report object
   */
  async function runTests(supportedTests, {branchName = 'master', concurrency = 15, host} = {}) {
    supportedTests.forEach(supportedTest => {
      const testName = supportedTest.name
      const executionMode = supportedTest.executionMode
      p.push(async () => {
        let sdkImplementation
        try {
          sdkImplementation = initializeSdkImplementation()
          const test = makeCoverageTests(sdkImplementation)[testName]
          if (sdkImplementation._setup)
            await sdkImplementation._setup({
              // for consistent naming in the Eyes dashboard to pick up the correct baselines
              baselineTestName: `${testName}${convertExecutionModeToSuffix(executionMode)}`,
              branchName,
              host,
              ...supportedTest,
            })
          await test()
          process.stdout.write('.')
        } catch (error) {
          process.stdout.write('F')
          recordError(e, error, testName, executionMode)
        } finally {
          if (sdkImplementation._cleanup) await sdkImplementation._cleanup()
        }
      })
    })
    process.on('unhandledRejection', (reason, _promise) => {
      delete reason.remoteStacktrace
      recordError(e, `Unhandled Rejections`, reason)
    })
    const start = new Date()
    await Promise.all(p.map(throat(concurrency, testRun => testRun())))
    const end = new Date()

    return makeReport({sdkName, testsRan: supportedTests, p, e, start, end})
  }

  return {runTests}
}

function convertExecutionModeToSuffix(executionMode) {
  if (executionMode.useStrictName) return ''
  switch (getNameFromObject(executionMode)) {
    case 'isVisualGrid':
      return '_VG'
    case 'isScrollStitching':
      return '_Scroll'
    default:
      return ''
  }
}

// TODO: cleanup to use cli-util common/util?
function makeReport({sdkName, testsRan, p, e, start, end}) {
  const numberOfTests = new Set(testsRan.map(test => test.name)).size
  const numberOfTestsFailed = Object.keys(e).length
  const numberOfTestsPassed = numberOfTests - numberOfTestsFailed
  const numberOfExecutions = testsRan.length
  const numberOfExecutionsFailed = Object.values(e)
    .map(entry => Object.keys(entry).length)
    .reduce(function(a, b) {
      return a + b
    }, 0)
  const report = {
    stats: {
      duration: end - start,
      numberOfTests,
      numberOfTestsPassed,
      numberOfTestsFailed,
      numberOfExecutions,
      numberOfExecutionsPassed: numberOfExecutions - numberOfExecutionsFailed,
      numberOfExecutionsFailed,
    },
    errors: e,
    toSendReportSchema: makeSendReport.bind(undefined, {sdkName, testsRan, e}),
  }
  return { report }
}

function recordError(errors, error, testName, executionMode) {
  if (!errors[testName]) {
    errors[testName] = {}
  }
  executionMode
    ? (errors[testName][getNameFromObject(executionMode)] = error)
    : (errors[testName] = error)
}

module.exports = {
  makeRunTests,
}
