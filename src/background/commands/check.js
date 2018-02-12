import browser from "webextension-polyfill";
import { getScreenshot } from "../utils/screenshot";
import { getEyes, closeEyes } from "../utils/eyes";
import ideLogger from "../utils/ide-logger";

export function checkWindow(runId, testId, commandId, tabId, windowId, stepName, viewport, forceFullPageScreenshot = true, removeScrollBars = false) {
  return new Promise((resolve, reject) => {
    getEyes(`${runId}${testId}`).then(eyes => {
      if (!eyes.didSetViewportSize) {
        ideLogger.warn("a visual check was called without setting a viewport size, results may be inconsistent");
      }
      eyes.commands.push(commandId);
      eyes.setViewportSize(viewport);
      getScreenshot(tabId, windowId, forceFullPageScreenshot, removeScrollBars, viewport).then((image) => {
        const image64 = image.replace("data:image/png;base64,", "");
        return eyes.checkImage(image64, stepName);
      }).then((imageResult) => {
        return imageResult.asExpected ? resolve(true) : resolve({ status: "undetermined" });
      }).catch(reject);
    });
  });
}

export function endTest(id) {
  return closeEyes(id).then(results => {
    console.log(results);
    return Promise.all(results.commands.map((commandId, index) => (
      browser.runtime.sendMessage(process.env.SIDE_ID, {
        uri: "/playback/command",
        verb: "post",
        payload: {
          commandId,
          state: results.stepsInfo[index].isDifferent ? "failed" : "passed"
        }
      })
    ))).then((commandStates) => {
      console.log(commandStates);
      return results.isPassed
        ? { message: `All visual tests have passed,\nresults: ${results.appUrls.session}` }
        : { error: `There are visual tests failures,\nresults: ${results.appUrls.session}` };
    });
  });
}
