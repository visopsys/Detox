class DetoxGet {
  static text(i) {
    return {
      target: {
        type: "Class",
        value: "com.wix.detox.espresso.DetoxGet"
      },
      method: "getText",
      args: [{
        type: "Invocation",
        value: i
      }]
    };
  }
  static height(i) {
    return {
      target: {
        type: "Class",
        value: "com.wix.detox.espresso.DetoxGet"
      },
      method: "getHeight",
      args: [{
        type: "Invocation",
        value: i
      }]
    };
  }
}

module.exports = DetoxGet;