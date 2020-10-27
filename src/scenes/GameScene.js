import "phaser";
import logoImg from "../assets/logo.png";
import ghostImg from "../assets/ghost.png";
import candleImg from "../assets/candle.png";
import config from "../config/config";
const width = config.width;
const height = config.height;

export default class GameScene extends Phaser.Scene {
	constructor() {
		super("Game");
    }
    init(data) {
        this.socket = data.socket;
    }
	preload() {
		this.load.image("logo", logoImg);
		this.load.image("ghost", ghostImg);
		this.load.image("candle", candleImg);
	}

    create() {
        this.physics.world.setBoundsCollision(true, true, true, true);
        this.logo = this.physics.add.image(200, 300, 'logo').setCollideWorldBounds(true).setBounce(.5);

        //time for game
        this.initialTime = 30;
        this.text = this.add.text(32,32, 'Time Remaining: ' + this.formatTime(this.initialTime));
        
        this.timedEvent = this.time.addEvent({ delay: 1000, callback: this.onEvent, callbackScope: this, loop: true});

        // array of sprites
		var sprites = [];
        let spiritHeight = [];
		for (var i = 0; i < 5; i++) {
			let spr = this.spawnSprite();
			sprites += spr;
			spiritHeight.push(Math.round(spr.children.entries[0].displayHeight));
		}
		let biggest = spiritHeight[0];
		spiritHeight.forEach((elmt) => {
			if (elmt > biggest) biggest = elmt;
		});
		window.biggest = biggest;
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
    
	spawnSprite() {
		var sprite = this.add.group();
		// find random coordinate within the screen
		var ghostX = Phaser.Math.Between(100, width - 200);
		var ghostY = Phaser.Math.Between(100, height - 200);
		var ghost = this.add.sprite(ghostX, ghostY, "ghost");
		// scale ghost to be different sizes
		var ghostH = Phaser.Math.Between(50, 300);
		ghost.displayHeight = ghostH;
		// ghost.body.setGravity(0, -25);
		ghost.scaleX = ghost.scaleY;
		ghost.visible = false;
		sprite.add(ghost);
		// find relative position for candle
		var candleX = ghostX - ghost.displayWidth / 3 - 50;
		var candleY = ghostY - ghost.displayHeight / 3 - 50;
		var candle = this.add.sprite(candleX, candleY, "candle").setInteractive();
		// scale candle to be different sizes
		var h = Phaser.Math.Between(50, 300);
		candle.displayHeight = h;

		candle.scaleX = candle.scaleY;
		// on candle click
		candle.on("pointerdown", function (pointer) {
			this.setTint(0xff0000);
			ghost.visible = true;
			if (Math.round(ghost.displayHeight) >= window.biggest) {
				window.gameOver = true;
			}
		});
		candle.on("pointerout", function (pointer) {
			this.clearTint();
		});
		candle.on("pointerup", function (pointer) {
			this.clearTint();
		});
		sprite.add(candle);
		return sprite;
	}
	update() {}
}
