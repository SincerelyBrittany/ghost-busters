import Phaser from "phaser";
import config from './config/config';
import BootScene from './scenes/BootScene';
import MainScene from './scenes/MainScene';
import GameScene from './scenes/GameScene';



class Game extends Phaser.Game {
  constructor() {
    super(config);
    this.scene.add('Boot', BootScene);
    this.scene.start('Boot');
  }
}

window.onload = function () {
  window.game = new Game();
}




