import "phaser";
import ghostImg from "../assets/ghost.png";

export default class SceneMain extends Phaser.Scene {
	constructor() {
		super("Main");
	}

	create() {
		this.load.image("ghost", ghostImg);
	}

	// update() {
	//     const ghost = this.add.image(400, 150, "ghost")
	// }

	clickButton() {
		this.scene.switch("Game");
	}

	create() {
		const candle = this.add.image(500, 150, "candle");
		var text = this.add.text(100, 100, "Single Player Game");
		text.setInteractive({ useHandCursor: true });
		text.on("pointerdown", () => this.clickButton());
		var text = this.add.text(100, 150, "Multiplayer Game - Coming Soon");
	}
}
