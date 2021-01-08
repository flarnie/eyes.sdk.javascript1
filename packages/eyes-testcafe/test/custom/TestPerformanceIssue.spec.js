const cwd = process.cwd()
const path = require('path')
const {Eyes} = require('../../index')
let eyes
const pages = [
  {name: 'mopub', path: 'https://www.mopub.com/content/mopub-aem-twitter/en'},
  {name: 'careers', path: 'https://careers.twitter.com/content/careers-twitter/en.html'},
  {name: 'business', path: 'https://business.twitter.com/content/business-twitter/en.html'},
]
fixture`benchmark`.beforeEach(() => {
  eyes = new Eyes({configPath: path.join(cwd, 'test', 'custom', 'applitools.config.js')})
})
test.skip(pages[0].path, async t => {
  await t.navigateTo(pages[0].path)
  await eyes.open({t, appName: 'eyes-testcafe benchmark', testName: pages[0].name, showLogs: true})
  await eyes.checkWindow(pages[0].path)
  await eyes.close(false)
})
test.skip(pages[1].path, async t => {
  await t.navigateTo(pages[1].path)
  await eyes.open({t, appName: 'eyes-testcafe benchmark', testName: pages[1].name})
  await eyes.checkWindow(pages[1].path)
  await eyes.close(false)
})
test.skip(pages[2].path, async t => {
  await t.navigateTo(pages[2].path)
  await eyes.open({t, appName: 'eyes-testcafe benchmark', testName: pages[2].name})
  await eyes.checkWindow(pages[2].path)
  await eyes.close(false)
})