const _ = require('lodash');
const schemes = require('./configurations.mock');

describe('configuration', () => {
  let configuration, Conf;

  beforeEach(() => {
    configuration = require('./configuration');
    Conf = configuration.Configuration;
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

  describe('Configuration', () => {
    it('uses the object given', () => {
      expect(
        () =>
          new Conf({
            configurations: {
              ios: {}
            }
          })
      ).not.toThrow();
    });

    it('loads the config from a path', () => {
      jest.mock('../package.json', () => ({
        detox: {
          configurations: {
            ios: {}
          }
        }
      }));

      expect(() => Conf.fromPath('../package.json')).not.toThrow();
    });

    it('throws an error if the file does not exist', () => {
      jest.mock('../package.json', () => {
        throw new Error('could not load');
      });

      expect(() => Conf.fromPath('../package.json')).toThrowErrorMatchingSnapshot();
    });

    it('throws an error if the file does not contain the right element', () => {
      jest.mock('../package.json', () => {
        noDetox: true;
      });

      expect(() => Conf.fromPath('../package.json')).toThrowErrorMatchingSnapshot();
    });

    describe('verification', () => {
      [
        {
          name: 'no object',
          value: 42
        },
        {
          name: 'no configurations key',
          value: {}
        },
        {
          name: 'no configurations',
          value: { configurations: {} }
        }
      ].forEach(({ name, value }) => {
        it(`throws if ${name} is given`, () => {
          expect(() => new Conf(value)).toThrowErrorMatchingSnapshot();
        });
      });
    });

    describe('getConfiguration', () => {
      it('returns the only available config', () => {
        const conf = new Conf({
          configurations: {
            foo: {
              type: 'ios.none',
              build: 'foo'
            }
          }
        });

        expect(conf.getConfiguration().build).toEqual('foo');
      });

      it('returns the selected config', () => {
        const conf = new Conf({
          configurations: {
            'ios.release': {
              type: 'ios.none',
              build: 'iosrelease.sh'
            },
            'android.release': {
              type: 'android.debugger',
              build: 'android.sh'
            }
          }
        });

        expect(conf.getConfiguration('ios.release').build).toEqual('iosrelease.sh');
      });

      it('throws an error if the selected option is not available', () => {
        const conf = new Conf({
          configurations: {
            'ios.release': {
              build: 'ios.release'
            }
          }
        });

        expect(() => conf.getConfiguration('android.release')).toThrowErrorMatchingSnapshot();
      });

      it('throws an error if called with no argument and multiple configurations available', () => {
        const conf = new Conf({
          configurations: {
            'ios.release': {
              type: 'ios.none',
              build: 'ios.release'
            },
            'android.release': {
              type: 'android.none',
              build: 'buildAndroid.sh'
            }
          }
        });

        expect(() => conf.getConfiguration()).toThrowErrorMatchingSnapshot();
      });

      it('returns a RunConfiguration', () => {
        const conf = new Conf({
          configurations: {
            'ios.release': {
              type: 'ios.none',
              build: 'ios.release'
            }
          }
        });

        expect(conf.getConfiguration().getDriver).toBeInstanceOf(Function);
      });
    });
  });
  describe('RunConfiguration', () => {
    let conf;
    beforeEach(() => {
      conf = new Conf({
        configurations: {
          'ios.release': {
            type: 'ios.none',
            build: 'ios.release'
          }
        }
      }).getConfiguration();
    });

    describe('getDriver', () => {
      const client = {};
      it('throws an error if no client is there', () => {
        expect(() => conf.getDriver()).toThrowErrorMatchingSnapshot();
      });

      it('throws an error if the type does not exist', () => {
        expect(() => {
          const noTypeConf = new Conf({
            configurations: {
              'ios.release': {
                type: 'ios.unknown',
                build: 'ios.release'
              }
            }
          }).getConfiguration();
          noTypeConf.getDriver(client);
        }).toThrowErrorMatchingSnapshot();
      });

      it('returns a driver', () => {
        expect(conf.getDriver(client).getPlatform).toBeInstanceOf(Function);
      });
    });

    it('exposes the build', () => {
      expect(conf.build).toBe('ios.release');
    });

    it('expses the platform', () => {
      expect(conf.platform).toBe('ios');
    });
  });
});
