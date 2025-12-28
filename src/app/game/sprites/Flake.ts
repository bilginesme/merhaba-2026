import { GameScene } from "../game.scene";

export class Flake extends Phaser.GameObjects.Sprite {
    private theScene: GameScene

    constructor(
        scene: GameScene, 
        x: number, 
        y: number, 
        texture: string 
    ) {
        super(scene, x, y, texture);
        this.theScene = scene;
        this.theScene.add.existing(this).setInteractive();
        this.setOrigin(0.5, 0.5); 
        this.setScale(1); 

        this.animateFlake();    // Initialize interactions and animation
    }

    private animateFlake(): void {
        const flakeMe = () => {
            const randomOffset = Phaser.Math.Between(1, 4); // Random stretch
            const randomDuration = Phaser.Math.Between(1000, 3000); // Random duration
            const randomAngle = Phaser.Math.Between(-6, 6); // Random swing angle
            const randomAlpha = Phaser.Math.FloatBetween(0.6, 1.0); // Random swing angle

          this.theScene.tweens.add({
              targets: this,
              y: this.y + randomOffset, // Move down by random offset
              angle: randomAngle, // Add random swing
              duration: randomDuration, // Use random duration
              alpha: randomAlpha,
              ease: 'Sine.easeInOut', // Smooth easing
              onComplete: () => {
               const randomAlphaReturn = Phaser.Math.FloatBetween(0.6, 1.0); // Random swing angle
                  this.theScene.tweens.add({
                      targets: this,
                      y: this.y - randomOffset, // Move back up
                      duration: Phaser.Math.Between(1000, 3000), // Random duration for upward motion
                      angle: -randomAngle, // Swing to the opposite direction
                      alpha: randomAlphaReturn,
                      ease: 'Sine.easeInOut',
                      onComplete: flakeMe // Loop by calling moveBall again
                  });
              }
          });

        };

        flakeMe(); // Start the animation
    }
}