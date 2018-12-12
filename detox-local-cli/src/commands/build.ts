const cp = require('child_process');

module.exports = {
  name: 'build',
  alias: 'b',
  description: 'build the application with the configured command',
  run: async (context) => {
    const configuration = context.getConfiguration();

    if (!configuration || !configuration.build) {
      // log error
    }

    cp.execSync(configuration.build, { stdio: 'inherit' });
  }
};
