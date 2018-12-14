import build from '../commands/build';
const { run } = build;

jest.mock('child_process');
const { execSync } = require('child_process');

describe('build', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('runs a build script', async () => {
    await run({ getConfiguration: () => ({ build: 'my-build.sh' }) });
    expect(execSync).toHaveBeenCalledWith('my-build.sh', expect.any(Object));
  });

  it('aborts the build without configuration', async () => {
    const consoleError = jest.spyOn(global.console, 'error');
    await run({ getConfiguration: () => null });

    expect(consoleError).toHaveBeenCalled();
    expect(execSync).not.toHaveBeenCalled();
  });

  it('aborts the build without a build script', async () => {
    const consoleError = jest.spyOn(global.console, 'error');
    await run({ getConfiguration: () => ({}) });

    expect(consoleError).toHaveBeenCalled();
    expect(execSync).not.toHaveBeenCalled();
  });
});
