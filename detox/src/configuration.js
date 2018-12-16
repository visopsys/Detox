const DetoxConfigError = require('./errors/DetoxConfigError');
const IosDriver = require('./devices/drivers/IosDriver');
const SimulatorDriver = require('./devices/drivers/SimulatorDriver');
const EmulatorDriver = require('./devices/drivers/EmulatorDriver');
const AttachedAndroidDriver = require('./devices/drivers/AttachedAndroidDriver');
const Client = require('./client/Client');

const uuid = require('./utils/uuid');
const getPort = require('get-port');
const _ = require('lodash');

async function defaultSession() {
  return {
    server: `ws://localhost:${await getPort()}`,
    sessionId: uuid.UUID()
  };
}

function validateSession(session) {
  if (!session) {
    throw new DetoxConfigError(`No session configuration was found, pass settings under the session property`);
  }

  if (!session.server) {
    throw new DetoxConfigError(`session.server property is missing, should hold the server address`);
  }

  if (!session.sessionId) {
    throw new DetoxConfigError(`session.sessionId property is missing, should hold the server session id`);
  }
}

function throwOnEmptyName() {
  throw new DetoxConfigError(`'name' property is missing, should hold the device name to run on (e.g. "iPhone 7", "iPhone 7, iOS 10.2"`);
}

function throwOnEmptyType() {
  throw new DetoxConfigError(
    `'type' property is missing, should hold the device type to test on (currently only simulator is supported: ios.simulator or ios.none)`
  );
}

function throwOnEmptyBinaryPath() {
  throw new DetoxConfigError(`'binaryPath' property is missing, should hold the app binary path`);
}

const DEVICE_CLASSES = {
  'ios.simulator': SimulatorDriver,
  'ios.none': IosDriver,
  'android.emulator': EmulatorDriver,
  'android.attached': AttachedAndroidDriver
};
class RunConfiguration {
  constructor(config) {
    this.config = config;

    // Throw early to give feedback as early as possible
    this._verify();
  }

  _verify() {
    if (!_.keys(DEVICE_CLASSES).includes(this.config.type)) {
      throw new DetoxConfigError(
        `The configuration type '${this.config.type}' is unknown, only these are supported: ${_.keys(DEVICE_CLASSES).join(',')}`
      );
    }
  }

  /**
   * Gets the driver based on this configuration
   * @param {Client} client for the communication with the simulator / device
   */
  getDriver(client) {
    if (!client) {
      throw new Error('Need to pass a client');
    }

    const deviceDriver = new DEVICE_CLASSES[this.config.type]({
      client: client
    });
    deviceDriver.validateDeviceConfig(this.config);

    return deviceDriver;
  }

  /**
   * @returns {String} build script
   */
  get build() {
    return this.config.build;
  }

  get platform() {
    return this.config.type.split('.')[0];
  }
}

/**
 * Abstracts loading, validation and propert access to global configurations
 */

class Configuration {
  static _loadConfig(configPath) {
    let conf;
    try {
      conf = require(configPath);
    } catch (e) {
      throw new DetoxConfigError(`Could not load configuration from '${configPath}'`);
    }

    if (!conf || !conf.detox) {
      throw new DetoxConfigError('The loaded configuration has no detox item');
    }

    return conf.detox;
  }

  /**
   * @param {String} path path to package.json with "detox" key
   * @returns {Configuration} config loaded from the path
   */
  static fromPath(path) {
    return new Configuration(Configuration._loadConfig(path))
  }

  /**
    * @param {Object|String} config configuration or path to configuration
    */
  constructor(config) {
    this.config = config;
    // Throw early to give feedback as early as possible
    this._verify();
  }

  /**
   * check if the configuration is sane.
   * it's meant to be overloaded by more specific implementations
   */
  _verify() {
    if (!(this.config instanceof Object)) {
      throw new DetoxConfigError('The configuration should be an object');
    }

    if (!(this.config.configurations instanceof Object)) {
      throw new DetoxConfigError('The configuration should have a configurations key');
    }

    if (_.size(this.config.configurations) === 0) {
      throw new DetoxConfigError('There must be a configuration in the configurations object');
    }
  }

  /**
   * Accessor for the configuration, expecting to run on a valid config
   * @param {String} [configId] the identifier of the config
   * @returns {RunConfiguration} runConfig The configuration of a run
   */
  getConfiguration(configId) {
    if (!configId) {
      if (_.size(this.config.configurations) === 1) {
        return new RunConfiguration(_.values(this.config.configurations)[0]);
      }

      throw new DetoxConfigError(`Cannot determine which configuration to use. use --configuration to choose one of the following: 
                            ${Object.keys(this.config.configurations)}`);
    }

    if (!_.keys(this.config.configurations).includes(configId)) {
      throw new DetoxConfigError(`Cannot determine which configuration to use. use --configuration to choose one of the following: 
                            ${Object.keys(this.config.configurations)}`);
    }

    return new RunConfiguration(_.result(this.config, `configurations["${configId}"]`));
  }
}

module.exports = {
  defaultSession,
  validateSession,
  throwOnEmptyName,
  throwOnEmptyType,
  throwOnEmptyBinaryPath,
  Configuration
};
