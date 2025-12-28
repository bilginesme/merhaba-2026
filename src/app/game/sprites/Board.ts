import * as Phaser from 'phaser';
import { GameScene } from '../game.scene';
import { CoreGameEngine, ENGINE_EVENTS } from '../CoreGameEngine';
import { Pawn} from './Pawn'
import { DecreeTypes, GameModes, TrophyTypes } from '../enums';
import { Dice, DICE_EVENTS } from './Dice';
import Playcards, { PLAYCARD_EVENTS } from './Playcards';
import Advertisement, { ADVERTISEMENT_EVENTS } from './Advertisement';

export class Board extends Phaser.GameObjects.Container {
    private theScene: GameScene;
    public dice!: Dice;
    private trophySprites:Phaser.GameObjects.Sprite[] = [];
    private coreEngine:CoreGameEngine;
    private posPawnInitial:{x:number, y:number} = { x:30, y:780 };
    private pawn!:Pawn;
    public isPawnMoving:boolean = false;
    private imgBonuses:Phaser.GameObjects.Image[] = [];
    private bonusSlotPositions:{x:number, y:number}[] = [];
    public trophySlotPositions:{x:number, y:number}[] = [];
    private txtTrophies:Phaser.GameObjects.Text[] = [];
    private playcards!:Playcards;
    private background!:Phaser.GameObjects.Image;
    private advertisement!:Advertisement;

    constructor(scene: GameScene, x: number, y: number) {
        super(scene, x, y);

        this.theScene = scene;
        this.coreEngine = this.theScene.getEngine();

        this.theScene.add.existing(this).setInteractive();

        this.background = this.theScene.add.image(0, 0, 'board-standard').setOrigin(0, 0);
        this.background.setVisible(false);
        this.advertisement = new Advertisement(this.theScene, 0, 0).setVisible(false);
        
        this.createBoardAndPlaceTheDice();
        this.createTrophiesAndBonusesIcons(true);
        
        this.bonusSlotPositions.push({x: 340, y: 200});
        this.bonusSlotPositions.push({x: 390, y: 200});
        this.bonusSlotPositions.push({x: 430, y: 200});

        this.trophySlotPositions = [];
        this.trophySlotPositions.push({x: 100, y: 138});
        this.trophySlotPositions.push({x: 240, y: 138});
        this.trophySlotPositions.push({x: 100, y: 168});
        this.trophySlotPositions.push({x: 240, y: 168});
        this.trophySlotPositions.push({x: 100, y: 198});

        this.createPawn();

        this.txtTrophies = [];
        for( var i = 0; i < this.trophySlotPositions.length; i++) {
            let trophy = this.theScene.add.text(this.trophySlotPositions[i].x, this.trophySlotPositions[i].y, '',  {fontFamily: this.theScene.strFontFamily, fontSize: '18px', fontStyle: '900', color: '#ffffff'});
            this.txtTrophies.push(trophy);

            const animateStar = () => {
            this.theScene.tweens.add({
                targets: trophy,
                scaleX: Phaser.Math.FloatBetween(0.9, 1.1), // Random scale on X axis
                scaleY: Phaser.Math.FloatBetween(0.9, 1.1), // Random scale on Y axis
                duration: Phaser.Math.Between(800, 1200), // Random duration between 1-2 seconds
                ease: 'Sine.easeInOut',
                repeat: -1, // Infinite loop
                yoyo: true // Reverse the animation back and forth
                });
            };
            animateStar();
            
        }

        this.createPlaycards();

        this.theScene.events.on(DICE_EVENTS.ROLL_COMPLETED, this.handleDiceRoll, this);
        this.theScene.events.on(ENGINE_EVENTS.BOARD_UPDATED, this.boardUpdateDueToEngine, this);
        this.theScene.events.on(ENGINE_EVENTS.TROPHIES_UPDATED, this.trophiesUpdateDueToEngine, this);
        this.theScene.events.on(PLAYCARD_EVENTS.PLAYCARD_DICE_ROLL, this.handlePlaycardDiceRoll, this);
        this.theScene.events.on(ADVERTISEMENT_EVENTS.ADVERTISEMENT_CLICKED, this.handleAdvertisementClicked, this);

        scene.add.existing(this);
    }

    private handleDiceRoll(result: number): void {
        this.coreEngine.processRoll(result);
    }

    private handlePlaycardDiceRoll(result: number): void {
        this.dice.resetInactivityTimer();
        this.dice.hideToolTip();
        this.coreEngine.processRoll(result);
    }

    private handleAdvertisementClicked(): void {
        this.advertisement.hideForNow();
        this.theScene.displayShopScreen();
    }

    private createBoardAndPlaceTheDice(): void {   
        let strBG:string = 'board-standard';
        let posBG:{x:number, y:number} = {x:60, y:200 }
        let posDice:{x:number, y:number} = {x:320, y:370 }
        if(this.theScene.gameMode != GameModes.PRIME) {
            strBG = 'board-alternate-reality';
            posBG = {x:35, y:230}
            posDice = {x:240, y:380 }
        }

        if(!this.dice){
            this.dice = new Dice(this.theScene, posDice.x, posDice.y, 'imgDice1');
        } else {
            this.dice.updatePositions(posDice.x, posDice.y);
        }

        this.background.setTexture(strBG);
        this.background.x = posBG.x;
        this.background.y = posBG.y;

        this.background.setVisible(true);
        this.dice.setVisible(true);

        // Advertiseemnt
        if(this.theScene.gameMode == GameModes.PRIME) {
            this.advertisement.setVisible(false);   // wait untill dice tooltip disappears  
            this.advertisement.x = 80;
            this.advertisement.y = 300;  
        }
        else {
            this.advertisement.setVisible(false);
        }
    }

    private createTrophiesAndBonusesIcons(isRemoveScoreboardIconsAlso:boolean): void {
        this.removeAllTrophyIcons(isRemoveScoreboardIconsAlso);
        for( var i:number = 0 ; i < this.coreEngine.boardCellPositions.length; i++) {
            var pos = this.coreEngine.boardCellPositions[i];
            var trophy = this.coreEngine.boardArray[i];
            var strImg = '';

            if(trophy == TrophyTypes.MONEY) {
                strImg = 'trophy-money';
            }
            else if(trophy == TrophyTypes.LOVE) {
                strImg = 'trophy-love';
            }
            else if(trophy == TrophyTypes.HEALTH) {
                strImg = 'trophy-health';
            }
            else if(trophy == TrophyTypes.SUCCESS) {
                strImg = 'trophy-career';
            }
            else if(trophy == TrophyTypes.BONUS) {
                strImg = 'trophy-bonus';
            }
            else if(trophy == TrophyTypes.MIRACLE) {
                strImg = 'trophy-miracle';
            }
            
            if(strImg != '') {
                let tSprite = this.theScene.add.sprite(pos.x, pos.y, strImg).setInteractive().setData('position', 'board');
                let trophyName:string = this.coreEngine.getTrophyName(trophy)!;
                
                tSprite.setOrigin(0.5, 0.9);
                tSprite.on('pointerdown', () => {
                    if(this.theScene.isDecreeVisible) 
                        return;

                    this.theScene.tweens.add({
                    targets: tSprite,
                    scaleX: 2.0, 
                    scaleY: 2.0,
                    duration: 250, // Duration of the scaling up
                    yoyo: true, // Return to normal size
                    ease: 'Power1', // Smooth easing effect
                    onComplete: () => {
                        let trophyText = this.theScene.add.text(tSprite.x, tSprite.y - 50, trophyName, {fontFamily: this.theScene.strFontFamily, fontSize: '20px', color: '#ffffff'});
                        trophyText.setDepth(200);
                        trophyText.setOrigin(0.5, 0.5);

                        this.theScene.tweens.add({
                            targets: trophyText,
                            scaleX: 1,
                            scaleY: 1,
                            alpha: 1,
                            duration: 1000, 
                            ease: 'Bounce.easeOut',
                            onStart: () => {
                                trophyText.setScale(0); 
                                trophyText.setAlpha(1); 
                            },
                            onComplete: () => {
                                this.theScene.tweens.add({
                                targets: trophyText,
                                alpha: 0,
                                duration: 2000, 
                                ease: 'Power1',
                                onComplete: () => {
                                    trophyText.destroy(); 
                                }
                                });
                            }
                        });
                    }
                });
            
                });
            }
        }
    }

    private createPlaycards():void {
        if(this.theScene.gameMode != GameModes.PRIME) {
            this.playcards = new Playcards(this.theScene, 140, 520);
        }
    }

    public displayAdvertisement(): void {
        if(!this.theScene.getSettings().isIAPPurchased$.value)
            this.advertisement.setVisible(true);
    }

    public hideAdvertisement(): void {
        this.advertisement.setVisible(false);
    }

    private createPawn(): void {
        let pos:{x:number, y:number} = this.posPawnInitial;

        this.pawn = new Pawn(this.theScene, pos.x, pos.y, 'pawn-yellow').setDepth(50);
        this.pawn.setInteractive();
        this.theScene.add.existing(this.pawn);
    }

    private boardUpdateDueToEngine(points: {x:number, y:number}[]): void {
        this.movePawn(points);
    }

    private trophiesUpdateDueToEngine(trophyType:TrophyTypes): void {
        if(trophyType == TrophyTypes.BONUS) {
            this.addBonus();
        }
        else {
        }
    }
    
    public movePawn(points: { x: number, y: number }[]): void {
        // 1. Base Case: No more points to move to
        if (points.length === 0) {
            this.isPawnMoving = false;
            
            // Optional: Trigger an event here if needed
            // this.emit('movementComplete'); 

            this.handleAfterPawnMakesAllTheMovementsBoard();

            return;
        }

        this.isPawnMoving = true;

        // 2. Get the next target point (removes it from the array)
        const nextPoint = points.shift(); 
        if (!nextPoint) return; // Safety check

        this.theScene.tweens.add({
            targets: this.pawn,
            x: nextPoint.x,
            y: nextPoint.y,
            duration: 500, // Time to move one tile (ms)
            ease: 'Power1', // 'Linear' is good for constant speed, 'Power1' for slight ease
            onComplete: () => {
                this.movePawn(points);  // 5. RECURSION: Call the function again with the remaining points
            }
        });
    }

    private handleAfterPawnMakesAllTheMovementsBoard(): void {
        let result = this.coreEngine.handleAfterPawnMakesAllTheMovementsGameEngine();

        if(!this.coreEngine.isGameOver && result != TrophyTypes.BONUS && result != TrophyTypes.NONE)
            this.theScene.playSound('soundTrophyObtained');

        if(result != TrophyTypes.NONE) {
            this.drawTrophyScoreboard(result);
        }

        if(this.coreEngine.isGameOver) {
            this.theScene.displayTheGameEndAnimation();
        }
        else {
            if(this.theScene.gameMode != GameModes.PRIME && result == 0) {
                this.playcards.openRandomCard();
            } 
        }

        this.drawGameOverPositions();
    }

    private drawGameOverPositions(): void {
        if(this.theScene.gameMode == GameModes.PRIME)
            return;

        this.removeAllGameOverSpots();

        for(var i=0; i < this.coreEngine.gameOverCells.length; i++) {
            let pos = this.coreEngine.boardCellPositions[this.coreEngine.gameOverCells[i]];
            const spot = this.theScene.add.sprite(pos.x, pos.y, 'game-over-location')
                .setOrigin(0.5, 0.5)
                .setAlpha(0.5)
                .setInteractive();
                spot.on('pointerdown', () => {
                this.theScene.playSound('soundGlossyClick');

                const strTextSpot:string = this.theScene.translateMe('MESSAGES.GAME_OVER_CELL');

                this.theScene.tweens.add({
                    targets: spot,
                    scaleX: 2.0, 
                    scaleY: 2.0,
                    duration: 250, // Duration of the scaling up
                    yoyo: true, // Return to normal size
                    ease: 'Power1', // Smooth easing effect
                    onComplete: () => {
                        let posX:number = spot.x;
                        let posY:number = spot.y;

                        const xPadding:number = 80;
                        if(posX < xPadding)
                            posX = xPadding;

                        if(posX > this.theScene.getSize().width - xPadding)
                            posX = this.theScene.getSize().width - xPadding;

                        let txtSpot = this.theScene.add.text(posX, posY, strTextSpot, {fontFamily: this.theScene.strFontFamily, backgroundColor: '#ff000093', padding: {x:5, y:5}, fontSize: '20px', align: 'center', color: '#ffffff'});
                        txtSpot.setOrigin(0.5, 0.5);

                        this.theScene.tweens.add({
                            targets: txtSpot,
                            scaleX: 1,
                            scaleY: 1,
                            alpha: 1,
                            duration: 500, 
                            ease: 'Bounce.easeOut',
                            onStart: () => {
                                txtSpot.setScale(0); 
                                txtSpot.setAlpha(1); 
                            },
                            onComplete: () => {
                                this.theScene.tweens.add({
                                targets: txtSpot,
                                alpha: 1,
                                duration: 1000, 
                                ease: 'Power1',
                                onComplete: () => {
                                    this.theScene.tweens.add({
                                    targets: txtSpot,
                                    alpha: 0,
                                    duration: 2000, 
                                    ease: 'Power1',
                                    onComplete: () => {
                                        txtSpot.destroy(); 
                                    }
                                    });
                                }
                                });

                                
                            }
                        });
                    }
                });
            });

            
        }
    }

    public removeTrophyFromTheBoard(x:number, y:number): void {
        this.theScene.children.getChildren().forEach(element => {
            const sp = element as Phaser.GameObjects.Sprite;

            if (sp.texture && sp.texture.key && sp.texture.key.includes('trophy')) {
                if(sp.x == x && sp.y == y) {
                    sp.setVisible(false);
                }
            }
        });
    }

    public drawTrophyScoreboard(theTrophy:number): void {
        let strTrophyName:string = this.coreEngine.getTrophyName(theTrophy)!;

        if(theTrophy != TrophyTypes.NONE && theTrophy != TrophyTypes.BONUS) {
            this.theScene.displayVanishingText(strTrophyName, this.theScene.getSize().width / 2, this.theScene.getSize().height  / 2, '64px');
        }

        for( var i = 0; i < this.trophySlotPositions.length; i++) {
            this.txtTrophies[i].setText('');
        }

        var idxSlot = 0;
        this.coreEngine.trophyMap.forEach((value, key) => {
            if(key != TrophyTypes.BONUS) {
                let strTrophy:string = this.coreEngine.getTrophyName(key)!;
        
                if(value > 1) {
                    strTrophy+= ' x' + value;
                }

                this.txtTrophies[idxSlot].setText(strTrophy);
                idxSlot++;
            }
        });
    }

    public addBonus() {
        var idxBonus:number = -1;
        
        while(idxBonus == -1) {
            let idx:number = Phaser.Math.Between(0, this.coreEngine.bonusDefinitions.length-1);
            if(this.coreEngine.bonusesObtained.indexOf(idx) == -1) {
                idxBonus = idx;
            }
            else {
                idxBonus = -1;
            }
        }

        var strBonus:string = this.coreEngine.bonusDefinitions[idxBonus];
        this.theScene.playSound('soundBonus');
        this.coreEngine.bonusesObtained.push(idxBonus);
        
        this.theScene.openDecree(DecreeTypes.Bonus, strBonus);

        var idxSlot = this.imgBonuses.length;
        var slot:{x:number, y:number} = this.bonusSlotPositions[idxSlot];

        this.imgBonuses.push(this.theScene.add.image(slot.x, slot.y, 'trophy-bonus').setInteractive().setData('position', 'scoreboard').setData('idxSlot', idxSlot));

        var img = this.imgBonuses[this.imgBonuses.length - 1];
        img.setScale(1.3);
        const animateStar = () => {
            this.theScene.tweens.add({
                targets: img,
                angle: Phaser.Math.Between(-15, 15), // Rotate between -15 and 15 degrees
                scaleX: Phaser.Math.FloatBetween(0.8, 1.2), // Random scale on X axis
                scaleY: Phaser.Math.FloatBetween(0.8, 1.2), // Random scale on Y axis
                duration: Phaser.Math.Between(500, 1000), // Random duration between 1-2 seconds
                ease: 'Sine.easeInOut',
                repeat: -1, // Infinite loop
                yoyo: true // Reverse the animation back and forth
            });
        };
        animateStar();

        img.on('pointerdown', () => {
            this.theScene.playSound('soundGlossyClick');
            this.theScene.tweens.add({
                targets: img,
                scaleX: 3.0, 
                scaleY: 3.0,
                duration: 250, // Duration of the scaling up
                yoyo: true, // Return to normal size
                ease: 'Power1', // Smooth easing effect
                onComplete: () => {
                    this.theScene.openDecree(DecreeTypes.Bonus, this.coreEngine.getBonusDefinition(idxBonus));
                }
            });
        });
    }

    public makeAllTrophiesVisible(): void {
        let n:number = 0;

        [...this.theScene.children.getChildren()].forEach(element => {
            const sp = element as Phaser.GameObjects.Sprite;

            // 2. SAFETY CHECK: Ensure 'texture' exists before reading 'key'
            if (sp.texture && sp.texture.key) {
                if(sp.texture.key.includes('trophy')) {
                    sp.setVisible(true);
                    n++;
                } 
            } 
        });
    }

    private removeAllTrophyIcons(isRemoveScoreboardIconsAlso:boolean): void {
        [...this.theScene.children.getChildren()].forEach(element => {
            const sp = element as Phaser.GameObjects.Sprite;

            if(isRemoveScoreboardIconsAlso) {
                if (sp.texture && sp.texture.key && sp.texture.key.includes('trophy')) {
                    sp.destroy();
                }
            } else {
                if (sp.texture && sp.texture.key && sp.texture.key.includes('trophy') && sp.data.get('position') == 'board') {
                    sp.destroy();
                }
            }
        });
    }

    private removeAllGameOverSpots(): void {
        [...this.theScene.children.getChildren()].forEach(element => {
            const sp = element as Phaser.GameObjects.Sprite;

            if (sp.texture && sp.texture.key && sp.texture.key.includes('game-over-location')) {
                sp.setVisible(false);
                sp.destroy();
            }
        });
    }


    public handlePlayAgain(): void {
        this.makeAllTrophiesVisible();
        this.dice.isDiceRollingNow = false;

        for(var i=0; i < this.imgBonuses.length; i++) {
            this.imgBonuses[i].setVisible(false);   
        }
        this.imgBonuses = [];

        this.createBoardAndPlaceTheDice();
        
        //this.removeAllTrophyIcons();
        this.createTrophiesAndBonusesIcons(true);

        this.drawTrophyScoreboard(TrophyTypes.NONE);
        this.dice.resetInactivityTimer();
        
        if(this.theScene.gameMode != GameModes.PRIME) {
            if(!this.playcards) 
                this.createPlaycards()

            this.playcards.resetCards();
            this.playcards.setVisible(true);
            this.drawGameOverPositions();
        } else {
            this.removeAllGameOverSpots();
            if(this.playcards) {
                this.playcards.setVisible(false);
            }
        }

        this.pawn.x = this.posPawnInitial.x;
        this.pawn.y = this.posPawnInitial.y;
    }

    public updateTexts(): void {
        this.dice.updateTexts();
        this.advertisement.updateTexts();
        this.drawTrophyScoreboard(TrophyTypes.NONE);
        //this.removeAllTrophyIcons();
        this.createTrophiesAndBonusesIcons(false);

        this.imgBonuses.forEach(element => {
            let idxSlot = element.data.get('idxSlot');
            this.coreEngine.bonusDefinitions
        });
    }
}