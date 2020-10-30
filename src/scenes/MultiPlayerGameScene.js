import "phaser";
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
        this.otherPlayers = data.otherPlayers;
    }

	preload(){
        this.load.image("candle", candleImg);
        this.load.image('ghost', ghostImg);
    }

	create() {
        this.score = 0;
        this.isOwner = false;
        this.socket.on('isOwner', () => {
            this.isOwner = true;
        });

        this.initialTime;
        const screenCenterX = this.cameras.main.worldView.x + this.cameras.main.width / 2;
        const screenCenterY = this.cameras.main.worldView.y + this.cameras.main.height / 2;
		//Boundaries
        this.physics.world.setBoundsCollision(true, true, true, true);
        //Manual Boundaries
        //this.physics.world.setBounds(0, 0, 800, 600);
        this.spriteBounds = Phaser.Geom.Rectangle.Inflate(Phaser.Geom.Rectangle.Clone(this.physics.world.bounds), -100, -100);
    
        // var ghostSizes = [];
        for (var i = 0; i < 10; i++){
            this.pos = Phaser.Geom.Rectangle.Random(this.spriteBounds);
            var candle = this.add.image(0,0, 'candle');
            var ghost = this.add.image(0, 0, 'ghost');
            this.block = this.add.container(this.pos.x, this.pos.y, [candle, ghost])
            this.block.setSize(64,128);
            this.physics.world.enable(this.block);
            ghost.visible = false;
            this.block.setData('key', i);

            let velX = Phaser.Math.Between(100, 400);
            let velY = Phaser.Math.Between(100, 400);

            sprites[i] = {
                clicked: false,
                initPos: this.pos,
                currentX: this.block.x,
                currentY: this.block.y,
                container: this.block,
                candle: this.block.list[0],
                ghost: this.block.list[1]
            };

            //velocity setter
            this.block.body.setVelocity(velX, velY);
            this.block.body.setBounce(1).setCollideWorldBounds(true);
            if (Math.random() > 0.5){
                this.block.body.velocity.x *= -1;
            }
            else {
                this.block.body.velocity.y *= -1;
            }

            //ghost sizer
            // let randSize = (velX + velY) * .0035;
            // console.log('Speed: ' + (velX+velY));
            // console.log('Scale: ' + randSize);
            // ghost.setScale(randSize);
            // ghostSizes.push(ghost.displayHeight);

            //candle interactions
            this.block.setInteractive();
            this.block.on('clicked', this.clickHandler, this);
        }

        // No longer using the biggest ghost as a point system
        // let biggestGhost = ghostSizes[0];
        // ghostSizes.forEach((ghost) => {
        //     if (ghost > biggestGhost) {
        //         biggestGhost = ghost;
        //     }
        // })
        // window.biggestGhost = biggestGhost;

        //If candle is clicked on, the event is fired. It will emit 'clicked' event.
        this.input.on('gameobjectup', function (pointer, gameObject){
            gameObject.emit('clicked', gameObject.getData('key'));
        }, this);

        // update sprites
        this.socket.emit('sprites', sprites);

        this.text = this.add.text(32,32, '' );
        this.roomCode = this.add.text(600,32, `Room Code: ${this.gameCode}`);
        //time for game
        let that = this
        this.socket.emit('decTime');
        this.socket.on('decTime', function(i){
             that.timers(i);
        });

        var gameMsg = this.add.text(screenCenterX, screenCenterY, '').setOrigin(0.5);
        this.socket.on('isWinner', (winningId) => {
            this.stopSprites();
            if (winningId === this.socket.id) {
                gameMsg.setText('YOU WON!!!');
                gameMsg.setColor('#0000ff');
                gameMsg.setFontSize(36);
            } else {
                gameMsg.setText('You lost! Try again :)');
                gameMsg.setColor('#ff0000');
                gameMsg.setFontSize(36);
            }
        });
    }

    stopSprites() {
        Object.keys(sprites).forEach(key => {
            sprites[key]['container'].body.setVelocity(0,0);
        })
    }

    timers (i) {
        this.initialTime = i;
        this.text.setText('Time Remaining: ' + this.initialTime );
        this.timedEvent = this.time.addEvent({ delay: 1000, callback: this.onEvent, callbackScope: this, loop: true});
    }

    onEvent () {
        this.text.setText('Time Remaining: ' + this.initialTime)
        if (this.initialTime <= 0){
            this.timedEvent.remove(false);
        }
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
                }
            });
        });

        if (this.initialTime <= 0){
            //Modify to show score? and hide sprites
            this.socket.emit('gameOver', this.socket.id, this.score);
            this.text.setText(`Game Over. You have a score of ${this.score}`);
        }
    }

    clickHandler(key){
        this.score += 10;
        sprites[key]['container'].off("clicked", this.clickHandler);
        sprites[key]['container'].input.enabled = false;
        sprites[key]['candle'].setVisible(false);
        sprites[key]['ghost'].setVisible(true);
        sprites[key]['container'].body.setVelocity(0);
        this.socket.emit("clicked", key);
    }
}
