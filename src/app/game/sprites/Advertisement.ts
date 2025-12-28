import Phaser, { Scene } from "phaser";
import { GameScene } from "../game.scene";

export const ADVERTISEMENT_EVENTS = { ADVERTISEMENT_CLICKED: 'advertisement-clicked' };

export default class Advertisement extends Phaser.GameObjects.Container {
    private imgSample!:Phaser.GameObjects.Sprite;
    private imgLock!:Phaser.GameObjects.Sprite;
    private readonly scaleOriginalImgSample:number = 0.6;
    private readonly alphaOriginalImgSample:number = 0.6;
    private txtAdvertisement!:Phaser.GameObjects.Text;
    private theScene!:GameScene;
    private whoseTurn:string = 'IMAGE';

    constructor(scene: GameScene, x: number, y: number)  {
        super(scene, x, y);
        this.theScene = scene;

        this.createBG();
        this.createText();
        this.createLock();
        this.updateTexts();

        this.theScene.time.addEvent({
          delay: 10000,                
          callback: this.switchTextAndImage,
          callbackScope: this,
          loop: true                
      });

        scene.add.existing(this);
    }
 
    private createText(): void {
      this.txtAdvertisement = this.scene.add.text(this.x, this.y, '', {
            fontFamily: 'Arial',  
            fontSize: '22px',
             wordWrap: { width: 150 },
            color: '#FFFFFF',
            align: 'center'
        });
        this.txtAdvertisement.setOrigin(0.5, 0.5);
        this.txtAdvertisement.setVisible(false);
        this.txtAdvertisement.setInteractive();
        this.add(this.txtAdvertisement);

        this.txtAdvertisement.on('pointerdown', () => { this.pointerDown(); });
        this.txtAdvertisement.on('pointerup', () => { this.pointerUp(); });
 
        const animateMe = () => {
            const randomDuration = Phaser.Math.Between(2000, 3000); // Random duration
            const randomAlpha = Phaser.Math.FloatBetween(0.2, 0.8); // Random swing angle

            this.theScene.tweens.add({
                targets: this.txtAdvertisement,
                duration: randomDuration, // Use random duration
                alpha: randomAlpha,
                ease: 'Sine.easeInOut', // Smooth easing
                onComplete: () => {
                  this.theScene.tweens.add({
                        targets: this.txtAdvertisement,
                        duration: Phaser.Math.Between(2000, 3000), // Random duration for upward motion
                        alpha: 1,
                        ease: 'Sine.easeInOut',
                        onComplete: animateMe // Loop by calling moveBall again
                    });
                }
            });
        };

        animateMe(); // Start the animation
    }

    private createBG(): void {
        this.imgSample = this.scene.add.sprite(0, 0, 'alternate-reality-sample');
        this.imgSample.setOrigin(0.5, 0.5);
        this.imgSample.setScale(this.scaleOriginalImgSample);
        this.imgSample.setAlpha(this.alphaOriginalImgSample);
        this.imgSample.setVisible(true);
        this.imgSample.setInteractive();
        this.add(this.imgSample);

        this.imgSample.on('pointerdown', () => { this.pointerDown(); });
        this.imgSample.on('pointerup', () => { this.pointerUp(); });

        const animateSampleImage = () => {
          const animateMe = () => {
              const randomDuration = Phaser.Math.Between(2000, 3000); // Random duration
              const randomAlpha = Phaser.Math.FloatBetween(0.1, this.alphaOriginalImgSample); // Random swing angle
    
              this.theScene.tweens.add({
                  targets: this.imgSample,
                  duration: randomDuration, // Use random duration
                  alpha: randomAlpha,
                  ease: 'Sine.easeInOut', // Smooth easing
                  onComplete: () => {
                    this.theScene.tweens.add({
                          targets: this.imgSample,
                          duration: Phaser.Math.Between(2000, 3000), // Random duration for upward motion
                          alpha: this.alphaOriginalImgSample,
                          ease: 'Sine.easeInOut',
                          onComplete: animateMe // Loop by calling moveBall again
                      });
                  }
              });
          };
    
          animateMe(); // Start the animation
        };
        
        animateSampleImage();
    }

    private createLock(): void {
      this.imgLock = this.scene.add.sprite(0, 60, 'lock');
      this.imgLock.setAlpha(this.alphaOriginalImgSample);
      this.imgLock.setOrigin(0.5, 0.5);
      this.imgLock.setInteractive();

      this.add(this.imgLock);

      const animateMe = () => {
          const randomDuration = Phaser.Math.Between(2000, 3000); // Random duration
          const randomAlpha = Phaser.Math.FloatBetween(0.1, this.alphaOriginalImgSample); // Random swing angle

          this.theScene.tweens.add({
              targets: this.imgLock,
              duration: randomDuration, // Use random duration
              alpha: randomAlpha,
              ease: 'Sine.easeInOut', // Smooth easing
              onComplete: () => {
                this.theScene.tweens.add({
                      targets: this.imgLock,
                      duration: Phaser.Math.Between(2000, 3000), // Random duration for upward motion
                      alpha: this.alphaOriginalImgSample,
                      ease: 'Sine.easeInOut',
                      onComplete: animateMe // Loop by calling moveBall again
                  });
              }
          });
      };

      animateMe(); // Start the animation
      
      this.imgLock.on('pointerdown', () => { this.pointerDown(); });
      this.imgLock.on('pointerup', () => { this.pointerUp(); });
    }

    private pointerDown(): void {
        this.theScene.playSound('soundGlossyClick')
        this.imgSample.setVisible(true);
        this.imgSample.setAlpha(1);
        this.txtAdvertisement.setVisible(false);
        this.imgLock.setVisible(false);

        const shrinkImage = () => {
            this.theScene.tweens.add({
                targets: this.imgSample,
                scale: 0, 
                duration: 500,
                ease: 'Sine.easeInOut',
                repeat: 0, 
                onComplete: () => { 
                  this.theScene.events.emit(ADVERTISEMENT_EVENTS.ADVERTISEMENT_CLICKED);
                }
            });
        };
        shrinkImage();
    }

    private pointerUp(): void {
    }

    private switchTextAndImage(): void {
      this.imgSample.setVisible(!this.imgSample.visible);
      this.txtAdvertisement.setVisible(!this.txtAdvertisement.visible);
    }

    public updateTexts(): void {
      const strText:string = this.theScene.translateMe('GAME_MODES.ADVERTISEMENT');
      this.txtAdvertisement.setText(strText);
    }

    public hideForNow(): void {
      this.imgSample.setScale(this.scaleOriginalImgSample);
      this.imgLock.setVisible(true);
      this.txtAdvertisement.setScale(this.alphaOriginalImgSample);
    }
}