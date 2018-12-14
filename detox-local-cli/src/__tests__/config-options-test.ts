import plugin from '../extensions/config-option';

const mockSearchSync = jest.fn();
jest.mock('cosmiconfig', () => () => ({
  searchSync: mockSearchSync
}));

describe('config-option', () => {
  it('returns the configuration with c flag', () => {
    mockSearchSync.mockReturnValue({
      config: {
        configurations: {
          'my-config': { build: 'myscript' },
          'other-config': { build: 'differentScript' }
        }
      }
    });
    const context = { parameters: { options: { c: 'my-config' } } } as any;
    plugin(context);
    expect(context.getConfiguration()).toEqual({ build: 'myscript' });
  });

  it('returns the configuration with the configuration flag', () => {
    mockSearchSync.mockReturnValue({
      config: {
        configurations: {
          'my-config': { build: 'myscript' },
          'other-config': { build: 'differentScript' }
        }
      }
    });
    const context = { parameters: { options: { configuration: 'other-config' } } } as any;
    plugin(context);
    expect(context.getConfiguration()).toEqual({ build: 'differentScript' });
  });

  it('returns the configuration with only one configuration without a flag', () => {
    mockSearchSync.mockReturnValue({
      config: {
        configurations: {
          'my-config': { build: 'myscript' }
        }
      }
    });
    const context = { parameters: { options: {} } } as any;
    plugin(context);
    expect(context.getConfiguration()).toEqual({ build: 'myscript' });
  });

  it('throws if no configuration could be loaded', () => {
    mockSearchSync.mockReturnValue(null);
    const context = { parameters: { options: {} } } as any;
    plugin(context);
    expect(() => context.getConfiguration()).toThrowErrorMatchingInlineSnapshot(`"Could not find the configuration"`);
  });

  it('throws with missing config key when multiple configurations are given', () => {
    mockSearchSync.mockReturnValue({
      config: {
        configurations: {
          'my-config': { build: 'myscript' },
          'other-config': { build: 'differentScript' }
        }
      }
    });
    const context = { parameters: { options: { configuration: 'yet-another-config' } } } as any;
    plugin(context);
    expect(() => context.getConfiguration()).toThrowErrorMatchingInlineSnapshot(`"Could not find the configuration"`);
  });

  it('throws without config key when multiple configurations are given', () => {
    mockSearchSync.mockReturnValue({
      config: {
        configurations: {
          'my-config': { build: 'myscript' },
          'other-config': { build: 'differentScript' }
        }
      }
    });
    const context = { parameters: { options: {} } } as any;
    plugin(context);
    expect(() => context.getConfiguration()).toThrowErrorMatchingInlineSnapshot(`"Could not find the configuration"`);
  });
});
