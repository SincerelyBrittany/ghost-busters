import 'phaser';
import logoImg from "../assets/logo.png";
import ghostImg from '../assets/ghost.png';
import candleImg from '../assets/candle.png';
import config from '../config/config';

const width = config.width;
const height = config.height;

export default class GameScene extends Phaser.Scene{
    constructor() {
        super('Game');
    }
    
    preload(){
        this.load.image("logo", logoImg);
        this.load.image('ghost', ghostImg);
        this.load.image('candle', candleImg);

    }

    create() {
        var sprites = [];
        for (var i = 0; i < 10; i++) {
            sprites += this.spawnSprite();
        }
        // const logo = this.add.image(400, 150, "logo");
        var text = this.add.text(100,100, 'Welcome To My Game!');
        
    }

    spawnSprite() {
        // find random coordinate within the screen
        var ghostX = Phaser.Math.Between(0, width);
        var ghostY = Phaser.Math.Between(0, height);

        var sprite = this.add.group();

        var ghost = this.add.sprite(ghostX ,ghostY, "ghost");
        // scale ghost to be different sizes
        var ghostH = Phaser.Math.Between(50,300);
        ghost.displayHeight = ghostH;
        ghost.scaleX = ghost.scaleY;
        sprite.add(ghost);

        var candleX = ghostX-(ghost.displayWidth/3);
        var candleY = ghostY-(ghost.displayHeight/3);
        var candle = this.add.sprite(candleX, candleY, "candle").setInteractive();
        candle.on('pointerdown', function (pointer) {
            this.setTint(0xff0000);
            console.log(pointer);
            console.log(`the ghost was ${ghost.displayHeight} big`);
        });
        candle.on('pointerout', function (pointer) {
            this.clearTint();
        });
        candle.on('pointerup', function (pointer) {
            this.clearTint();
        });
        // scale candle to be different sizes
        var h = Phaser.Math.Between(50,300);
        candle.displayHeight = h;
        candle.scaleX = candle.scaleY;

        sprite.add(candle);
        
        return sprite
    }

    update() {
        
    }
}