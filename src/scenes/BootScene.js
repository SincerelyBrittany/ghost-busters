import 'phaser'

export default class SceneBoot extends Phaser.Scene {
    constructor() {
        super({ key: "SceneBoot" });
    }

    preload() {

    }

    create() {
       this.scene.start("SceneMain");
    }
}