import "phaser";
import logoImg from "../assets/logo.png";
import ghostImg from "../assets/ghost.png";
import candleImg from "../assets/candle.png";
import config from "../config/config";
const width = config.width;
const height = config.height;

export default class MultiPlayerHomeScene extends Phaser.Scene {
	constructor() {
		super("MultiPlayerHome");
    }
    init(data) {
        this.socket = data.socket;
	}
	preload() {
		this.load.image("logo", logoImg);
		this.load.image("ghost", ghostImg);
        this.load.image("candle", candleImg);
	}

    multiplePlayerGameButton() {
        var gameCode = this.socket.emit('newGame');
        console.log('gameCode' + gameCode.value)
		this.scene.start('MultiPlayerGame', { gameCode: gameCode.value, users: [this.socket.id]});
    }
    
	create() {
        const candle = this.add.image(500, 150, "candle");

        // const logo = this.add.image(400, 150, "logo");
        var joinGameCodeHTML = "<div class='form-group'>\
        <input type='text' placeholder='Enter Game Code' name='gameCodeInput'/>\
        </div>"
        // <button type='submit' class='btn btn-success' name='joinGameButton'>\
        // Join Game\
        // </button>"
        var joinGameCode = this.add.dom(400, 250).createFromHTML(joinGameCodeHTML);

        var newGameBtn = this.add.text(400, 200, "New Game");
		newGameBtn.setInteractive({ useHandCursor: true });
        newGameBtn.on('pointerdown', () => {this.multiplePlayerGameButton()});
        
        var joinGameBtn = this.add.text(400, 300, "Join Game");
		joinGameBtn.setInteractive({ useHandCursor: true });
        joinGameBtn.on('pointerdown', () => {
            var gameCode = joinGameCode.getChildByName('gameCodeInput');
            //  Have they entered anything?
            if (gameCode.value !== '' ){
                //  Turn off the click events   
                console.log(this.socket)
                this.socket.emit('joinGame', gameCode.value)
                this.scene.start('MultiPlayerGame', { gameCode: gameCode.value, users: [this.socket.id]});
            } else {
                this.add.text(100,100, "Submit game code or create new game");
            }
        });
     
        // joinGameBtn.addListener('click');
        // joinGameBtn.on('click', () => {
        //     const gameCode = gameCodeInput.value;
        //     this.socket.emit('joinGame', code);
        // })

        // this.tweens.add({
        //     targets: [gameCodeInput, joinGameBtn]
        // });
	}
	
	update() {}
}
