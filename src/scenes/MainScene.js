import "phaser";
import ghostImg from "../assets/ghost.jpg";

export default class SceneMain extends Phaser.Scene {
	constructor() {
		super("Main");
	}

	create() {
		this.load.image("ghost", ghostImg);
	}

	singlePlayerButton() {
		this.scene.switch("Game");
	}

	multiplePlayerButton() {
		this.scene.switch("MultiPlayer");
	}

	create() {
		const candle = this.add.image(500, 150, "candle");
		var singlePlayer = this.add.text(100, 100, "Single Player Game");
		singlePlayer.setInteractive({ useHandCursor: true });
		singlePlayer.on("pointerdown", () => this.singlePlayerButton());
		var multiPlayer = this.add.text(100, 150, "Multiplayer Game");
		multiPlayer.setInteractive({ useHandCursor: true });
		multiPlayer.on("pointerdown", () => this.multiplePlayerButton());
	}
}
