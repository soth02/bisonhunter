global.Phaser = { AUTO: 0, Game: function() {} };
const { bisonHit, __setTestVars } = require('../js/game.js');

test('bisonHit hides bison after tween completes', () => {
  const bison = {
    visible: true,
    active: true,
    data: {},
    setVisible(v) { this.visible = v; },
    setActive(v) { this.active = v; },
  };

  const bullet = { destroyed: false, destroy() { this.destroyed = true; } };

  const context = {
    tweens: {
      killTweensOf() {},
      add(config) { if (config.onComplete) config.onComplete(); return {}; },
    },
  };

  const vars = {
    score: 0,
    scoreText: { setText: () => {} },
    scoreBoard: { innerText: '' },
    bisonWeight: 1500,
  };
  __setTestVars(vars);

  bisonHit.call(context, bison, bullet);

  expect(bison.visible).toBe(false);
  expect(bison.data.hit).toBe(false);
  expect(bullet.destroyed).toBe(true);
});
