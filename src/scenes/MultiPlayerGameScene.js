import "phaser";
import ghostImg from "../assets/ghost.png";
import candleImg from "../assets/candle.png";

export default class MultiPlayerGameScene extends Phaser.Scene {
	constructor() {
		super("MultiPlayerGame");
    }

    init(data) {
        this.socket = data.socket;
        this.isOwner = data.isOwner;
        this.gameCode = data.gameCode; 
        this.otherPlayers = data.otherPlayers;
        this.sprites = data.sprites;
        this.biggestGhost = data.biggestGhost;
        this.timer = data.time;
    }

	preload(){
        this.load.image("candle", candleImg);
        this.load.image('ghost', ghostImg);
    }

	create() {
        // console.log(this.isOwner);

		//Boundaries
        this.physics.world.setBoundsCollision(true, true, true, true);
        //Manual Boundaries
        //this.physics.world.setBounds(0, 0, 800, 600);

        this.spriteBounds = Phaser.Geom.Rectangle.Inflate(Phaser.Geom.Rectangle.Clone(this.physics.world.bounds), -100, -100);
        
        window.gameOver = false;
        this.displayedOver = false;

        for (var i = 0; i < 3; i++){
            var candle = this.add.image(0,0, 'candle');
            candle.setVisible(this.sprites[i]['candleVis'])
            var ghost = this.add.image(0, 0, 'ghost');
            ghost.setScale(this.sprites[i]['ghostScale']);
            if (this.sprites[i]['ghostScale'] === this.biggestGhost) {
                this.biggestGhost = ghost.displayHeight;
            }
            ghost.setVisible(this.sprites['ghostVis']);

            this.block = this.add.container(this.sprites[i]['initPos'].x, this.sprites[i]['initPos'].y, [candle, ghost])
            this.block.setSize(64,128);
            this.physics.world.enable(this.block);
            this.block.setData('key', i);

            let xVel = this.sprites['xVel']
            let yVel = this.sprites['yVel']

            this.sprites[i]['container'] = this.block;
            this.sprites[i]['candle'] = this.block.list[0];
            this.sprites[i]['ghost'] = this.block.list[1];
            //     key: i,
            //     candleClicked: false,
            //     initPos: this.pos,
            //     currentX: this.block.x,
            //     currentY: this.block.y,
            //     xVel: xVel,
            //     yVel: yVel,
            //     candleVis: true,
            //     ghostScale: randSize,
            //     ghostVis: false,

            //velocity setter
            this.sprites[i]['container'].body.setVelocity(xVel, yVel);
            this.sprites[i]['container'].body.setBounce(1).setCollideWorldBounds(true);
            // if (Math.random() > 0.5){
            //     this.block.body.velocity.x *= -1;
            // }
            // else {
            //     this.block.body.velocity.y *= -1;
            // }
            //candle interactions
            this.sprites[i]['container'].setInteractive();
            this.sprites[i]['container'].on('clicked', this.clickHandler, this);
        }

        //If candle is clicked on, the event is fired. It will emit 'clicked' event.
        this.input.on('gameobjectup', function (pointer, gameObject){
            gameObject.emit('clicked', gameObject.getData('key'));
        }, this);

        // update sprites
        this.socket.emit('sprites', this.sprites);
        
        if (!this.isOwner) {
            this.socket.on('objUpdated', (isOwner, object, key) => {
                if (!isOwner) {
                    this.sprites[key]['container'].setX(object['currentX']);
                    this.sprites[key]['container'].setY(object['currentY']);
                    // this.sprites[key]['container'].body.setVelocity(object['xVel'],object['yVel']);
                    }
                })
        }

        //time for game
        this.text = this.add.text(32,32, 'Time Remaining: ' + this.formatTime(this.timer));
        this.timedEvent = this.time.addEvent({ delay: 1000, callback: this.onEvent, callbackScope: this, loop: true});
        this.add.text(600,32, `Room Code: ${this.gameCode}`)
    }

    // addPlayer(id) {
    //     this.otherPlayers.push(id);
    //     console.log(`you are player ${this.socket.id} and other players are ${this.otherPlayers}`)
    // }

    formatTime(seconds){
        var minutes = Math.floor(seconds/60);
        var partInSeconds = seconds%60;
        partInSeconds = partInSeconds.toString().padStart(2,'0');
        // Returns formated time
        return `${minutes}:${partInSeconds}`;
	}

    //Do Game Over in here!
    update() {
        // if the player isn't the owner, then it is suppose to update positions of sprites
        // if (!this.isOwner) {
        //     Object.keys(this.sprites).forEach((key) => {
        //         let currPos = [this.sprites[key]['container'].x, this.sprites[key]['container'].x];
        //         let prevPos = [this.sprites[key]['currentX'], this.sprites[key]['currentY']];
        //         // let prevVel = [this.sprites[key]['xVel'], this.sprites[key]['yVel']];
        //         // let currVel = [this.sprites[key]['container'].body.velocity.x, this.sprites[key]['container'].body.velocity.y];
        //         if (currPos !== prevPos) {
        //             //  || prevVel !== currVel
        //             this.socket.emit('updateObj', this.isOwner, key, currPos[0], currPos[1]);
        //         }
        //     });
        // }
        // make sure to continously update whether a candle was clicked on the server
        this.socket.on('updateCandles', (candles) => {
            Object.keys(candles).forEach(key => {
                if (candles[key]['clicked']) {
                    this.sprites[key]['container'].off("clicked", this.clickHandler);
                    this.sprites[key]['container'].input.enabled = false;
                    this.sprites[key]['candle'].setVisible(false);
                    this.sprites[key]['ghost'].setVisible(true);
                    this.sprites[key]['container'].body.setVelocity(0);
                    if (this.sprites[key]['ghost'].displayHeight >= this.biggestGhost) {
                        window.gameOver = true;
                    }
                }
            });
        });

        // displayedOver is suppose to prevent from adding text on top of it every time it loops
        if ((this.timer <= 0 || window.gameOver) && !this.displayedOver){
            //Modify to show score? and hide sprites
            this.text.destroy();
            this.add.text(32,32, `Game Over. You have a score of`);
            this.displayedOver = true;
        }
    }

    clickHandler(key){
        this.sprites[key]['container'].off("clicked", this.clickHandler);
        this.sprites[key]['container'].input.enabled = false;
        this.sprites[key]['candle'].setVisible(false);
        this.sprites[key]['ghost'].setVisible(true);
        this.sprites[key]['container'].body.setVelocity(0);
        if (this.sprites[key]['ghost'].displayHeight >= this.biggestGhost) {
            window.gameOver = true;
        }
        this.socket.emit("clicked", key);
    }

    onEvent () {
        this.timer -= 1;
        this.text.setText('Time Remaining: ' + this.formatTime(this.timer));
        if (this.timer <= 0 || window.gameOver){
            this.timedEvent.remove(false);
            this.text.destroy();
        }
    }
}
