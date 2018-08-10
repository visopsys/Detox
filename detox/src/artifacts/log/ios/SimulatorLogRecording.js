const _ = require('lodash');
const fs = require('fs-extra');
const path = require('path');
const log = require('../../../utils/logger').child({ __filename });
const sleep = require('../../../utils/sleep');
const exec = require('../../../utils/exec');
const Artifact = require('../../templates/artifact/Artifact');

class SimulatorLogRecording extends Artifact {
  constructor({
    udid,
    appleSimUtils,
    temporaryLogPath,
  }) {
    super();

    this._udid = udid;
    this._appleSimUtils = appleSimUtils;
    this._logPath = temporaryLogPath;

    this._logHandle = 0;
    this._logProcess = null;
    this._minimumLifetime = Promise.resolve();
    this._logError = null;
  }

  async doStart() {
    this._logError = null;

    await fs.ensureFileSync(this._logPath);
    this._logHandle = await fs.open(this._logPath, 'a');

    this._logProcess = this._appleSimUtils.logStream(this._udid, {
      stdout: this._logHandle,
      stderr: this._logHandle,
    });

    this._minimumLifetime = sleep(100);
  }

  async doStop() {
    if (this._logProcess) {
      try {
        await Promise.race([this._logProcess, this._minimumLifetime]);
        await exec.interruptProcess(this._logProcess);
      } catch (e) {
        this._logError = e;
      }

      this._logHandle = await fs.close(this._logHandle);
      this._logHandle = 0;
      this._logProcess = null;
    }
  }

  async doSave(artifactPath) {
    const tempLogPath = this._logPath;

    if (await fs.exists(tempLogPath)) {
      log.debug({ event: 'MOVE_FILE' }, `moving "${tempLogPath}" to ${artifactPath}`);
      await fs.move(tempLogPath, artifactPath);
    } else {
      log.error({ event: 'MOVE_FILE_ERROR'} , `did not find temporary log file: ${tempLogPath}`);
    }
  }

  async doDiscard() {
    await fs.remove(this._logPath);
  }
}

module.exports = SimulatorLogRecording;

