import * as cp from 'child_process';

export default {
  name: 'build',
  alias: 'b',
  description: 'build the application with the configured command',
  run: async (context) => {
    let configuration;
    try {
      configuration = context.getConfiguration();
    } catch (e) {
      console.error(e);
      return;
    }

    if (!configuration || !configuration.build) {
      console.error('Could not find a build script for the given configuration');
    } else {
      cp.execSync(configuration.build, { stdio: 'inherit' });
    }
  }
};
