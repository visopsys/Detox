module.exports = {
  name: 'detox-local-cli',
  run: async (context) => {
    const { print } = context;

    print.info('Welcome to your CLI');
  }
};
