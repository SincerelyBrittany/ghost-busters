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
            startBtn.on('pointerdown', () => {		//Boundaries
                let spriteBounds = Phaser.Geom.Rectangle.Inflate(Phaser.Geom.Rectangle.Clone(this.physics.world.bounds), -100, -100);
                let pos = Phaser.Geom.Rectangle.Random(spriteBounds);
                let sprites = {};
                let ghostScales = [];
                for (var i = 0; i < 3; i++){
                    sprites[i] = {
                        key: i,
                        candleClicked: false,
                        initPos: pos,
                        currentX: pos.x,
                        currentY: pos.y,
                        xVel: Phaser.Math.Between(200, 300),
                        yVel: Phaser.Math.Between(200, 300),
                        container: {},
                        candleVis: true,
                        ghostVis: false,
                        ghostScale: Phaser.Math.Between(1,3)
                    };
                    ghostScales.push(sprites[i].ghostScale);
                }
        
                let biggest = ghostScales[0];
                ghostScales.forEach((ghost) => {
                    if (Math.round(ghost) > biggest) {
                        biggest = Math.round(ghost);
                    }
                })
                this.biggest = biggest;
                this.time = 30;
                this.socket.emit('startGame', sprites, this.biggest, this.time);
            });
        });
        
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
        this.socket.on('startGame', (sprites, biggestGhost, time)=> {
            this.scene.stop('MultiPlayerLobby');
            this.scene.start('MultiPlayerGame', {
                socket: this.socket,
                isOwner: this.isOwner,
                gameCode: this.gameCode,
                otherPlayers: this.otherPlayers,
                sprites: sprites,
                biggestGhost: biggestGhost,
                time: time
            });
        });
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
