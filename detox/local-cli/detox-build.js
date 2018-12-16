#!/usr/bin/env node

const _ = require('lodash');
const program = require('commander');
const path = require('path');
const cp = require('child_process');
const { Configuration } = require('../src/configuration');

program
  .description(`[convenience method] run the command defined in 'configuration.build'`)
  .option(
    '-c, --configuration [device configuration]',
    'Select a device configuration from your defined configurations,' +
      "if not supplied, and there's only one configuration, detox will default to it"
  )
  .parse(process.argv);

const config = new Configuration.fromPath(path.join(process.cwd(), 'package.json'));
const buildScript = config.getConfiguration(program.configuration).build;

if (buildScript) {
  console.log(buildScript);
  cp.execSync(buildScript, { stdio: 'inherit' });
} else {
  throw new Error(`Could not find build script in detox.configurations["${program.configuration}"]`);
}
