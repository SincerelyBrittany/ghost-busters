import 'phaser';
import logoImg from "../assets/logo.png";
import candleImg from "../assets/candle.png";
import ghostImg from "../assets/ghost.jpg";



export default class GameScene extends Phaser.Scene{
    constructor() {
        super('Game');
    }

    preload(){
        this.load.image("logo", logoImg);
        this.load.image("candle", candleImg);
    }

    create() {
        this.physics.world.setBoundsCollision(true, true, true, true);
        this.logo = this.physics.add.image(200, 300, 'logo').setCollideWorldBounds(true).setBounce(.5);

        //time for game
        this.initialTime = 30;
        this.text = this.add.text(32,32, 'Time Remaining: ' + this.formatTime(this.initialTime));
        
        this.timedEvent = this.time.addEvent({ delay: 1000, callback: this.onEvent, callbackScope: this, loop: true});
    }

    formatTime(seconds){
        var minutes = Math.floor(seconds/60);
        var partInSeconds = seconds%60;
        partInSeconds = partInSeconds.toString().padStart(2,'0');
        // Returns formated time
        return `${minutes}:${partInSeconds}`;
    }

    update() {
        if (this.initialTime <= 0){
            //Modify to show score? and hide sprites
            this.text.setText('Game Over');
        }
    }

    onEvent () {
        this.initialTime -= 1;
        this.text.setText('Time Remaining: ' + this.formatTime(this.initialTime));
        if (this.initialTime <= 0){
            this.timedEvent.remove(false);
        }
    }
}