import 'phaser';
import ghostImg from "../assets/ghost.jpg"

export default class SceneMain extends Phaser.Scene {
    constructor() {
        super('Main');
    }

    create() {
        this.load.image("ghost", ghostImg)

    }

    update() {
        const ghost = this.add.image(400, 150, "ghost")

    }
}