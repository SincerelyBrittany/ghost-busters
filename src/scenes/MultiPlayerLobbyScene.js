import "phaser";

export default class MultiPlayerLobbyScene extends Phaser.Scene {
	constructor() {
		super("MultiPlayerLobby");
    }

    init(data) {
        this.socket = data.socket;
        this.gameCode = data.gameCode; 
    }

	preload(){
    }

	create() {
        this.otherPlayers = {};
        this.isOwner = false;

        // check server side, for some reason i can't get 'isOwner' to trigger without this stupid hello
        this.socket.emit('hello');
        // if server says this person is owner, set the value to true
        this.socket.on('isOwner', () => {
            this.isOwner = true;
            console.log(this.isOwner);

            // if they are owner, they have a start button for the game
            var startBtn = this.add.text(360, 200, "Start");
            startBtn.setInteractive({ useHandCursor: true });
            startBtn.on('pointerdown', () => {
                this.socket.emit('startGame');
                this.scene.start('MultiPlayerGame', {socket: this.socket, gameCode: this.gameCode, otherPlayers: this.otherPlayers})
            });
        });

        this.socket.on('getPlayers', (players) => {
            for (var i = 0; i < players.length; i++) {
                if (players[i] !== this.socket.id) {
                    this.addPlayer(players[i]);
                }
            }
        })

        this.socket.on('newPlayer', (id) => {
            this.addPlayer(id);
        })
        
        this.add.text(600,32, `Room Code: ${this.gameCode}`);
        this.add.text(32,32, 'Players in the room:');
        this.add.text(32,64, this.socket.id);

        this.socket.on('startGame', () => {
            this.scene.start('MultiPlayerGame', {socket: this.socket, gameCode: this.gameCode, otherPlayers: this.otherPlayers});
        });
    }

    addPlayer(id) {
        this.otherPlayers[id] = {added: false};
        if (!this.otherPlayers[id]['added']) {
            let yPlacement = Object.keys(this.otherPlayers).length
            this.add.text(32,((yPlacement*32)+64), id);
            this.otherPlayers[id]['added'] = true;
        }
        console.log(`you are player ${this.socket.id} and other players are ${this.otherPlayers}`)
    }

    update() {
    }
}
