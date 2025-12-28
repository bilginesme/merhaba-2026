import { GameScene } from "../game.scene";

export class ChristmasBall extends Phaser.GameObjects.Sprite {
    private theScene: GameScene;
    private initialY!: number;    // <--- 1. Add this property

    constructor(
        scene: GameScene, 
        x: number, 
        y: number, 
        texture: string 
    ) {
        super(scene, x, y, texture);
        this.theScene = scene;
        this.theScene.add.existing(this).setInteractive();
        this.setOrigin(0.5, 0); 
        this.setScale(1); 
        this.initialY = y;

        this.addJumpInteraction();
        this.animateBall();
    }

    private addJumpInteraction(): void {
        this.on('pointerdown', () => {
            // 1. Play the sound
            this.theScene.playSound('soundGlossyClick');

            // 2. STOP the current floating animation 
            // This prevents the "float" and "jump" tweens from fighting over the Y position
            this.theScene.tweens.killTweensOf(this);

            // 3. Perform the jump
            this.theScene.tweens.add({
                targets: this,
                y: this.y - Phaser.Math.Between(20, 60),
                angle: Phaser.Math.Between(-3, 3),
                duration: 300, // Fast jump
                ease: 'Power2',
                yoyo: true,    // Return back to start position
                onComplete: () => {
                    this.y = this.initialY;
                    this.animateBall();     // 4. Resume the floating animation
                }
            });

            let xPos:number = this.x - 90;
            if(xPos < 10)
                xPos = 10;
            
            const jokeText = this.theScene.add.text(
                xPos, 
                this.y + this.displayHeight, // Use displayHeight to be safe with scaling
                this.theScene.translateMe('HOME.BEWARE_CAN_BE_BROKEN'), 
                { 
                    fontFamily: this.theScene.strFontFamily, 
                    fontSize: '16px', 
                    color: '#faf3cb' // 'fill' is often aliased to color in newer Phaser/Typescript defs
                }
            );

            // Destroy text after 2 seconds
            this.theScene.time.delayedCall(2000, () => {
                jokeText.destroy();
            });
        });
    }

    private animateBall(): void {
        const moveBall = () => {
            const randomOffset = Phaser.Math.Between(5, 20);
            const randomDuration = Phaser.Math.Between(1000, 3000);
            const randomAngle = Phaser.Math.Between(-3, 3);

            this.theScene.tweens.add({
                targets: this,
                y: this.y + randomOffset,
                angle: randomAngle,
                duration: randomDuration,
                ease: 'Sine.easeInOut',
                onComplete: () => {
                    this.theScene.tweens.add({
                        targets: this,
                        y: this.initialY,
                        duration: Phaser.Math.Between(1000, 3000),
                        angle: -randomAngle,
                        ease: 'Sine.easeInOut',
                        onComplete: moveBall
                    });
                }
            });
        };
        moveBall();
    }
}