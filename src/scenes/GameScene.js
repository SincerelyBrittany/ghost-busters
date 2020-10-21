import 'phaser';
import logoImg from "../assets/logo.png";

export default class GameScene extends Phaser.Scene{
    constructor() {
        super('Game');
    }

    preload(){
        this.load.image("logo", logoImg);
    }

    create() {
        const logo = this.add.image(400, 150, "logo");
        var text = this.add.text(100,100, 'Welcome To My Game!');
    }

    update() {
        
    }
}