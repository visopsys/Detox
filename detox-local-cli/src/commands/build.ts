import * as cosmiconfig from 'cosmiconfig';

module.exports = {
  name: 'build',
  alias: 'b',
  description: 'build the application with the configured command',
  run: async (context) => {
    const { print, config } = context;

    const localConfig = cosmiconfig('detox').searchSync(process.cwd()).config || {};
    print.table([['Key', 'Value'], ...Object.entries(localConfig.configurations)]);
  }
};
