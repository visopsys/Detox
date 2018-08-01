const argparse = require('../../utils/argparse');
const StartupAndTestRecorderPlugin = require('../templates/plugin/StartupAndTestRecorderPlugin');
const getTimeStampString = require('../utils/getTimeStampString');

/***
 * @abstract
 */
class LogArtifactPlugin extends StartupAndTestRecorderPlugin {
  constructor(config) {
    super(config);

    const recordLogs = argparse.getArgValue('record-logs');

    this.enabled = recordLogs && recordLogs !== 'none';
    this.keepOnlyFailedTestsArtifacts = recordLogs === 'failing';
  }

  async onLaunchApp(event) {
    await super.onLaunchApp(event);

    if (this.currentRecording) {
      await this.currentRecording.start({
        bundleId: event.bundleId,
        deviceId: event.deviceId,
        pid: event.pid
      });
    }
  }

  createStartupRecording() {
    return this.createTestRecording();
  }

  async preparePathForStartupArtifact() {
    const deviceId = this.context.deviceId;
    const timestamp = getTimeStampString();

    return this.api.preparePathForArtifact(`${deviceId} ${timestamp}.startup.log`);
  }

  async preparePathForTestArtifact(testSummary) {
    return this.api.preparePathForArtifact('test.log', testSummary);
  }
}

module.exports = LogArtifactPlugin;