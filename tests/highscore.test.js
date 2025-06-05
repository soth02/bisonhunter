const { getHighScore, updateHighScore } = require('../js/highscore.js');

describe('high score management', () => {
  beforeEach(() => {
    // reset internal store
    delete getHighScore._score;
    if (typeof localStorage !== 'undefined' && localStorage.removeItem) {
      localStorage.removeItem('highscore');
    }
  });

  test('fetching high score when none exists returns 0', () => {
    expect(getHighScore()).toBe(0);
  });

  test('updating the high score persists the larger value', () => {
    updateHighScore(10);
    expect(getHighScore()).toBe(10);
    updateHighScore(5);
    expect(getHighScore()).toBe(10);
    updateHighScore(15);
    expect(getHighScore()).toBe(15);
  });
});
