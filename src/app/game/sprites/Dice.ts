import * as Phaser from 'phaser';
import { GameScene } from '../game.scene';
import { CoreGameEngine } from '../CoreGameEngine';
import { GameModes, TrophyTypes } from '../enums';
export const DICE_EVENTS = { ROLL_COMPLETED: 'roll-completed' };

export class Dice extends Phaser.GameObjects.Sprite {
    private theScene: GameScene;
    private coreEngine!: CoreGameEngine;
    public isDiceRollingNow:boolean = false;
    private spriteArrow!:Phaser.GameObjects.Sprite;
    private txtArrow!:Phaser.GameObjects.Text;
    private txtArrowShadow!:Phaser.GameObjects.Text;
    private inactivityTimer:any;
    private readonly inactivityTime = 15000; // 30 seconds -> 30000

    constructor(scene: GameScene, x: number, y: number, texture: string) {
        super(scene, x, y, texture);
        this.coreEngine = scene.getEngine();
        this.theScene = scene;
        this.theScene.add.existing(this).setInteractive();

        this.setOrigin(0.5, 0.5); // Center the origin
        this.setScale(1);        // Set initial scale
        this.angle = 15;
        
        this.on(Phaser.Input.Events.POINTER_DOWN, this.handlePointerDown, this);
        this.on(Phaser.Input.Events.POINTER_UP, this.handlePointerUp, this);

        this.spriteArrow = this.theScene.add.sprite(0, 0, 'arrow').setInteractive();
        this.spriteArrow.setOrigin(0, 0.5); // Center the origin
        this.spriteArrow.setScale(1);        // Set initial scale
        this.spriteArrow.setVisible(false);
       
        this.txtArrowShadow = this.theScene.add.text(0, 0, '', {
            fontFamily: this.theScene.strFontFamily,
            fontSize: '24px',
            align: 'center',
            color: '#303030'}).setInteractive().setDepth(100);
        this.txtArrowShadow.setVisible(false);
        this.txtArrow = this.theScene.add.text(0, 0, '', {
            fontFamily: this.theScene.strFontFamily,
            fontSize: '24px',
            align: 'center',
            color: '#FFFFFF'}).setInteractive().setDepth(100);
        this.txtArrow.setVisible(false);
        
        this.updateTexts(); // TODO buna gerek olmayabilir
        this.updatePositions(x, y);
        this.displayToolTip();
    }

    private handlePointerDown(pointer: Phaser.Input.Pointer, localX: number, localY: number, event: Phaser.Types.Input.EventData): void {
        this.setTint(0xff0000); 
    }

    private handlePointerUp(pointer: Phaser.Input.Pointer, localX: number, localY: number, event: Phaser.Types.Input.EventData): void {
        this.clearTint(); 

        if(this.isDiceRollingNow || this.theScene.isDecreeVisible) {
         return;
        }

        this.rollDice(); 
    }

    private rollDice(): void {
        this.startDiceRollAnimation();
    }

    private startDiceRollAnimation(): void {
        if(this.coreEngine.isGameOver) {
            this.theScene.displayVanishingText(this.theScene.translateMe('HOME.GAME_OVER'), this.x, this.y + 80, '38px');
        }

        if(this.coreEngine.isGameOver || this.theScene.board.isPawnMoving)
            return;
 
        this.hideToolTip();
        this.resetInactivityTimer();
    
        this.isDiceRollingNow = true;   
        const animationDuration = 1000; // Total duration in milliseconds
        const interval = 100; // Time interval in milliseconds
        let elapsedTime = 0;
        
        let finalRoll = 0;
        let hasNonBonus = false;
        for (const key of this.coreEngine.trophyMap.keys()) {
            if (key !== TrophyTypes.BONUS) {
                hasNonBonus = true;
                break; // Stop checking further
            }
        }

        // Magic roll
        if(this.coreEngine.posPlayer > this.coreEngine.boardArray.length / 2 && !hasNonBonus) {
            let magicRoll = 0;
            let isOK = false;
            while(!isOK) {
                if(this.coreEngine.boardArray[this.coreEngine.posPlayer + magicRoll] != TrophyTypes.NONE) {
                    isOK = true;
                    break;
                }
                else {
                    magicRoll++;
                }
            }
            finalRoll = magicRoll;
        }
        else {
            finalRoll = Phaser.Math.Between(1, 6);
        }
   
        finalRoll = Phaser.Math.Between(1, 6); // temporary

        this.theScene.playSound('soundDice');


        // Start the animation with setInterval
        const timer = setInterval(() => {
            const randomIndex = Phaser.Math.Between(1, 6);  // Select a random dice texture
            this.setTexture('imgDice' + randomIndex);
        
            // Update elapsed time
            elapsedTime += interval;
            this.angle+= 35;
            
            // Stop the animation after the specified duration
            if (elapsedTime >= animationDuration) {
                clearInterval(timer);
                this.setTexture('imgDice' + finalRoll);
                this.isDiceRollingNow = false;
                this.theScene.events.emit(DICE_EVENTS.ROLL_COMPLETED, finalRoll);
            }
        }, interval);
    }

    private animateArrow(): void {
        return;

        const startX:number = this.spriteArrow.x;
        const animateMe = () => {
            this.theScene.tweens.add({
            targets: this.spriteArrow,
            duration: 600, 
            x: startX,
            key: 'arrow',
            ease: 'Sine.easeInOut', // Smooth easing
            onComplete: () => {
                this.theScene.tweens.add({
                    targets: this.spriteArrow,
                    duration: 600, 
                    x: startX + 20,
                    ease: 'Sine.easeInOut',
                    onComplete: animateMe // Loop by calling moveBall again
                });
            }
        });
        };

        animateMe();
    }

    public displayToolTip(): void {
        if(this.theScene.coreEngine.isGameOver)
            return;

        this.spriteArrow.setVisible(true);
        this.txtArrow.setVisible(true);
        this.txtArrowShadow.setVisible(true);
        
        if(this.theScene.board) {
            this.theScene.board.hideAdvertisement();
        }
    }

    public hideToolTip(): void {
        this.spriteArrow.setVisible(false);
        this.txtArrow.setVisible(false);
        this.txtArrowShadow.setVisible(false);
        this.theScene.board.displayAdvertisement();
    }

    public resetInactivityTimer():void {
        if (this.inactivityTimer) 
            clearTimeout(this.inactivityTimer);

        this.inactivityTimer = setTimeout(() => { this.displayToolTip(); }, this.inactivityTime);
    }

    public updateTexts(): void {
        let str = this.theScene.translateMe('BUTTONS.CONTINUE_WITH_DICE_ROLL');
        this.txtArrowShadow.setText(str);
        this.txtArrow.setText(str);
    }

    public updatePositions(posX:number, posY:number): void {
        this.x = posX;
        this.y = posY;

        let posTxtArrow:{x:number, y:number} = {x:20, y:305};
        let posImgArrow:{x:number, y:number} = {x:posX - 145, y:posY - 20};

        if(this.theScene.gameMode != GameModes.PRIME) {
            posTxtArrow = {x:10, y:posY - 105};
            posImgArrow = {x:posX - 155, y:posY + 15};
        } 

        this.txtArrowShadow.x = posTxtArrow.x + 3;
        this.txtArrowShadow.y = posTxtArrow.y + 3;
        this.txtArrow.x = posTxtArrow.x;
        this.txtArrow.y = posTxtArrow.y;

        this.spriteArrow.x = posImgArrow.x;
        this.spriteArrow.y = posImgArrow.y;

        this.animateArrow();
    }
}