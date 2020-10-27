import 'phaser';
import logoImg from "../assets/logo.png";
import candleImg from "../assets/candle.png";
import ghostImg from "../assets/ghost.png";



export default class GameScene extends Phaser.Scene{
    constructor() {
        super('Game');
    }

    preload(){
        this.load.image("logo", logoImg);
        this.load.image("candle", candleImg);
        this.load.image('ghost', ghostImg);
    }

    create() {
        //Boundaries
        this.physics.world.setBoundsCollision(true, true, true, true);
        //Manual Boundaries
        //this.physics.world.setBounds(0, 0, 800, 600);

        this.spriteBounds = Phaser.Geom.Rectangle.Inflate(Phaser.Geom.Rectangle.Clone(this.physics.world.bounds), -100, -100);

        for (var i = 0; i < 10; i++){
            this.pos = Phaser.Geom.Rectangle.Random(this.spriteBounds);
            this.block = this.physics.add.sprite(this.pos.x, this.pos.y, 'candle');

            //velocity setter
            this.block.setVelocity(Phaser.Math.Between(200, 300), Phaser.Math.Between(200, 300));
            this.block.setBounce(1).setCollideWorldBounds(true);
            if (Math.random() > 0.5){
                this.block.body.velocity.x *= -1;
            }
            else {
                this.block.body.velocity.y *= -1;
            }

            //candle interactions
            this.block.setInteractive();
            this.block.on('clicked', this.clickHandler, this);
            console.log("candle create");
        }

        //If candle is clicked on, the event is fired. It will emit 'clicked' event.
        this.input.on('gameobjectup', function (pointer, gameObject){
            gameObject.emit('clicked', gameObject);
        }, this);
        

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

    //Do Game Over in here!
    update() {
        if (this.initialTime <= 0){
            //Modify to show score? and hide sprites
            this.text.setText('Game Over');
        }
    }

    clickHandler(block){
        console.log("Click Handler");
        block.off("clicked", this.clickHandler);
        block.input.enabled = false;
        block.setVisible(false);

        block = this.add.image(block.x , block.y ,'ghost');
    }

    onEvent () {
        this.initialTime -= 1;
        this.text.setText('Time Remaining: ' + this.formatTime(this.initialTime));
        if (this.initialTime <= 0){
            this.timedEvent.remove(false);
        }
    }
}