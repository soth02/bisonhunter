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
};

var game = new Phaser.Game(config);

var target;
var bisonGroup;
var bullets;
var bulletTime = 0;
var spawnTime = 0;
var startButton;

function preload() {
  this.load.image("target", "assets/smallTarget.png");
  for (var i = 1; i <= 8; i++) {
    this.load.image(`bison${i}`, `assets/bison${i}.png`);
  }
  for (var i = 1; i <= 4; i++) {
    this.load.image(`bg${i}`, `assets/bg${i}.png`);
  }
  this.load.spritesheet("bison", "assets/bison.png", {
    frameWidth: 72,
    frameHeight: 48,
  });
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

  // Load the bison animations
  this.anims.create({
    key: "run",
    frames: this.anims.generateFrameNumbers("bison", { start: 0, end: 6 }),
    frameRate: 10,
    repeat: -1,
  });
  this.anims.create({
    key: "hit",
    frames: [{ key: "bison", frame: 7 }],
  });
}

function startGame() {
  startButton.style.display = "none";
  this.cameras.main.setBackgroundColor("#FFFFFF");

  target = this.add.sprite(
    this.input.activePointer.x,
    this.input.activePointer.y,
    null
  );

  bisonGroup = this.add.group();
  bullets = this.add.group();

  bullets.enableBody = true;
  bullets.physicsBodyType = Phaser.Physics.ARCADE;

  this.input.on(
    "pointerdown",
    () => {
      fireBullet.call(this);
    },
    this
  );

  spawnBison.call(this);
}

function update() {
  if (target) {
    target.x = this.input.activePointer.x;
    target.y = this.input.activePointer.y;

    if (this.time.now > spawnTime) {
      spawnBison.call(this);
      spawnTime = this.time.now + 1000;
    }
  }
}

function fireBullet() {
  if (this.time.now > bulletTime) {
    var bullet = this.add.graphics(0, 0);
    bullet.beginFill(0x000000);
    bullet.drawCircle(0, 0, 10);
    bullet.endFill();
    bullet.x = target.x;
    bullet.y = target.y;
    bullets.add(bullet);

    this.physics.moveTo(
      bullet,
      this.input.activePointer.x,
      this.input.activePointer.y,
      300
    );
    bulletTime = this.time.now + 400;
  }
}

function spawnBison() {
  var bison = this.add.sprite(
    -100,
    Math.floor(Math.random() * (game.config.height - 100)),
    "bison"
  );
  bison.play("run");
  bisonGroup.add(bison);

  this.tweens.add({
    targets: bison,
    x: game.config.width + 100,
    ease: "Linear",
    duration: 3000,
    onComplete: () => {
      bison.destroy();
    },
  });
}
