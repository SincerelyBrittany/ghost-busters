import "phaser";
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
	}
    
	create() {
        var text;
        var joinGameCodeHTML = "<div class='form-group'>\
        <input type='text' placeholder='Enter Game Code' name='gameCodeInput'/>\
        </div>"
        var joinGameCode = this.add.dom(400, 250).createFromHTML(joinGameCodeHTML);

        var newGameBtn = this.add.text(360, 200, "New Game");
		newGameBtn.setInteractive({ useHandCursor: true });
        newGameBtn.on('pointerdown', () => {this.socket.emit('newGame')});
        
        var joinGameBtn = this.add.text(355, 300, "Join Game");
		joinGameBtn.setInteractive({ useHandCursor: true });
        joinGameBtn.on('pointerdown', () => {
            var gameCode = joinGameCode.getChildByName('gameCodeInput');
            //  Have they entered anything?
            if (gameCode.value !== '' ){
                //  Turn off the click events   
                this.socket.emit('joinGame', gameCode.value)
                this.socket.on('unknownCode', () => {
                    text = this.add.text(320,350, 'Invalid game code.')
                });
                this.socket.on('joinGame', () => {
                    this.scene.start('MultiPlayerGame', { gameCode: gameCode.value, users: [this.socket.id]});
                });
            } else {
                text = this.add.text(250,100, "Submit game code or create new game");
            }
        });
        this.socket.on('newGame', (gameCode) => {
            console.log(gameCode);
            this.scene.start('MultiPlayerGame', { gameCode: gameCode, users: [this.socket.id]});
        });


        this.tweens.add({
            targets: text
        });
	}
	
	update() {
        
    }
}
