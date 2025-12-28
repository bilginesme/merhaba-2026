import * as Phaser from 'phaser';
import { GameScene } from '../game.scene';

export class Pawn extends Phaser.GameObjects.Sprite {
    // A reference to the Scene this sprite belongs to, for accessing scene utilities
    private theScene: GameScene;

    constructor(scene: GameScene, x: number, y: number, texture: string, frame?: string | number) {
        super(scene, x, y, texture, frame);
        this.theScene = scene;
        this.setInteractive();
        scene.add.existing(this);
        this.setOrigin(0.5,1.0); // Center the origin
        this.setScale(1);        // Set initial scale
        this.on('pointerdown', this.handleClick, this);
    }

    private handleClick(): void {

    }
}