const path = require('path');

// Ensure a clean require state for game.js
function loadGame() {
  jest.resetModules();
  return require('../js/game.js');
}

test('game module loads without Phaser defined', () => {
  delete global.Phaser;
  expect(() => loadGame()).not.toThrow();
});
