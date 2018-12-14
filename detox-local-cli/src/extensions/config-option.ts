import * as cosmiconfig from 'cosmiconfig';

export default (context) => {
  context.getConfiguration = () => {
    const {
      parameters: { options }
    } = context;
    const { config = {} } = cosmiconfig('detox').searchSync(process.cwd()) || {};
    const { configurations = {} } = config;

    if (Object.keys(configurations).length === 0) {
      throw new Error('Could not find the configuration');
    }

    if (Object.keys(configurations).length === 1) {
      return Object.values(configurations)[0];
    }

    const configKey = options['c'] || options['configuration'];
    const resolvedConfig = configurations[configKey];

    if (!resolvedConfig) {
      throw new Error('Could not find the configuration');
    }

    return resolvedConfig;
  };
};
