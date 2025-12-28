import Phaser, { Scene } from "phaser";
import { GameScene } from "../game.scene";
import { GameModes } from "../enums";

export const GAME_MODE_CHANGE_BUTTON_EVENTS = { GAME_MODE_CHANGE_BUTTON_CLICKED: 'game-mode-change' };

export default class GameModeChangeButton extends Phaser.GameObjects.Container {
    private txtNormal!:Phaser.GameObjects.Text;
    private txtShadow!:Phaser.GameObjects.Text;
    private txtSubtitle!:Phaser.GameObjects.Text;
    private buttonBG!:Phaser.GameObjects.Sprite;
    private theScene!:GameScene;
    private posYNormal:number = 0;
    private posYShadow:number = 0;
    private posYSubtitle:number = 0;
    private isPointerDown:boolean = false;

    constructor(scene: GameScene, x: number, y: number)  {
        super(scene, x, y);
        this.theScene = scene;

        this.posYNormal = y - 10;
        this.posYShadow = y - 8;
        this.posYSubtitle = y + 8;

        this.createBG();
        this.createTexts();
        this.updateTexts();
        scene.add.existing(this);
    }
 
    private createBG(): void {
        this.buttonBG = this.scene.add.sprite(0, 0, 'game-mode-change-normal');
        this.buttonBG.setOrigin(0.5, 0.5);
        this.buttonBG.setVisible(true);
        this.buttonBG.setInteractive();
        this.add(this.buttonBG);

        this.buttonBG.on('pointerdown', () => { this.pointerDown(); });
        this.buttonBG.on('pointerup', () => { this.pointerUp(); });
        this.buttonBG.on('pointerout', () => { this.pointerUp(); });
    }

    private pointerDown(): void {
      this.isPointerDown = true;
      this.buttonBG.setTexture('game-mode-change-clicked');
      this.txtNormal.y = this.txtNormal.y + 5;
      this.txtShadow.y = this.txtShadow.y + 5;
      this.txtSubtitle.y = this.txtSubtitle.y + 5;
      this.theScene.playSound('soundGlossyClick');
    }

    private pointerUp(): void {
      this.buttonBG.setTexture('game-mode-change-normal');
      this.txtNormal.y = this.posYNormal;
      this.txtShadow.y = this.posYShadow;
      this.txtSubtitle.y = this.posYSubtitle;

      if(this.isPointerDown) {
        this.isPointerDown = false;
        if(!this.theScene.board.isPawnMoving && !this.theScene.board.dice.isDiceRollingNow && !this.theScene.isDecreeVisible)
          this.theScene.events.emit(GAME_MODE_CHANGE_BUTTON_EVENTS.GAME_MODE_CHANGE_BUTTON_CLICKED, 'ok');
        else
          this.theScene.displayVanishingText(this.theScene.translateMe('MESSAGES.CANNOT_OPEN_WHILE_MOVING'), this.x, this.y - 70, '24px');
      }
    }

    private createTexts(): void {
        this.txtShadow = this.scene.add.text(this.x - 2, this.posYShadow, '', {
            fontFamily: this.theScene.strFontFamily,
            fontSize: '16px',
            fontStyle: '900',
            color: '#5e5c0483',
          }).setInteractive().setDepth(10);
        this.txtShadow.setOrigin(0.5, 0.5);
        this.txtShadow.setVisible(true);

        this.txtNormal = this.scene.add.text(this.x, this.posYNormal, '', {
            fontFamily: this.theScene.strFontFamily,
            fontSize: '16px',
            fontStyle: '900',
            color: '#300404ff',
          }).setInteractive().setDepth(10);
        this.txtNormal.setOrigin(0.5, 0.5);
        this.txtNormal.setVisible(true);
       
        this.txtSubtitle = this.scene.add.text(this.x, this.posYSubtitle, '', {
            fontFamily: this.theScene.strFontFamily,
            fontSize: '12px',
            fontStyle: '600',
            color: '#30040496',
          }).setInteractive().setDepth(10);
        this.txtSubtitle.setOrigin(0.5, 0.5);
        this.txtSubtitle.setVisible(true);

        this.txtNormal.on('pointerout', () => { this.pointerUp(); });
        this.txtNormal.on('pointerup', () => { this.pointerUp(); });
        this.txtNormal.on('pointerdown', () => { this.pointerDown(); });

        this.txtShadow.on('pointerout', () => { this.pointerUp(); });
        this.txtShadow.on('pointerup', () => { this.pointerUp(); });
        this.txtShadow.on('pointerdown', () => { this.pointerDown(); });

        this.txtSubtitle.on('pointerout', () => { this.pointerUp(); });
        this.txtSubtitle.on('pointerup', () => { this.pointerUp(); });
        this.txtSubtitle.on('pointerdown', () => { this.pointerDown(); });
    }

    public updateTexts(): void {
      let gameMode:number = this.theScene.getSettings().gameMode$.value;
     
      let strGameModeKey:string = GameModes[gameMode];
      let strGameModeName:string = this.theScene.translateMe('GAME_MODES.' + strGameModeKey + '.TITLE');

      this.txtNormal.setText(strGameModeName);
      this.txtShadow.setText(strGameModeName);

      this.txtSubtitle.setText(this.theScene.translateMe('GAME_MODES.GAME_MODE_CHOOSING_SUBTITLE'));
    }
}