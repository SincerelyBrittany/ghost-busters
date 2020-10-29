import 'phaser'
// import candleImg from "../assets/candle.png";

export default class SceneBoot extends Phaser.Scene {
    constructor() {
        super();
    }
    init(data) {
        this.socket = data.socket;
    }

    preload() {
        // this.load.image("candle", candleImg)
    }

    clickButton() {
        this.scene.start('Main', { socket: this.socket });
    }

    create() {
        // const candle = this.add.image(500, 150, "candle");
        var text = this.add.text(100,100, 'Press Here To Start');
        text.setInteractive({ useHandCursor: true });
        text.on('pointerdown', () => this.clickButton());
    }
}
