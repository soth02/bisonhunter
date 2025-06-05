const path = require('path');

// Helper to load game module and capture Phaser config
function loadGameAndGetConfig() {
  jest.resetModules();
  global.Phaser = {
    AUTO: 0,
    Game: function(cfg) { global.__capturedConfig = cfg; },
  };
  require('../js/game.js');
  return global.__capturedConfig;
}

test('preload sets asset base path', () => {
  const config = loadGameAndGetConfig();
  const mockSetPath = jest.fn();
  const mockImage = jest.fn();
  const scene = { load: { setPath: mockSetPath, image: mockImage } };
  config.scene.preload.call(scene);
  expect(mockSetPath).toHaveBeenCalledWith('assets');
});
