import Phaser from "phaser";
import config from './config/config';
import BootScene from './scenes/BootScene';
import MainScene from './scenes/MainScene';
import GameScene from './scenes/GameScene';
import MultiPlayerGameScene from './scenes/MultiPlayerGameScene';
import MultiPlayerHomeScene from './scenes/MultiPlayerHomeScene';

const socket = io('http://localhost:3000/');

let bootScene = new BootScene();
let mainScene = new MainScene();
let gameScene = new GameScene();
let multiPlayerGameScene = new MultiPlayerGameScene();
let multiPlayerHomeScene = new MultiPlayerHomeScene();


class Game extends Phaser.Game {
  constructor() {
    super(config);
    this.scene.add('Boot', bootScene);
    this.scene.add("Game", gameScene);
    this.scene.add("Main", mainScene);
    this.scene.add("MultiPlayerHome", multiPlayerHomeScene);
    this.scene.add("MultiPlayerGame", multiPlayerGameScene);
    this.scene.start('Boot', { socket: socket });
  }
}

window.onload = function () {
  window.game = new Game();
}
