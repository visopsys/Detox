const _ = require('lodash');
const fs = require('fs-extra');
const log = require('../../../utils/logger').child({ __filename });
const { interruptProcess } = require('../../../utils/exec');
const Artifact = require('../../templates/artifact/Artifact');

class SimulatorLogRecording extends Artifact {
  constructor({
    appleSimUtils,
    pid,
    udid,
    temporaryLogPath,
  }) {
    super();

    this._logPath = temporaryLogPath;
    this._logStream = null;
    this._appleSimUtils = appleSimUtils;
    this._pid = pid;
    this._udid = udid;
    this._logProcessPromise = null;
  }

  async doStart({ deviceId, pid } = {}) {
    if (deviceId && pid) {
      this._udid = deviceId;
      this._pid = pid;
    }

    await fs.ensureFile(this._logPath);
    this._logStream = fs.createWriteStream(this._logPath, {flags: 'a'});
    this._logProcessPromise = this._appleSimUtils.logStream(this._udid, {
      pid: this._pid,
    });

    log.debug({ event: 'LOG_OPENED' }, 'writing device logs to: ' + this._logPath);
    this._logProcessPromise.childProcess.stdout.pipe(this._logStream);
    this._logProcessPromise.childProcess.stderr.pipe(this._logStream);
  }

  async doStop() {
    if (this._logProcessPromise) {
      await interruptProcess(this._logProcessPromise, 'SIGTERM');
      this._logProcessPromise = null;
    }

    if (this._logStream) {
      this._logStream.end();
      this._logStream = null;
    }
  }

  async doSave(artifactPath) {
    if (await fs.exists(this._logPath)) {
      log.debug({ event: 'MOVE_FILE' }, `moving "${this._logPath}" to ${artifactPath}`);
      await fs.move(this._logPath, artifactPath);
    } else {
      log.error({ event: 'MOVE_FILE_ERROR'} , `did not find temporary log file: ${this._logPath}`);
    }
  }

  async doDiscard() {
    await fs.remove(this._logPath);
  }
}

module.exports = SimulatorLogRecording;

