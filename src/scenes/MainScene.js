import 'phaser';
import ghostImg from "../assets/ghost.png"

export default class SceneMain extends Phaser.Scene {
	constructor() {
		super("Main");
    }
    init(data) {
        this.socket = data.socket;
    }

	create() {
		this.load.image("ghost", ghostImg);
	}

	singlePlayerButton() {
		this.scene.start("Game", { socket: this.socket });
	}

	multiplePlayerHomeButton() {
		this.scene.start("MultiPlayerHome", { socket: this.socket });
	}

	create() {
		const candle = this.add.image(500, 150, "candle");
		var singlePlayer = this.add.text(100, 100, "Single Player Game");
		singlePlayer.setInteractive({ useHandCursor: true });
		singlePlayer.on("pointerdown", () => this.singlePlayerButton());
		var multiPlayer = this.add.text(100, 150, "Multiplayer Game");
		multiPlayer.setInteractive({ useHandCursor: true });
		multiPlayer.on("pointerdown", () => this.multiplePlayerHomeButton());
	}
}
