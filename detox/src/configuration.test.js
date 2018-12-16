const _ = require('lodash');
const schemes = require('./configurations.mock');

describe('configuration', () => {
  let configuration;
  beforeEach(() => {
    configuration = require('./configuration');
  });

  it(`generate a default config`, async () => {
    const config = await configuration.defaultSession();
    expect(() => config.session.server).toBeDefined();
    expect(() => config.session.sessionId).toBeDefined();
  });

  it(`providing a valid config`, () => {
    expect(() => configuration.validateSession(schemes.validOneDeviceAndSession.session)).not.toThrow();
  });

  it(`providing empty server config should throw`, () => {
    expect(() => configuration.validateSession()).toThrowErrorMatchingSnapshot();
  });

  it(`providing server config with no session should throw`, () => {
    expect(() => configuration.validateSession(schemes.validOneDeviceNoSession.session)).toThrowErrorMatchingSnapshot();
  });

  it(`providing server config with no session.server should throw`, () => {
    expect(() => configuration.validateSession(schemes.invalidSessionNoServer.session)).toThrowErrorMatchingSnapshot();
  });

  it(`providing server config with no session.sessionId should throw`, () => {
    expect(() => configuration.validateSession(schemes.invalidSessionNoSessionId.session)).toThrowErrorMatchingSnapshot();
  });
});
