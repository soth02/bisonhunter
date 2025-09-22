const { bisonHit, __setTestVars } = require('../js/game.js');
const { getHighScore } = require('../js/highscore.js');

describe('bison scoring', () => {
  let scoreText;
  let scoreBoard;

  beforeEach(() => {
    delete getHighScore._score;
    scoreText = { setText: jest.fn() };
    scoreBoard = { innerText: '' };
    __setTestVars({
      score: 0,
      scoreText,
      scoreBoard,
      bisonWeight: 3000,
    });
  });

  function createBison(weight) {
    const dataStore = { weight, hit: false };
    return {
      visible: true,
      active: true,
      data: dataStore,
      setVisible(value) {
        this.visible = value;
      },
      setActive(value) {
        this.active = value;
      },
      setData(key, value) {
        dataStore[key] = value;
      },
      getData(key) {
        return dataStore[key];
      },
    };
  }

  test('uses the individual bison weight when scoring hits', () => {
    const bison = createBison(500);
    const bullet = { destroy: jest.fn() };
    const tweensAdd = jest.fn((config) => {
      if (config.onComplete) {
        config.onComplete();
      }
      return {};
    });
    const context = {
      tweens: {
        killTweensOf: jest.fn(),
        add: tweensAdd,
      },
    };

    bisonHit.call(context, bison, bullet);

    expect(scoreText.setText).toHaveBeenCalledWith('Score: 500 lbs');
    expect(scoreBoard.innerText).toContain('Score: 500 lbs');
  });
});
