const tempfile = require('tempfile');
const LogArtifactPlugin = require('../LogArtifactPlugin');
const SimulatorLogRecording = require('./SimulatorLogRecording');

class SimulatorLogPlugin extends LogArtifactPlugin {
  constructor(config) {
    super(config);

    this.appleSimUtils = config.appleSimUtils;
  }

  createTestRecording() {
    return new SimulatorLogRecording({
      appleSimUtils: this.appleSimUtils,
      udid: this.context.deviceId,
      pid: this.context.pid,
      temporaryLogPath: tempfile('.log'),
    });
  }
}

module.exports = SimulatorLogPlugin;