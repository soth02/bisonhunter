var getHighScore, updateHighScore;
if (typeof module !== 'undefined' && module.exports) {
  ({ getHighScore, updateHighScore } = require('./highscore.js'));
} else {
  getHighScore = window.getHighScore;
  updateHighScore = window.updateHighScore;
}

var config = {
  type: typeof Phaser !== 'undefined' ? Phaser.AUTO : 0,
  width: 800,
  height: 600,
  scene: {
    preload: preload,
    create: create,
    update: update,
  },
  parent: "game-container",
  physics: {
    default: "arcade", // Add this line to enable Arcade Physics
    arcade: {
      gravity: { y: 0 },
      debug: false,
    },
  },
};

var game;
if (typeof Phaser !== 'undefined') {
  game = new Phaser.Game(config);
}

const GAME_DURATION_MS = 60000;

var target;
var bisonGroup;
var bullets;
var bulletTime = 0;
var bulletSpeed = 600;
var MAX_AMMO = 6;
var ammo = MAX_AMMO;
var spawnTime = 0;
var startButton;
var score = 0;
var scoreText;
var scoreBoard;
var bisonWeight = 1500;
var spawnBisonEvent;
var gameTimer;
var gameOverOverlay;

function preload() {
  this.load.image("target", "assets/target.png");
  this.load.image("bs3", "assets/bs3.png");
  for (var i = 1; i <= 4; i++) {
    this.load.image(`bg${i}`, `assets/bg${i}.png`);
  }
}

function reload() {
  setTimeout(function () {
    ammo = MAX_AMMO;
  }, 500);
}

function create() {
  scoreBoard = document.createElement("div");
  scoreBoard.style.position = "absolute";
  scoreBoard.style.left = game.canvas.offsetLeft + "px";
  scoreBoard.style.top = game.canvas.offsetTop + "px";
  scoreBoard.style.backgroundColor = "rgba(255, 255, 255, 0.5)";
  scoreBoard.style.padding = "10px";
  scoreBoard.style.fontSize = "32px";
  scoreBoard.style.fontWeight = "bold";
  scoreBoard.innerText =
    "Score: 0 lbs (High: " + getHighScore() + " lbs)";
  document.body.appendChild(scoreBoard);
  scoreText = this.add.text(16, 16, "Score: 0 lbs", {
    fontSize: "32px",
    fill: "#000",
  });

  var bgNumber = Math.floor(Math.random() * 4) + 1;
  this.add.image(0, 0, `bg${bgNumber}`).setOrigin(0, 0);

  startButton = document.createElement("button");
  startButton.innerText = "Start Game";
  startButton.style.position = "absolute";
  startButton.style.left =
    game.canvas.offsetLeft + game.canvas.width / 2 - 50 + "px";
  startButton.style.top = game.canvas.offsetTop + 200 + "px";
  startButton.addEventListener("click", () => {
    startGame.call(this);
  });
  document.body.appendChild(startButton);

  bisonGroup = this.add.group();
}

function startGame() {
  startButton.style.display = "none";
  this.cameras.main.setBackgroundColor("#FFFFFF");

  target = this.add.image(
    this.input.activePointer.x,
    this.input.activePointer.y,
    "target"
  );

  bullets = this.add.group(); // Initialize bullets group
  this.input.keyboard.on('keydown-R', reload, this);

  // Set cursor to none and use the custom target cursor
  this.input.setDefaultCursor("none");

  this.input.on(
    "pointerdown",
    function (pointer) {
      pointer.event.preventDefault();
      fireBullet.call(this);
    },
    this
  );

  spawnBisonEvent = this.time.addEvent({
    delay: 2000,
    callback: spawnBison,
    callbackScope: this,
    loop: true,
  });

  gameTimer = this.time.delayedCall(GAME_DURATION_MS, endGame, [], this);
}

// Update function
function update() {
  if (target) {
    target.x = this.input.activePointer.x;
    target.y = this.input.activePointer.y;

    // Update bullet positions
    bullets.getChildren().forEach((bullet) => {
      if (bullet.active) {
        bullet.x += (bullet.getData("velocityX") * this.game.loop.delta) / 1000;
        bullet.y += (bullet.getData("velocityY") * this.game.loop.delta) / 1000;

        // Shrink the bullet's size
        let scaleChange = 0.002;
        bullet.setScale(
          Math.max(bullet.scaleX - scaleChange, 0),
          Math.max(bullet.scaleY - scaleChange, 0)
        );

        if (bullet.scaleX <= 0 && bullet.scaleY <= 0) {
          bullet.destroy();
        }
      }

      // Check for collisions between bullets and bisons
      bisonGroup.getChildren().forEach((bison) => {
        if (bullet.active && bison.active) {
          let distance = Phaser.Math.Distance.Between(
            bullet.x,
            bullet.y,
            bison.x,
            bison.y
          );

          if (distance < bison.width / 2) {
            bisonHit.call(this, bison, bullet);
          }
        }
      });
    });
  }
}

// Updated fireBullet function
function fireBullet() {
  if (this.time.now > bulletTime && ammo > 0) {
    // Spawn bullet at the bottom middle of the game board
    var bullet = this.add.circle(
      game.config.width / 2,
      game.config.height,
      10,
      0x000000
    );
    bullets.add(bullet);

    // Calculate angle between the new spawn position and the target cursor
    var angle = Phaser.Math.Angle.BetweenPoints(
      { x: game.config.width / 2, y: game.config.height },
      this.input.activePointer
    );

    bullet.setData("velocityX", Math.cos(angle) * bulletSpeed);
    bullet.setData("velocityY", Math.sin(angle) * bulletSpeed);

    ammo -= 1;
    bulletTime = 0;
  }
}

function spawnBison() {
  let bisonSize = Math.random() < 0.5 ? 0.5 : 1.5;
  bisonWeight = bisonSize === 0.5 ? 500 : 3000;
  let bison = bisonGroup.getChildren().find((child) => !child.active);

  if (!bison) {
    bison = this.add.image(
      -100,
      this.physics.world.bounds.height * Math.random(),
      "bs3"
    );
    bison.setScale(bisonSize);
    bisonGroup.add(bison);
  } else {
    bison.setPosition(-100, this.physics.world.bounds.height * Math.random());
    bison.setScale(bisonSize);
    bison.setActive(true);
    bison.setVisible(true);
  }

  bison.setData("hit", false); // Initialize the hit flag

  this.tweens.add({
    targets: bison,
    x: game.config.width + 100,
    ease: "Linear",
    duration: 4000,
    onComplete: function () {
      bison.setActive(false);
      bison.setVisible(false);
    },
  });
}

function bisonHit(bison, bullet) {
  score += bisonWeight;
  scoreText.setText("Score: " + score + " lbs");
  var high = updateHighScore(score);
  scoreBoard.innerText =
    "Score: " + score + " lbs (High: " + high + " lbs)";

  bullet.destroy();
  this.tweens.killTweensOf(bison);
  bison.setActive(false);
  bison.data.hit = true;

bison.flashTween = this.tweens.add({
    targets: bison,
    alpha: 0.5,
    ease: "Linear",
    duration: 100,
    yoyo: true,
    repeat: 4,
    onComplete: function () {
      if (bison.data.hit) {
        bison.setVisible(false);
        bison.data.hit = false;
      }
    },
  });
}

function endGame() {
  if (spawnBisonEvent) {
    spawnBisonEvent.remove(false);
  }
  if (this.input && this.input.off) {
    this.input.off('pointerdown');
  }

  if (!gameOverOverlay) {
    gameOverOverlay = document.createElement('div');
    gameOverOverlay.innerText = 'Game Over';
    gameOverOverlay.style.position = 'absolute';
    gameOverOverlay.style.left =
      game.canvas.offsetLeft + game.canvas.width / 2 - 100 + 'px';
    gameOverOverlay.style.top =
      game.canvas.offsetTop + game.canvas.height / 2 - 50 + 'px';
    gameOverOverlay.style.fontSize = '48px';
    gameOverOverlay.style.fontWeight = 'bold';
    gameOverOverlay.style.backgroundColor = 'rgba(0,0,0,0.7)';
    gameOverOverlay.style.color = '#fff';
    gameOverOverlay.style.padding = '20px';
    document.body.appendChild(gameOverOverlay);
  }
}

if (typeof module !== "undefined") {

  module.exports = { bisonHit, fireBullet, reload, __setTestVars, __getTestVars, endGame };

}

function __setTestVars(vars) {
  if ("scoreText" in vars) scoreText = vars.scoreText;
  if ("scoreBoard" in vars) scoreBoard = vars.scoreBoard;
  if ("score" in vars) score = vars.score;
  if ("bisonWeight" in vars) bisonWeight = vars.bisonWeight;
  if ("spawnBisonEvent" in vars) spawnBisonEvent = vars.spawnBisonEvent;
  if ("game" in vars) game = vars.game;
  if ("ammo" in vars) ammo = vars.ammo;
  if ("MAX_AMMO" in vars) MAX_AMMO = vars.MAX_AMMO;
  if ("bullets" in vars) bullets = vars.bullets;
}

function __getTestVars() {
  return { ammo, MAX_AMMO, bullets };

}
