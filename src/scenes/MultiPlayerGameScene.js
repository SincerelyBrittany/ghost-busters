import "phaser";
import logoImg from "../assets/logo.png";
import ghostImg from "../assets/ghost.png";
import candleImg from "../assets/candle.png";

var sprites = {};

export default class MultiPlayerGameScene extends Phaser.Scene {
	constructor() {
		super("MultiPlayerGame");
    }

    init(data) {
        this.socket = data.socket;
        this.gameCode = data.gameCode;
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
        for (var i = 0; i < 3; i++){
            this.pos = Phaser.Geom.Rectangle.Random(this.spriteBounds);
            var candle = this.add.image(0,0, 'candle');
            var ghost = this.add.image(0, 0, 'ghost');
            let randSize = Phaser.Math.Between(1,3);
            ghost.setScale(randSize);
            ghostSizes.push(ghost.displayHeight);
            this.block = this.add.container(this.pos.x, this.pos.y, [candle, ghost])
            this.block.setSize(64,128);
            this.physics.world.enable(this.block);
            ghost.visible = false;
            this.block.setData('key', i);

            sprites[i] = {
                clicked: false,
                container: this.block,
                candle: this.block.list[0],
                ghost: this.block.list[1]
            };

            //velocity setter
            this.block.body.setVelocity(Phaser.Math.Between(200, 300), Phaser.Math.Between(200, 300));
            this.block.body.setBounce(1).setCollideWorldBounds(true);
            if (Math.random() > 0.5){
                this.block.body.velocity.x *= -1;
            }
            else {
                this.block.body.velocity.y *= -1;
            }

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
            gameObject.emit('clicked', gameObject.getData('key'));
        }, this);
        
        // update sprites if they're clicked
        this.socket.emit('sprites', sprites);

        //time for game
        this.initialTime = 30;
        this.text = this.add.text(32,32, 'Time Remaining: ' + this.formatTime(this.initialTime));
        this.timedEvent = this.time.addEvent({ delay: 1000, callback: this.onEvent, callbackScope: this, loop: true});
        this.add.text(600,32, `Room Code: ${this.gameCode}`)
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
        // make sure to continously update whether a candle was clicked on the server
        this.socket.on('updateCandles', (candles) => {
            Object.keys(candles).forEach(key => {
                if (candles[key]['clicked']) {
                    sprites[key]['container'].off("clicked", this.clickHandler);
                    sprites[key]['container'].input.enabled = false;
                    sprites[key]['candle'].setVisible(false);
                    sprites[key]['ghost'].setVisible(true);
                    sprites[key]['container'].body.setVelocity(0);
                    if (sprites[key]['ghost'].displayHeight >= window.biggestGhost) {
                        window.gameOver = true;
                    }
                }
            });
        });

        if (this.initialTime <= 0 || window.gameOver){
            //Modify to show score? and hide sprites
            this.text.setText(`Game Over. You have a score of ${this.initialTime}`);
        }
    }

    clickHandler(key){
        sprites[key]['container'].off("clicked", this.clickHandler);
        sprites[key]['container'].input.enabled = false;
        sprites[key]['candle'].setVisible(false);
        sprites[key]['ghost'].setVisible(true);
        sprites[key]['container'].body.setVelocity(0);
        if (sprites[key]['ghost'].displayHeight >= window.biggestGhost) {
            window.gameOver = true;
        }
        this.socket.emit("clicked", key);
    }

    onEvent () {
        this.initialTime -= 1;
        this.text.setText('Time Remaining: ' + this.formatTime(this.initialTime));
        if (this.initialTime <= 0 || window.gameOver){
            this.timedEvent.remove(false);
        }
    }
}
