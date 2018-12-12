module.exports = {
  name: 'build',
  run: async context => {
    console.log(context);
    context.print.printHelp();
  }
};
