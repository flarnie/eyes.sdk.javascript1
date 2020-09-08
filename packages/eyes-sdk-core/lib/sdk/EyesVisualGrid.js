'use strict'

const BrowserType = require('../config/BrowserType')
const Configuration = require('../config/Configuration')
const GeneralUtils = require('../utils/GeneralUtils')
const TypeUtils = require('../utils/TypeUtils')
const ArgumentGuard = require('../utils/ArgumentGuard')
const TestResultsFormatter = require('../TestResultsFormatter')
const MatchResult = require('../match/MatchResult')
const CorsIframeHandler = require('../capture/CorsIframeHandler')
const CorsIframeHandles = require('../capture/CorsIframeHandles')
const VisualGridRunner = require('../runner/VisualGridRunner')
const takeDomSnapshot = require('../utils/takeDomSnapshot')
const EyesCore = require('./EyesCore')
const EyesUtils = require('./EyesUtils')
const {
  resolveAllRegionElements,
  toCheckWindowConfiguration,
} = require('../fluent/CheckSettingsUtils')

/**
 * @typedef {import('../capture/CorsIframeHandles').CorsIframeHandle} CorsIframeHandle
 */

/**
 * @template TDriver, TElement, TSelector
 * @typedef {import('./wrappers/EyesWrappedDriver')<TDriver, TElement, TSelector>} EyesWrappedDriver
 */

/**
 * @template TDriver, TElement, TSelector
 * @typedef {import('./wrappers/EyesWrappedElement')<TDriver, TElement, TSelector>} EyesWrappedElement
 */

/**
 * @template TDriver, TElement, TSelector
 * @typedef {import('./wrappers/EyesWrappedDriver').EyesWrappedDriverCtor<TDriver, TElement, TSelector>} EyesWrappedDriverCtor
 */

/**
 * @template TDriver, TElement, TSelector
 * @typedef {import('./wrappers/EyesWrappedElement').EyesWrappedElementCtor<TDriver, TElement, TSelector>} EyesWrappedElementCtor
 */

/**
 * @template TDriver, TElement, TSelector
 * @typedef {import('./wrappers/EyesWrappedElement').EyesWrappedElementStatics<TDriver, TElement, TSelector>} EyesWrappedElementStatics
 */

/**
 * @template TDriver, TElement, TSelector
 * @typedef {import('./wrappers/EyesBrowsingContext')<TDriver, TElement, TSelector>} EyesBrowsingContext
 */

/**
 * @template TDriver, TElement, TSelector
 * @typedef {import('./wrappers/EyesElementFinder')<TDriver, TElement, TSelector>} EyesElementFinder
 */

/**
 * @template TDriver, TElement, TSelector
 * @typedef {import('./wrappers/EyesDriverController')<TDriver, TElement, TSelector>} EyesDriverController
 */

/**
 * @template TElement, TSelector
 * @typedef {import('../fluent/DriverCheckSettings')<TElement, TSelector>} CheckSettings
 */

/**
 * @template TDriver
 * @template TElement
 * @template TSelector
 * @extends {EyesCore<TDriver, TElement, TSelector>}
 */
class EyesVisualGrid extends EyesCore {
  /**
   * Create a specialized version of this class
   * @template TDriver, TElement, TSelector
   * @param {Object} implementations - implementations of related classes
   * @param {string} implementations.agentId - base agent id
   * @param {EyesWrappedDriverCtor<TDriver, TElement, TSelector>} implementations.WrappedDriver - implementation for {@link EyesWrappedDriver}
   * @param {EyesWrappedElementCtor<TDriver, TElement, TSelector> & EyesWrappedElementStatics<TDriver, TElement, TSelector>} implementations.WrappedElement - implementation for {@link EyesWrappedElement}
   * @param {CheckSettings<TElement, TSelector>} implementations.CheckSettings - specialized version of {@link DriverCheckSettings}
   * @param {VisualGridClient} implementations.VisualGridClient - visual grid client
   * @return {new (...args: ConstructorParameters<typeof EyesVisualGrid>) => EyesVisualGrid<TDriver, TElement, TSelector>} specialized version of this class
   */
  static specialize({agentId, spec, VisualGridClient}) {
    return class extends EyesVisualGrid {
      static get spec() {
        return spec
      }
      static get VisualGridClient() {
        return VisualGridClient
      }
      get spec() {
        return spec
      }
      /**
       * @return {string} base agent id
       */
      getBaseAgentId() {
        return agentId
      }
    }
  }
  /**
   * Creates a new (possibly disabled) Eyes instance that interacts with the Eyes Server at the specified url.
   *
   * @param {string} [serverUrl=EyesBase.getDefaultServerUrl()] The Eyes server URL.
   * @param {boolean} [isDisabled=false] Set to true to disable Applitools Eyes and use the webdriver directly.
   * @param {VisualGridRunner} [runner] - Set {@code true} to disable Applitools Eyes and use the WebDriver directly.
   */
  constructor(serverUrl, isDisabled, runner = new VisualGridRunner()) {
    super(serverUrl, isDisabled)
    /** @private */
    this._runner = runner
    this._runner.attachEyes(this, this._serverConnector)
    this._runner.makeGetVisualGridClient(this.constructor.VisualGridClient.makeVisualGridClient)

    /** @private @type {boolean} */
    this._isOpen = false
    /** @private @type {boolean} */
    this._isVisualGrid = true
    /** @private @type {CorsIframeHandle} */
    this._corsIframeHandle = CorsIframeHandles.BLANK

    /** @private */
    this._checkWindowCommand = undefined
    /** @private */
    this._closeCommand = undefined
    /** @private */
    this._abortCommand = undefined

    /** @private @type {Promise<void>} */
    this._closePromise = Promise.resolve()
  }
  /**
   * @template {TDriver} CDriver
   * @param {CDriver} driver The web driver that controls the browser hosting the application under test.
   * @param {Configuration|string} optArg1 The Configuration for the test or the name of the application under the test.
   * @param {string} [optArg2] The test name.
   * @param {RectangleSize|object} [optArg3] The required browser's viewport size
   *   (i.e., the visible part of the document's body) or to use the current window's viewport.
   * @param {Configuration} [optArg4] The Configuration for the test
   * @return {Promise<CDriver & EyesWrappedDriver<TDriver, TElement, TSelector>>} A wrapped WebDriver which enables Eyes trigger recording and frame handling.
   */
  async open(driver, optArg1, optArg2, optArg3, optArg4) {
    ArgumentGuard.notNull(driver, 'driver')

    this._driver = await this.spec.newDriver(this._logger, driver).init()
    this._context = this._driver.currentContext

    if (optArg1 instanceof Configuration) {
      this._configuration.mergeConfig(optArg1)
    } else {
      this._configuration.setAppName(
        TypeUtils.getOrDefault(optArg1, this._configuration.getAppName()),
      )
      this._configuration.setTestName(
        TypeUtils.getOrDefault(optArg2, this._configuration.getTestName()),
      )
      this._configuration.setViewportSize(
        TypeUtils.getOrDefault(optArg3, this._configuration.getViewportSize()),
      )
      this._configuration.setSessionType(
        TypeUtils.getOrDefault(optArg4, this._configuration.getSessionType()),
      )
    }

    ArgumentGuard.notNull(this._configuration.getAppName(), 'appName')
    ArgumentGuard.notNull(this._configuration.getTestName(), 'testName')

    const browsersInfo = this._configuration.getBrowsersInfo()
    if (!this._configuration.getViewportSize() && browsersInfo && browsersInfo.length > 0) {
      const browserInfo = browsersInfo.find(browserInfo => browserInfo.width)
      if (browserInfo) {
        this._configuration.setViewportSize({width: browserInfo.width, height: browserInfo.height})
      }
    }

    if (!this._configuration.getViewportSize()) {
      const vs = await this._driver.getViewportSize()
      this._configuration.setViewportSize(vs)
    }

    if (!browsersInfo || browsersInfo.length === 0) {
      const vs = this._configuration.getViewportSize()
      this._configuration.addBrowser(vs.getWidth(), vs.getHeight(), BrowserType.CHROME)
    }

    if (this._runner.getConcurrentSessions())
      this._configuration.setConcurrentSessions(this._runner.getConcurrentSessions())

    const {openEyes} = await this._runner.getVisualGridClientWithCache({
      logger: this._logger,
      agentId: this.getFullAgentId(),
      apiKey: this._configuration.getApiKey(),
      showLogs: this._configuration.getShowLogs(),
      saveDebugData: this._configuration.getSaveDebugData(),
      proxy: this._configuration.getProxy(),
      serverUrl: this._configuration.getServerUrl(),
      concurrency: this._configuration.getConcurrentSessions(),
    })

    if (this._configuration.getViewportSize()) {
      const vs = this._configuration.getViewportSize()
      await this.setViewportSize(vs)
    }

    const {checkWindow, close, abort} = await openEyes(
      this._configuration.toOpenEyesConfiguration(),
    )

    this._isOpen = true
    this._checkWindowCommand = checkWindow
    this._closeCommand = close
    this._abortCommand = abort

    await this._initCommon()

    return this._driver.wrapper
  }
  /**
   * @param {string|CheckSettings<TElement, TSelector>} [nameOrCheckSettings] - name of the test case
   * @param {CheckSettings<TElement, TSelector>} [checkSettings] - check settings for the described test case
   * @returns {Promise<MatchResult>}
   */
  async check(nameOrCheckSettings, checkSettings) {
    if (this._configuration.getIsDisabled()) {
      this._logger.log(`check(${nameOrCheckSettings}, ${checkSettings}): Ignored`)
      return new MatchResult()
    }
    ArgumentGuard.isValidState(this._isOpen, 'Eyes not open')

    if (TypeUtils.isNull(checkSettings) && !TypeUtils.isString(nameOrCheckSettings)) {
      checkSettings = nameOrCheckSettings
      nameOrCheckSettings = null
    }

    checkSettings = this.spec.newCheckSettings(checkSettings)

    if (TypeUtils.isString(nameOrCheckSettings)) {
      checkSettings.withName(nameOrCheckSettings)
    }

    return this._checkPrepare(checkSettings, async () => {
      const elementsById = await resolveAllRegionElements({
        checkSettings,
        context: this._driver,
      })
      await EyesUtils.markElements(this._logger, this._driver, elementsById)

      try {
        const breakpoints = TypeUtils.getOrDefault(
          checkSettings.getLayoutBreakpoints(),
          this._configuration.getLayoutBreakpoints(),
        )
        const disableBrowserFetching = TypeUtils.getOrDefault(
          checkSettings.getDisableBrowserFetching(),
          this._configuration.getDisableBrowserFetching(),
        )
        const snapshots = await this._takeDomSnapshots({breakpoints, disableBrowserFetching})
        const [{url}] = snapshots
        if (this.getCorsIframeHandle() === CorsIframeHandles.BLANK) {
          snapshots.forEach(CorsIframeHandler.blankCorsIframeSrcOfCdt)
        }

        const config = toCheckWindowConfiguration({
          checkSettings,
          configuration: this._configuration,
        })

        await this._checkWindowCommand({
          ...config,
          snapshot: snapshots,
          url,
        })
      } finally {
        await EyesUtils.cleanupElementIds(this._logger, this._driver, Object.values(elementsById))
      }
    })
  }
  /**
   * @private
   * @param {CheckSettings<TElement, TSelector>} checkSettings
   * @param {Function} operation
   */
  async _checkPrepare(checkSettings, operation) {
    this._context = await this._driver.refreshContexts()
    await this._context.main.setScrollRootElement(this._scrollRootElement)
    await this._context.setScrollRootElement(checkSettings.getScrollRootElement())
    const originalContext = this._context
    if (checkSettings.getContext()) {
      this._context = await this._context.context(checkSettings.getContext())
      await this._context.focus()
    }
    try {
      return await operation()
    } finally {
      this._context = await originalContext.focus()
    }
  }
  /**
   * @param {CheckSettings<TElement, TSelector>} checkSettings
   */
  async _takeDomSnapshots({breakpoints, disableBrowserFetching}) {
    const browsers = this._configuration.getBrowsersInfo()
    if (!breakpoints) {
      const snapshot = await takeDomSnapshot({
        driver: this._driver,
        browser: this._userAgent.getBrowser(),
        disableBrowserFetching,
      })
      return Array(browsers.length).fill(snapshot)
    }
    const widths = await Promise.all(
      browsers.map(async browser => {
        const {width} = await this.getBrowserSize(browser)
        return GeneralUtils.getBreakpointWidth(breakpoints, width)
      }),
    )
    this._logger.log(
      `taking multiple dom snapshots for widths: ${widths} (breakpoints=${breakpoints}`,
    )
    const viewportSize = await this.getViewportSize()
    const snapshots = {}
    if (widths.includes(viewportSize.getWidth())) {
      this._logger.log(`taking dom snapshot for existing width ${viewportSize.getWidth()}`)
      const snapshot = await takeDomSnapshot({
        driver: this._driver,
        browser: this._userAgent.getBrowser(),
        disableBrowserFetching,
      })
      snapshots[viewportSize.getWidth()] = snapshot
    }
    for (const width of widths) {
      if (snapshots[width]) continue
      this._logger.log(`taking dom snapshot for width ${width}`)
      await this._driver.setViewportSize({width, height: viewportSize.getHeight()})
      const snapshot = await takeDomSnapshot({
        driver: this._driver,
        browser: this._userAgent.getBrowser(),
        disableBrowserFetching,
      })
      snapshots[width] = snapshot
    }
    await this._driver.setViewportSize(viewportSize)
    return widths.map(width => snapshots[width])
  }
  /**
   * @inheritDoc
   */
  async getScreenshot() {
    return undefined
  }
  /**
   * @param {boolean} [throwEx]
   * @return {Promise<TestResults>}
   */
  async close(throwEx = true) {
    let isErrorCaught = false
    this._closePromise = this._closeCommand(true)
      .catch(err => {
        isErrorCaught = true
        return err
      })
      .then(results => {
        this._isOpen = false
        if (this._runner) {
          this._runner._allTestResult.push(...results)
        }
        if (isErrorCaught) {
          const error = TypeUtils.isArray(results) ? results[0] : results
          if (throwEx || !error.getTestResults) throw error
          else return error.getTestResults()
        }
        return TypeUtils.isArray(results) ? results[0] : results
      })

    return this._closePromise
  }
  /**
   * @param {boolean} [throwEx]
   * @return {Promise<void>}
   */
  async closeAndPrintResults(throwEx = true) {
    const results = await this.close(throwEx)

    const testResultsFormatter = new TestResultsFormatter(results)
    // eslint-disable-next-line no-console
    console.log(testResultsFormatter.asFormatterString())
  }
  /**
   * @return {Promise<TestResults>}
   */
  async abort() {
    this._isOpen = false
    return this._abortCommand()
  }
  /**
   * @inheritDoc
   */
  async getInferredEnvironment() {
    return undefined
  }

  async getBrowserSize(browser) {
    if (TypeUtils.has(browser, 'width')) {
      return {width: browser.width, height: browser.height}
    } else if (
      TypeUtils.has(browser, 'chromeEmulationInfo') ||
      TypeUtils.has(browser, 'deviceName')
    ) {
      const {deviceName, screenOrientation = 'portrait'} = browser.chromeEmulationInfo || browser
      if (!this._emulatedDevicesSizesPromise) {
        await this.getAndSaveRenderingInfo()
        this._emulatedDevicesSizesPromise = this._serverConnector.getEmulatedDevicesSizes()
      }
      const devicesSizes = await this._emulatedDevicesSizesPromise
      return devicesSizes[deviceName][screenOrientation]
    } else if (TypeUtils.has(browser, 'iosDeviceInfo')) {
      const {deviceName, screenOrientation = 'portrait'} = browser.iosDeviceInfo
      if (!this._iosDevicesSizesPromise) {
        await this.getAndSaveRenderingInfo()
        this._iosDevicesSizesPromise = this._serverConnector.getIosDevicesSizes()
      }
      const devicesSizes = await this._iosDevicesSizesPromise
      return devicesSizes[deviceName][screenOrientation]
    }
  }
}
module.exports = EyesVisualGrid
