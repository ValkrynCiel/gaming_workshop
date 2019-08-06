// extend Phaser.Sprite
function Hero(game, x, y) {
  Phaser.Sprite.call(this, game, x, y, 'hero');
  // Phaser usually handles sprites by their center. 0 = left, down; 1 = right, up;
  this.anchor.set(0.5, 0.5);
  //physics engine
  this.game.physics.enable(this);
  //world boundaries
  this.body.collideWorldBounds = true;
};

Hero.prototype = Object.create(Phaser.Sprite.prototype);

Hero.prototype.constructer = Hero;

Hero.prototype.move = function (direction) {
  const SPEED = 200;
  this.body.velocity.x = direction * SPEED;
}

Hero.prototype.jump = function () {
  const JUMP_SPEED = 600;
  let canJump = this.body.touching.down;

  if (canJump) {
    this.body.velocity.y = -JUMP_SPEED;
  }

  return canJump;
}

PlayState = {};

PlayState.init = function () {
  // adding keys allows PlayState to listen for input
  this.game.renderer.renderSession.roundPixels = true;
  this.keys = this.game.input.keyboard.addKeys({
    left: Phaser.KeyCode.LEFT,
    right: Phaser.KeyCode.RIGHT,
    up: Phaser.KeyCode.UP
  });
  // listen for key press
  this.keys.up.onDown.add(function () {
    let didJump = this.hero.jump();
    if (didJump) {
      this.sfx.jump.play();
    }
  }, this);
}

// load game assets
PlayState.preload = function () {
  this.game.load.json('level:1', 'data/level01.json');
  this.game.load.image('background', 'images/background.png');
  this.game.load.image('ground', 'images/ground.png');
  this.game.load.image('grass:8x1', 'images/grass_8x1.png');
  this.game.load.image('grass:6x1', 'images/grass_6x1.png');
  this.game.load.image('grass:4x1', 'images/grass_4x1.png');
  this.game.load.image('grass:2x1', 'images/grass_2x1.png');
  this.game.load.image('grass:1x1', 'images/grass_1x1.png');
  this.game.load.image('hero', 'images/hero_stopped.png');
  this.game.load.audio('sfx:jump', 'audio/jump.wav');
  this.game.load.audio('sfx:coin', 'audio/coin.wav');
  this.game.load.spritesheet('coin', 'images/coin_animated.png', 22, 22);
};

// create game entities and set up world
PlayState.create = function () {
  this.game.add.image(0, 0, 'background');
  this._loadLevel(this.game.cache.getJSON('level:1'));
  //sound entities;
  this.sfx = {
    jump: this.game.add.audio('sfx:jump'),
    coin: this.game.add.audio('sfx:coin')
  }
};

PlayState.update = function () {
  this._handleCollisions();
  this._handleInput();
};

PlayState._loadLevel = function (data) {
  //create groups/layers
  this.platforms = this.game.add.group();
  this.coins = this.game.add.group();
  //instead of defining gravity in PlayState.init this allows for flexibility to define gravity in JSON for different types of gravity
  const GRAVITY = 1200;
  this.game.physics.arcade.gravity.y = GRAVITY;
  //spawns all platforms
  data.platforms.forEach(this._spawnPlatform, this);
  this._spawnCharacters({ hero: data.hero });
  data.coins.forEach(this._spawnCoin, this);
};

PlayState._spawnPlatform = function (platform) {
  // updated to create groups of sprites that do not allow for gravity;
  let sprite = this.platforms.create(platform.x, platform.y, platform.image);
  this.game.physics.enable(sprite);
  sprite.body.allowGravity = false;
  // cannot be moved when colliding
  sprite.body.immovable = true;
};

PlayState._spawnCharacters = function (data) {
  this.hero = new Hero(this.game, data.hero.x, data.hero.y);
  this.game.add.existing(this.hero);
}

PlayState._spawnCoin = function (coin) {
  let sprite = this.coins.create(coin.x, coin.y, 'coin');
  sprite.anchor.set(0.5, 0.5);
  sprite.animations.add('rotate', [0, 1, 2, 1], 6, true); // 6fps, looped
  sprite.animations.play('rotate');
  this.game.physics.enable(sprite);
  sprite.body.allowGravity = false;
};

PlayState._handleInput = function () {
  // checks which input is being held and moves sprite (Hero)
  if (this.keys.left.isDown) {
    this.hero.move(-1);
  } else if (this.keys.right.isDown) {
    this.hero.move(1);
  } else {
    this.hero.move(0);
  }
}

PlayState._handleCollisions = function () {
  //collide
  this.game.physics.arcade.collide(this.hero, this.platforms);
  //overlap
  this.game.physics.arcade.overlap(this.hero, this.coins, this._onHeroVsCoin,
    null, this);
}

PlayState._onHeroVsCoin = function (hero, coin) {
  this.sfx.coin.play();
  coin.kill();
};

window.onload = function () {
    let game = new Phaser.Game(960, 600, Phaser.AUTO, 'game');
    game.state.add('play', PlayState);
    game.state.start('play');
};