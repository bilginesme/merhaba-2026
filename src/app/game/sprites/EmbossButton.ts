import Phaser, { Scene } from "phaser";

export const EMBOSS_BUTTON_EVENTS = { EMBOSS_BUTTON_CLICKED: 'emboss-button-clicked' };

export default class EmbossButton extends Phaser.GameObjects.Container {
    private normalText!:Phaser.GameObjects.Text;
    private shadowText!:Phaser.GameObjects.Text;
    private soundGlossyClick:any;
    private isSoundOn:boolean = false;

    constructor(strReason:string, scene: Scene, x: number, y: number, strText: string, fontSize:number, fontFamily:string, isSoundOn:boolean) {
        super(scene, x, y);
        this.isSoundOn = isSoundOn;

        this.createTexts(strReason, strText, fontSize, fontFamily);

        this.soundGlossyClick = scene.sound.add('soundGlossyClick', {loop: false,  volume: 0.5});

        // 3. IMPORTANT: Add this custom Container to the Scene's display list
        // Without this line, the container exists in memory but won't render.
        scene.add.existing(this);
    }
 
    private createTexts(strReason:string, strText:string, fontSize:number, fontFamily:string): void {
        this.shadowText = this.scene.add.text(this.x - 2, this.y - 2, strText, {
            fontFamily: fontFamily,
            fontSize: fontSize + 'px',
            fontStyle: '900',
            color: '#5e5c0483',
          }).setInteractive().setDepth(100);
        this.shadowText.setOrigin(0.5, 0.5);
        this.shadowText.setVisible(true);

        this.normalText = this.scene.add.text(this.x, this.y, strText, {
            fontFamily: fontFamily,
            fontSize: fontSize + 'px',
            fontStyle: '900',
            color: '#300404ff',
          }).setInteractive().setDepth(100);
        this.normalText.setOrigin(0.5, 0.5);
        this.normalText.setVisible(true);

        this.normalText.on('pointerdown', () => {
            //this.theScene.playSound('soundGlossyClick');
            this.scene.tweens.add({
            targets: this.normalText,
            scaleX: 1.2,
            scaleY: 1.2,
            duration: 100, // Duration of the scaling up
            yoyo: true, // Return to normal size
            ease: 'Power1', // Smooth easing effect
            onComplete: () => { 
              if(this.isSoundOn)
                this.soundGlossyClick.play();
              this.scene.events.emit(EMBOSS_BUTTON_EVENTS.EMBOSS_BUTTON_CLICKED, strReason);
            } 
            });
        });

    }

    public updateText(strText:string): void {
      this.shadowText.setText(strText);
      this.normalText.setText(strText);
    }

    public hide(): void {
      this.shadowText.setVisible(false);
      this.normalText.setVisible(false);
    }

    public show(): void {
      this.shadowText.setVisible(true);
      this.normalText.setVisible(true);
    }
  
}