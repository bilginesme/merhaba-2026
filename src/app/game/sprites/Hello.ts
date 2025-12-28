import Phaser from "phaser";
import { GameScene } from "../game.scene";

export default class Hello extends Phaser.GameObjects.Container {
    private theScene!: GameScene;
    private helloTitle!: Phaser.GameObjects.Text;
    private helloSubtitle!: Phaser.GameObjects.Text;

    constructor(scene: GameScene, x: number, y: number) {
        super(scene, x, y);
        this.theScene = scene;
        this.setScale(1);

        this.helloTitle = this.theScene.add.text(
            this.x, 
            this.y,
            '', 
            { 
                fontFamily: this.theScene.strFontFamily, 
                fontSize: '30px', 
                color: '#ffffff' 
            }
        );
   
        this.helloSubtitle = this.theScene.add.text(
            this.x, 
            this.y + 34,
            '', 
            { 
                fontFamily: this.theScene.strFontFamily, 
                fontSize: '18px', 
                color: '#ffffff' 
            }
        );

        this.updateTexts();

        let dashedLine = this.theScene.add.sprite(this.x, this.y + 65, "dashed-line"); 
        dashedLine.setOrigin(0, 0.5);
        dashedLine.setAlpha(0.5);

        scene.add.existing(this);
  }

  public updateTexts(): void {
    this.helloTitle.setText(this.theScene.translateMe('HOME.HELLO'));
    this.helloSubtitle.setText(this.theScene.translateMe('HOME.NEW_YEAR_MESSAGE'));
  }
}
