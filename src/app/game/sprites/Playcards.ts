import Phaser from "phaser";
import { GameScene } from "../game.scene";

export const PLAYCARD_EVENTS = { PLAYCARD_DICE_ROLL: 'playcard-dice-roll' };

export default class Playcards extends Phaser.GameObjects.Container {
    // Note: 'this.scene' is already built into GameObjects, 
    // so you don't strictly need a custom 'private theScene' property unless you want specific typing.
    private cards:Phaser.GameObjects.Sprite[] = [];
    private cardDiceImages:Phaser.GameObjects.Sprite[] = [];
    private readonly numCards:number = 6;
    private readonly numCardsPerRow:number = 3;
    private cardValues:Map<number, number> = new Map<number, number>();
    private theScene!:GameScene
    private numTooltipDisplays:number = 0;
    private readonly numTooltipDisplaysMax:number = 2;

    constructor(scene: GameScene, x: number, y: number) {
        super(scene, x, y);

        this.theScene = scene;
        // 1. Create the Sprite
        // We use scene.add.sprite, but you can also use new Phaser.GameObjects.Sprite(scene, 0, 0, 'key')
        // Position (0, 0) places it at the center of THIS container
        this.createCards();

        // 3. IMPORTANT: Add this custom Container to the Scene's display list
        // Without this line, the container exists in memory but won't render.
        scene.add.existing(this);
    }

    private createCards(): void {
        this.cardValues = new Map<number, number>();
        
        const wCol:number = 80;
        const hRow:number = 122;
        
        let col:number;
        let row:number;

        // You can use let or var here now, it won't matter with this method, 
        // but 'let' is always preferred in TypeScript.
        for(let i = 0; i < this.numCards; i++) {
            col = i % this.numCardsPerRow;
            row = Math.floor(i / this.numCardsPerRow);
            
            const x = col * wCol;
            const y = row * hRow;

            let card = this.scene.add.sprite(x, y, 'playcard-back').setInteractive();
            card.setData('id', i);              // Attach the ID directly to the card object 
            card.on('pointerdown', () => { });  // 2. Add the listener
            this.cards.push(card);
            this.add(card);

            let cardDiceImage = this.scene.add.sprite(x, y, 'imgDice1').setInteractive();         
            cardDiceImage.setScale(0.4);
            cardDiceImage.setAngle(Phaser.Math.Between(-15, 15));
            cardDiceImage.setVisible(false);
            cardDiceImage.on('pointerdown', () => {
                this.handleDiceRoll(i);
            });
            this.cardDiceImages.push(cardDiceImage);
            this.add(cardDiceImage);

            this.cardValues.set(i, 0); 
        }
    }

    public openRandomCard(): void {
        let availableCards:number[] = [];
        
        for(let i = 0; i < this.numCards; i++) {
            if(this.cardValues.get(i) == 0 && this.cards[i].visible == true) {
                availableCards.push(i);
            }   
        }

        if(availableCards.length > 0) {
            const randomIndex = Phaser.Math.Between(0, availableCards.length - 1);
            let cardIndex:number = availableCards[randomIndex];

            const card = this.cards[cardIndex];
            const cardDiceImage = this.cardDiceImages[cardIndex];
        
            let cardValue:number = Phaser.Math.Between(1, 6);
            this.cardValues.set(cardIndex, cardValue);
            cardDiceImage.setVisible(true);
            cardDiceImage.setTexture('imgDice' + cardValue);
            card.setTexture('playcard-front');
            this.theScene.playSound('soundPlaycardOpened')

            if(this.numTooltipDisplays < this.numTooltipDisplaysMax)    {
                const strTooltip:string = this.theScene.translateMe('MESSAGES.PLAYCARD_OPENED');
                this.theScene.displayVanishingText(strTooltip, this.x + card.x, this.y + card.y - 50, '24px');
                this.numTooltipDisplays++;
            }
        }
    }

    private handleDiceRoll(cardIndex: number): void {
        if(this.theScene.coreEngine.isGameOver) {
            return;
        }

        const card = this.cards[cardIndex];
        const cardDiceImage = this.cardDiceImages[cardIndex];

        this.theScene.events.emit(PLAYCARD_EVENTS.PLAYCARD_DICE_ROLL, this.cardValues.get(cardIndex));
        this.cardValues.set(cardIndex, 0);
        card.setTexture('playcard-back');
        card.setVisible(false);
        cardDiceImage.setVisible(false);
        this.theScene.playSound('soundPlaycardMove')
    }

    public resetCards() {
         for(let i = 0; i < this.numCards; i++) {
            const card = this.cards[i];
            const cardDiceImage = this.cardDiceImages[i];
            card.setVisible(true);
            cardDiceImage.setVisible(false);
            this.cardValues.set(i, 0);
            card.setTexture('playcard-back');
            this.numTooltipDisplays = 0;
         }
    }
}