var config = {
  type: Phaser.AUTO,
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

var game = new Phaser.Game(config);

var target;
var bisonGroup;
var bullets;
var bulletTime = 0;
var bulletSpeed = 600;
var spawnTime = 0;
var startButton;

function preload() {
  this.load.image("target", "assets/target.png");
  this.load.image("bs3", "assets/bs3.png");
  for (var i = 1; i <= 4; i++) {
    this.load.image(`bg${i}`, `assets/bg${i}.png`);
  }
}

function create() {
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

  // Set cursor to none and use the custom target cursor
  this.input.setDefaultCursor("none");
  this.input.on(
    "pointerdown",
    () => {
      fireBullet.call(this);
    },
    this
  );

  this.time.addEvent({
    delay: 2000,
    callback: spawnBison,
    callbackScope: this,
    loop: true,
  });
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
  if (this.time.now > bulletTime) {
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

    bulletTime = 0;
  }
}

function spawnBison() {
  let bison = bisonGroup.getChildren().find((child) => !child.active);

  if (!bison) {
    bison = this.add.image(
      -100,
      this.physics.world.bounds.height * Math.random(),
      "bs3"
    );
    bisonGroup.add(bison);
  } else {
    bison.setPosition(-100, this.physics.world.bounds.height * Math.random());
    bison.setActive(true);
    bison.setVisible(true);
  }

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
  bullet.destroy();
  this.tweens.killTweensOf(bison);

  let flashTween = this.tweens.add({
    targets: bison,
    alpha: 0,
    ease: "Linear",
    duration: 100,
    yoyo: true,
    repeat: 4,
    onComplete: function () {
      bison.setActive(false);
      bison.setVisible(false);
    },
  });
}
