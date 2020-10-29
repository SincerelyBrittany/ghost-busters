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
        this.socket.on('isOwner', () => {
            this.isOwner = true;
        });
        console.log(this.isOwner);
        if (this.isOwner) {
            var startBtn = this.add.text(360, 200, "Start");
            startBtn.setInteractive({ useHandCursor: true });
            startBtn.on('pointerdown', () => {this.scene.start('MultiPlayerGame', {socket: this.socket, gameCode: gameCode, otherPlayers: this.otherPlayers})});
        }
        this.socket.on('getPlayers', (players) => {
            // console.log(players)
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

    //Do Game Over in here!
    update() {
        if (!this.isOwner) {
            // Object.keys(sprites).forEach((key) => {
                // let currPos = [sprites[key]['container'].x, sprites[key]['container'].x];
                // let prevPos = [sprites[key]['currentX'], sprites[key]['currentY']];
                // // let prevVel = [sprites[key]['xVel'], sprites[key]['yVel']];
                // // let currVel = [sprites[key]['container'].body.velocity.x, sprites[key]['container'].body.velocity.y];
                // if (currPos !== prevPos) {
                //     //  || prevVel !== currVel
                //     this.socket.emit('updateObj', this.isOwner, key, currPos[0], currPos[1]);
                // }
            // });
        }
    }
}
