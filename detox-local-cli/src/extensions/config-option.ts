import * as cosmiconfig from 'cosmiconfig';

module.exports = (context) => {
  context.getConfiguration = () => {
    const {
      parameters: { options }
    } = context;
    const { configurations } = cosmiconfig('detox').searchSync(process.cwd()).config || {};

    if (!Array.isArray(configurations)) {
      return null;
    }

    if (Object.keys(configurations).length === 1) {
      return Object.values(configurations)[0];
    }

    const configKey = options['c'] || options['configuration'];

    return configurations[configKey];
  };
};
