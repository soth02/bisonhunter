global.Phaser = { AUTO: 0, Game: function() {} };
const { endGame, __setTestVars } = require('../js/game.js');

test('endGame stops spawning bisons and disables shooting', () => {
  const removeMock = jest.fn();
  const spawnEvent = { remove: removeMock };
  __setTestVars({ spawnBisonEvent: spawnEvent });

  global.document = {
    createElement: () => ({ style: {}, appendChild: jest.fn() }),
    body: { appendChild: jest.fn() }
  };

  const fakeGame = { canvas: { offsetLeft: 0, width: 0, offsetTop: 0, height: 0 } };
  __setTestVars({ game: fakeGame });

  const context = {
    input: { off: jest.fn() }
  };

  endGame.call(context);

  expect(removeMock).toHaveBeenCalled();
  expect(context.input.off).toHaveBeenCalledWith('pointerdown');
});
