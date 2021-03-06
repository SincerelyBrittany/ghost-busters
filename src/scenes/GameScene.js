import "phaser";
import logoImg from "../assets/logo.png";
import ghostImg from "../assets/ghost.png";
import candleImg from "../assets/candle.png";

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
        
        window.gameOver = false;
        let ghostSizes = [];
        
        for (var i = 0; i < 10; i++){
            this.pos = Phaser.Geom.Rectangle.Random(this.spriteBounds);
            var candle = this.add.image(0,0, 'candle');
            var ghost = this.add.image(0, 0, 'ghost');
            this.block = this.add.container(this.pos.x, this.pos.y, [candle, ghost])
            this.block.setSize(64,128);
            this.physics.world.enable(this.block);
            ghost.visible = false;

            //velocity setter
            let velX = Phaser.Math.Between(100, 400);
            let velY = Phaser.Math.Between(100, 400);
            this.block.body.setVelocity(velX, velY);
            this.block.body.setBounce(1).setCollideWorldBounds(true);
            if (Math.random() > 0.5){
                this.block.body.velocity.x *= -1;
            }
            else {
                this.block.body.velocity.y *= -1;
            }
            //ghost sizer
            let randSize = (velX + velY) * .0035;
            console.log('Speed: ' + (velX+velY));
            console.log('Scale: ' + randSize);
            ghost.setScale(randSize);
            ghostSizes.push(ghost.displayHeight);

            //candle interactions
            this.block.setInteractive();
            this.block.on('clicked', this.clickHandler, this);
        }

        let biggestGhost = ghostSizes[0];
        ghostSizes.forEach((ghost) => {
            if (ghost > biggestGhost) {
                biggestGhost = ghost;
            }
        })
        window.biggestGhost = biggestGhost;
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
        if (this.initialTime <= 0 || window.gameOver){
            //Modify to show score? and hide sprites
            this.text.setText(`Game Over. You have a score of ${this.initialTime}`);
        }
    }

    clickHandler(block){
        console.log("Click Handler");
        block.off("clicked", this.clickHandler);
        block.input.enabled = false;
        block.list[0].setVisible(false);
        block.list[1].setVisible(true);
        block.body.setVelocity(0);
        if (block.list[1].displayHeight >= window.biggestGhost) {
            window.gameOver = true;
            console.log(window.biggestGhost);
        }
    }

    onEvent () {
        this.initialTime -= 1;
        this.text.setText('Time Remaining: ' + this.formatTime(this.initialTime));
        if (this.initialTime <= 0 || window.gameOver){
            this.timedEvent.remove(false);
        }
    }
}
