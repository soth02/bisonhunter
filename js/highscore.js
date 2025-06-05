function getHighScore() {
  if (typeof localStorage === 'undefined') {
    return getHighScore._score || 0;
  }
  const stored = localStorage.getItem('highscore');
  return stored ? parseInt(stored, 10) : 0;
}

function updateHighScore(newScore) {
  const current = getHighScore();
  if (newScore > current) {
    if (typeof localStorage === 'undefined') {
      getHighScore._score = newScore;
    } else {
      localStorage.setItem('highscore', newScore);
    }
  }
  return getHighScore();
}

if (typeof module !== 'undefined') {
  module.exports = { getHighScore, updateHighScore };
}
