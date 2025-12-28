import * as Phaser from 'phaser';
import { GameScene } from '../game.scene';
import { ButtonTypes, DecreeTypes } from '../enums';

export class Button extends Phaser.GameObjects.Sprite {
    private theScene: GameScene;
    private buttonType!: ButtonTypes;

    constructor(scene: GameScene, x: number, y: number, texture: string, decreeDype: ButtonTypes) {
        super(scene, x, y, texture);

        this.buttonType = decreeDype;
        this.theScene = scene;
        this.setInteractive();

        // 2. Add the Sprite to the Scene's display list
        scene.add.existing(this);

        // 3. Perform specific setup (physics, animations, input)
        this.setOrigin(0.5, 0.5); // Center the origin
        this.setScale(1);        // Set initial scale
        this.on('pointerdown', this.handleClick, this);
        this.animateThis();
    }

    private handleClick(): void {
        if(!this.theScene.isDecreeVisible) {
            this.theScene.playSound('soundGlossyClick');
            this.theScene.tweens.add({
                targets:  this,
                scaleX: 1.5, 
                scaleY: 1.5,
                duration: 100, // Duration of the scaling up
                yoyo: true, // Return to normal size
                ease: 'Power1', // Smooth easing effect
                onComplete: () => {
                if(this.buttonType == ButtonTypes.Info) {
                    this.theScene.openDecreeInfo(); 
                }
                else if(this.buttonType == ButtonTypes.Settings) {
                    this.theScene.openDecreeSettings(); 
                }
                else if(this.buttonType == ButtonTypes.Replay) {
                    this.theScene.playAgain();
                }
             
            }
            });
        }
    }

    private animateThis(): void {
      const animateMe = () => {
          const randomDuration = Phaser.Math.Between(500, 900); // Random duration
          const randomAlpha = Phaser.Math.FloatBetween(0.6, 1.0); // Random swing angle

          // Tween to move the ball down
          this.theScene.tweens.add({
              targets: this,
              duration: randomDuration, // Use random duration
              alpha: randomAlpha,
              ease: 'Sine.easeInOut', // Smooth easing
              onComplete: () => {
               const randomAlphaReturn = Phaser.Math.FloatBetween(0.6, 1.0); // Random swing angle
                  this.theScene.tweens.add({
                      targets: this,
                      duration: Phaser.Math.Between(500, 900), // Random duration for upward motion
                      alpha: randomAlphaReturn,
                      ease: 'Sine.easeInOut',
                      onComplete: animateMe // Loop by calling moveBall again
                  });
              }
          });
      };

      animateMe(); // Start the animation
    }
}