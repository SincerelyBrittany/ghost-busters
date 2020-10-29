import Phaser from "phaser";
import config from './config/config';
import BootScene from './scenes/BootScene';
import MainScene from './scenes/MainScene';
import GameScene from './scenes/GameScene';
import MultiPlayerHomeScene from './scenes/MultiPlayerHomeScene';
import MultiPlayerLobbyScene from './scenes/MultiPlayerLobbyScene';
import MultiPlayerGameScene from './scenes/MultiPlayerGameScene';

const socket = io('http://localhost:3000/');

let bootScene = new BootScene();
let mainScene = new MainScene();
let gameScene = new GameScene();
let multiPlayerHomeScene = new MultiPlayerHomeScene();
let multiPlayerLobbyScene = new MultiPlayerLobbyScene();
let multiPlayerGameScene = new MultiPlayerGameScene();


class Game extends Phaser.Game {
  constructor() {
    super(config);
    this.scene.add('Boot', bootScene);
    this.scene.add("Game", gameScene);
    this.scene.add("Main", mainScene);
    this.scene.add("MultiPlayerHome", multiPlayerHomeScene);
    this.scene.add("MultiPlayerLobby", multiPlayerLobbyScene);
    this.scene.add("MultiPlayerGame", multiPlayerGameScene);
    this.scene.start('Boot', { socket: socket });
  }
}

window.onload = function () {
  window.game = new Game();
}
