const tempfile = require('tempfile');
const LogArtifactPlugin = require('../LogArtifactPlugin');
const SimulatorLogRecording = require('./SimulatorLogRecording');

class SimulatorLogPlugin extends LogArtifactPlugin {
  constructor(config) {
    super(config);

    this.appleSimUtils = config.appleSimUtils;
  }

  async onBootDevice(event) {
    await super.onBootDevice(event);
    await this._tryToLaunchCurrentRecording();
  }

  async onLaunchApp(event) {
    await super.onLaunchApp(event);
    await this._tryToLaunchCurrentRecording();
  }

  async _tryToLaunchCurrentRecording() {
    if (this.currentRecording) {
      await this.currentRecording.start();
    }
  }

  createTestRecording() {
    return new SimulatorLogRecording({
      udid: this.context.deviceId,
      appleSimUtils: this.appleSimUtils,
      temporaryLogPath: tempfile('.log'),
    });
  }
}

module.exports = SimulatorLogPlugin;