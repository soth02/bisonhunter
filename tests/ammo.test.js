global.Phaser = {
  AUTO: 0,
  Game: function(config) { this.config = config; },
  Math: { Angle: { BetweenPoints: () => 0 } }
};
const { fireBullet, reload, __setTestVars, __getTestVars } = require('../js/game.js');

jest.useFakeTimers();

describe('ammo mechanics', () => {
  beforeEach(() => {
    __setTestVars({ ammo: 2, MAX_AMMO: 2, bullets: { added: 0, add() { this.added++; } } });
  });

  test('ammo decreases when firing', () => {
    const context = { time: { now: 1000 }, add: { circle: () => ({ setData() {} }) }, input: { activePointer: { x:0, y:0 } } };
    fireBullet.call(context);
    expect(__getTestVars().ammo).toBe(1);
  });

  test('cannot fire when ammo is zero', () => {
    __setTestVars({ ammo: 0, bullets: { added: 0, add() { this.added++; } } });
    const context = { time: { now: 1000 }, add: { circle: () => ({ setData() {} }) }, input: { activePointer: { x:0, y:0 } } };
    fireBullet.call(context);
    expect(__getTestVars().ammo).toBe(0);
  });

  test('reload resets ammo after delay', () => {
    __setTestVars({ ammo: 0, MAX_AMMO: 2 });
    reload();
    jest.advanceTimersByTime(500);
    expect(__getTestVars().ammo).toBe(2);
});
});
