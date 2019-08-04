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

PlayState = {};

PlayState.init = function () {
  // adding keys allows PlayState to listen for input
  this.game.renderer.renderSession.roundPixels = true;
  this.keys = this.game.input.keyboard.addKeys({
    left: Phaser.KeyCode.LEFT,
    right: Phaser.KeyCode.RIGHT,
  })
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
};

// create game entities and set up world
PlayState.create = function () {
  this.game.add.image(0, 0, 'background');
  this._loadLevel(this.game.cache.getJSON('level:1'));
};

PlayState.update = function () {
  this._handleInput();
};

PlayState._loadLevel = function (data) {
  //spawns all platforms
  data.platforms.forEach(this._spawnPlatform, this);
  this._spawnCharacters({ hero: data.hero });
};

PlayState._spawnPlatform = function (platform) {
  this.game.add.sprite(platform.x, platform.y, platform.image);
};

PlayState._spawnCharacters = function (data) {
  this.hero = new Hero(this.game, data.hero.x, data.hero.y);
  this.game.add. existing(this.hero);
}

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

window.onload = function () {
    let game = new Phaser.Game(960, 600, Phaser.AUTO, 'game');
    game.state.add('play', PlayState);
    game.state.start('play');
};