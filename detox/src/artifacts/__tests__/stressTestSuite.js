module.exports = function (createPlugin) {
  testScenario({
    type: 'primary',
    description: "launch app before the test, don't relaunch or reboot during the test",
    scenario: "onBootDevice => onLaunchApp => onBeforeEach => onAfterEach => onAfterAll",
  });

  testScenario({
    type: 'primary',
    description: "launch app in the middle of the test",
    scenario: "onBootDevice => onBeforeEach => onLaunchApp => onAfterEach => onAfterAll",
  });

  testScenario({
    type: 'might happen',
    description: "relaunch app before test starts",
    scenario: "onBootDevice => onLaunchApp => onLaunchApp => onBeforeEach => onAfterEach => onAfterAll",
  });

  testScenario({
    type: 'might happen',
    description: "launch and relaunch app during the same test",
    scenario: "onBootDevice => onBeforeEach => onLaunchApp => onLaunchApp => onAfterEach => onAfterAll",
  });

  testScenario({
    type: 'might happen',
    description: "relaunch app in the middle of the test",
    scenario: "onBootDevice => onLaunchApp => onBeforeEach => onLaunchApp => onAfterEach => onAfterAll",
  });

  testScenario({
    type: 'might happen',
    description: "boot device, launch app, when there are no tests in the suite",
    scenario: "onBootDevice => onLaunchApp => onAfterAll",
  });

  testScenario({
    type: 'might happen',
    description: "boot device without launching app, when there are no tests in the suite",
    scenario: "onBootDevice => onAfterAll",
  });

  testScenario({
    type: 'might happen',
    description: "never launch the app during the test",
    scenario: "onBootDevice => onBeforeEach => onAfterEach => onAfterAll",
  });

  testScenario({
    type: 'might happen',
    description: "reboot device, launch app before test starts",
    scenario: "onBootDevice => onShutdownDevice => onBootDevice => onLaunchApp => onBeforeEach => onAfterEach => onAfterAll",
  });

  testScenario({
    type: 'might happen',
    description: "boot device and launch app inside running test",
    scenario: "onBootDevice => onShutdownDevice => onBeforeEach => onBootDevice => onLaunchApp => onAfterEach => onAfterAll",
  });

  testScenario({
    type: 'might happen',
    description: 'reboot device and launch app inside test',
    scenario: "onBootDevice => onBeforeEach => onShutdownDevice => onBootDevice => onLaunchApp => onAfterEach => onAfterAll",
  });

  testScenario({
    type: 'might happen',
    description: 'reboot device with a launched app, and launch app inside test',
    scenario: "onBootDevice => onLaunchApp => onBeforeEach => onShutdownDevice => onBootDevice => onLaunchApp => onAfterEach => onAfterAll",
  });

  testScenario({
    type: 'might happen',
    description: 'shutdown device with a launched app, and turn on it + launch app inside test',
    scenario: "onBootDevice => onLaunchApp => onShutdownDevice => onBeforeEach => onBootDevice => onLaunchApp => onAfterEach => onAfterAll",
  });

  testScenario({
    type: 'edge case',
    description: "launch the app before the test, start test and shut down the device in the middle of the test",
    scenario: "onBootDevice => onLaunchApp => onBeforeEach => onShutdownDevice => onAfterEach => onAfterAll",
  });

  testScenario({
    type: 'edge case',
    description: "during test: launch app and shut down the device",
    scenario: "onBootDevice => onBeforeEach => onLaunchApp => onShutdownDevice => onAfterEach => onAfterAll",
  });

  testScenario({
    type: 'edge case',
    description: "launch the app, shut down the device before the test starts, do nothing in the test",
    scenario: "onBootDevice => onLaunchApp => onShutdownDevice => onBeforeEach => onAfterEach => onAfterAll",
  });

  testScenario({
    type: 'edge case',
    description: "don't launch the app, shut down the device before the test starts, do nothing in the test",
    scenario: "onBootDevice => onShutdownDevice => onBeforeEach => onAfterEach => onAfterAll",
  });

  testScenario({
    type: 'edge case',
    description: "don't launch the app, shut down the device in the middle of test, do nothing in the test",
    scenario: "onBootDevice => onBeforeEach => onShutdownDevice => onAfterEach => onAfterAll",
  });

  testScenario({
    type: 'edge case',
    description: "relaunch app during test and shutdown the device",
    scenario: "onBootDevice => onLaunchApp => onBeforeEach => onLaunchApp => onShutdownDevice => onAfterEach => onAfterAll",
  });

  testScenario({
    type: 'edge case',
    description: "launch, relaunch app and shutdown the device during the same test",
    scenario: "onBootDevice => onBeforeEach => onLaunchApp => onLaunchApp => onShutdownDevice => onAfterEach => onAfterAll",
  });

  testScenario({
    type: 'edge case',
    description: "boot device, launch app, shutdown and boot again before test",
    scenario: "onBootDevice => onLaunchApp => onShutdownDevice => onBootDevice => onBeforeEach => onAfterEach => onAfterAll",
  });

  function testScenario({ type, description, scenario }) {
    it(`${description}`, async () => {
      let pid = 2018;
      let testNumber = 1;

      const params = {
        onBootDevice: jest.fn().mockReturnValue({
          deviceId: 'testDevice',
        }),
        onShutdownDevice: jest.fn().mockReturnValue({
          deviceId: 'testDevice',
        }),
        onLaunchApp: jest.fn().mockImplementation(() => ({
          deviceId: 'testDevice',
          bundleId: 'com.conformance.test.app',
          pid: pid++,
        })),
        onBeforeEach: jest.fn().mockReturnValue(() => ({
          title: `sample test ${testNumber++}`,
          fullName: `conformance sample test ${testNumber}`,
          status: 'running',
        })),
        onAfterEach: jest.fn().mockReturnValue(() => ({
          title: `sample test ${testNumber++}`,
          fullName: `conformance sample test ${testNumber}`,
          status: 'running',
        })),
        onAfterAll: () => {},
      };

      const plugin = createPlugin();
      for (const action of scenario.split(' => ')) {
        const p = params[action]();

        if (action === 'onBeforeEach') {
          await plugin.onBeforeAll();
        }

        await plugin[action](p);
      }
    });
  }
};

