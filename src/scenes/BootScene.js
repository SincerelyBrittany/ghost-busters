import 'phaser'
import candleImg from "../assets/1.png";

export default class SceneBoot extends Phaser.Scene {
    constructor() {
        super('Boot');
    }

    preload() {
        this.load.image("candle", candleImg)
    }

    create() {
        const candle = this.add.image(400, 150, "candle");
        //this.scene.start("SceneMain");
    }
}