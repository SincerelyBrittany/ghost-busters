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
        this.initialTime = 60;
        this.text = this.add.text(32,32, 'Time Remaining: ' + this.formatTime(this.initialTime));
        this.image = this.add.image(400, 300, 'logo');
        this.timedEvent = this.time.addEvent({ delay: 100, callback: this.onEvent, callbackScope: this, loop: true});
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