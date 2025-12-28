import { TranslateService } from '@ngx-translate/core';
import { GameScene } from './game.scene';
import { GameModes, TrophyTypes } from './enums';

export const ENGINE_EVENTS = { BOARD_UPDATED: 'board-updated', TROPHIES_UPDATED: 'trophies-updated' };

export class CoreGameEngine {
    private theScene!: GameScene;
    public boardArray: number[] = [];
    public gameOverCells: number[] = [];
    public boardCellPositions: { x: number; y: number }[] = [];
    public posPawnFinal!:{x:number, y:number};
    public trophyMap = new Map();
    public txtTrophies = [];
    public imgBonuses = [];
    public defBonuses = [];
    public bonusDefinitions:string[] = [];
    public bonusesObtained:number[] = [];

    public isGameOver = false;
    public posPlayer:number = -1;

    constructor(scene:GameScene) {
        this.theScene = scene;
        this.posPlayer = -1;
        this.boardArray = [];
        this.gameOverCells = [];
        this.boardCellPositions = [];
        this.trophyMap = new Map();
        this.bonusesObtained = [];
        this.txtTrophies = [];
        this.imgBonuses = [];
        this.defBonuses = [];
        this.bonusDefinitions = [];
        this.isGameOver = false;

        this.createBonusDefinitions();
        this.createBoardArray();
    }

    public processRoll(rollResult:number):void {
        let points = [];
        let isCompleted:boolean = false;
        let nTurn:number = 0;
        while(!isCompleted) {
            this.posPlayer++;
            
            if(this.theScene.gameMode != GameModes.PRIME) {
                if(this.posPlayer >= this.boardArray.length) { 
                    this.posPlayer = 0;
                }
                points.push({x: this.boardCellPositions[this.posPlayer].x, y: this.boardCellPositions[this.posPlayer].y});
            }
            else {
               if(this.posPlayer < this.boardArray.length) {
                    points.push({x: this.boardCellPositions[this.posPlayer].x, y: this.boardCellPositions[this.posPlayer].y});
               }
               else {
                    this.isGameOver = true;
                    isCompleted = true;
                    points.push(this.posPawnFinal);
               } 
            }

            nTurn++;
            if(nTurn >= rollResult) {
                isCompleted = true;
            }
        }

        this.theScene.events.emit(ENGINE_EVENTS.BOARD_UPDATED, points);
    }

    private createBonusDefinitions(): void {
        this.bonusDefinitions = this.theScene.getBonusTranslations();
    }

    private createBoardArray(): void {
        this.boardArray = []; 
  
        if(this.theScene.gameMode == GameModes.PRIME) {
           
          
            this.boardArray[0] = 0;
            this.boardArray[1] = 0;
            this.boardArray[2] = 0;
            this.boardArray[3] = TrophyTypes.HEALTH;
            this.boardArray[4] = 0;
            this.boardArray[5] = TrophyTypes.LOVE;
            this.boardArray[6] = 0;
            this.boardArray[7] = 0;
            this.boardArray[8] = TrophyTypes.MONEY;
            this.boardArray[9] = 0;
            this.boardArray[10] = 0;
            this.boardArray[11] = 0;
            this.boardArray[12] = TrophyTypes.SUCCESS;
            this.boardArray[13] = 0;
            this.boardArray[14] = 0;
            this.boardArray[15] = TrophyTypes.BONUS;
            this.boardArray[16] = TrophyTypes.MIRACLE;
            this.boardArray[17] = 0;
            this.boardArray[18] = TrophyTypes.MONEY;
            this.boardArray[19] = 0;
            this.boardArray[20] = 0;
            this.boardArray[21] = TrophyTypes.LOVE;
            this.boardArray[22] = 0;
            this.boardArray[23] = TrophyTypes.HEALTH;
            this.boardArray[24] = 0;
            this.boardArray[25] = TrophyTypes.MONEY;
            this.boardArray[26] = TrophyTypes.SUCCESS;
            this.boardArray[27] = TrophyTypes.BONUS;
            this.boardArray[28] = 0;
            this.boardArray[29] = TrophyTypes.LOVE;
            this.boardArray[30] = TrophyTypes.BONUS;
   

            // DEVELOPMENT PURPOSES
           /*
            this.boardArray[0] = TrophyTypes.BONUS;
            this.boardArray[1] = TrophyTypes.BONUS;
            this.boardArray[2] = TrophyTypes.BONUS;
            this.boardArray[3] = TrophyTypes.BONUS;
            this.boardArray[4] = TrophyTypes.BONUS;
            this.boardArray[5] = TrophyTypes.BONUS;
            this.boardArray[6] = TrophyTypes.BONUS;
            this.boardArray[7] = TrophyTypes.BONUS;
            this.boardArray[8] = TrophyTypes.BONUS;
            this.boardArray[9] = TrophyTypes.BONUS;
            this.boardArray[10] = TrophyTypes.BONUS;
            this.boardArray[11] = TrophyTypes.BONUS;
            this.boardArray[12] = TrophyTypes.BONUS;
            this.boardArray[13] = TrophyTypes.BONUS;
            this.boardArray[14] = TrophyTypes.BONUS;
            this.boardArray[15] = TrophyTypes.BONUS;
            this.boardArray[16] = TrophyTypes.BONUS;
            this.boardArray[17] = TrophyTypes.BONUS;
            this.boardArray[18] = TrophyTypes.MONEY;
            this.boardArray[19] = TrophyTypes.BONUS;
            this.boardArray[20] = TrophyTypes.BONUS;
            this.boardArray[21] = TrophyTypes.BONUS;
            this.boardArray[22] = TrophyTypes.BONUS;
            this.boardArray[23] = TrophyTypes.BONUS;
            this.boardArray[24] = TrophyTypes.BONUS;
            this.boardArray[25] = TrophyTypes.MONEY;
            this.boardArray[26] = TrophyTypes.SUCCESS;
            this.boardArray[27] = TrophyTypes.BONUS;
            this.boardArray[28] = 0;
            this.boardArray[29] = TrophyTypes.LOVE;
            this.boardArray[30] = TrophyTypes.BONUS;
            */

            this.boardCellPositions[0] = { x: 104, y: 710 };
            this.boardCellPositions[1] = { x: 152, y: 704 };
            this.boardCellPositions[2] = { x: 190, y: 717 };
            this.boardCellPositions[3] = { x: 223, y: 736 };
            this.boardCellPositions[4] = { x: 264, y: 755 };
            this.boardCellPositions[5] = { x: 309, y: 770 };
            this.boardCellPositions[6] = { x: 352, y: 739 };
            this.boardCellPositions[7] = { x: 377, y: 679 };
            this.boardCellPositions[8] = { x: 373, y: 634 };
            this.boardCellPositions[9] = { x: 335, y: 573 };
            this.boardCellPositions[10] = { x: 284, y: 565 };
            this.boardCellPositions[11] = { x: 243, y: 576 };
            this.boardCellPositions[12] = { x: 200, y: 598 };
            this.boardCellPositions[13] = { x: 154, y: 606 };
            this.boardCellPositions[14] = { x: 109, y: 601 };
            this.boardCellPositions[15] = { x: 82, y: 565 };
            this.boardCellPositions[16] = { x: 87, y: 483 };
            this.boardCellPositions[17] = { x: 127, y: 438 };
            this.boardCellPositions[18] = { x: 185, y: 434 };
            this.boardCellPositions[19] = { x: 220, y: 446 };
            this.boardCellPositions[20] = { x: 261, y: 465 };
            this.boardCellPositions[21] = { x: 311, y: 486 };
            this.boardCellPositions[22] = { x: 359, y: 469 };
            this.boardCellPositions[23] = { x: 403, y: 419 };
            this.boardCellPositions[24] = { x: 419, y: 356 };
            this.boardCellPositions[25] = { x: 402, y: 308 };
            this.boardCellPositions[26] = { x: 360, y: 272 };
            this.boardCellPositions[27] = { x: 314, y: 274 };
            this.boardCellPositions[28] = { x: 268, y: 277 };
            this.boardCellPositions[29] = { x: 226, y: 284 };
            this.boardCellPositions[30] = { x: 183, y: 245 };
            
            this.posPawnFinal = { x:120, y:206 };
        } else if(this.theScene.gameMode == GameModes.PARALLEL_UNIVERSE) {
            this.boardArray[0] = 0;
            this.boardArray[1] = 0;
            this.boardArray[2] = TrophyTypes.HEALTH;
            this.boardArray[3] = 0;
            this.boardArray[4] = 0;
            this.boardArray[5] = TrophyTypes.LOVE;
            this.boardArray[6] = 0;
            this.boardArray[7] = 0;
            this.boardArray[8] = TrophyTypes.MONEY;
            this.boardArray[9] = 0;
            this.boardArray[10] = 0;
            this.boardArray[11] = 0;
            this.boardArray[12] = TrophyTypes.SUCCESS;
            this.boardArray[13] = 0;
            this.boardArray[14] = 0;
            this.boardArray[15] = TrophyTypes.MIRACLE;
            this.boardArray[16] = 0;
            this.boardArray[17] = 0;
            this.boardArray[18] = TrophyTypes.BONUS;
            this.boardArray[19] = 0;
            this.boardArray[20] = 0;
            this.boardArray[21] = TrophyTypes.HEALTH;
            this.boardArray[22] = 0;
            this.boardArray[23] = TrophyTypes.LOVE;
            this.boardArray[24] = 0;
            this.boardArray[25] = TrophyTypes.BONUS;
            this.boardArray[26] = TrophyTypes.MONEY;
            this.boardArray[27] = 0;
            this.boardArray[28] = 0;
            this.boardArray[29] = TrophyTypes.SUCCESS;
            
            this.boardCellPositions[0] = { x: 67, y: 730 };     // sarı
            this.boardCellPositions[1] = { x: 52, y: 680 };    // mavi
            this.boardCellPositions[2] = { x: 56, y: 622 };    // kahve
            this.boardCellPositions[3] = { x: 67, y: 573 };    // pembe
            this.boardCellPositions[4] = { x: 72, y: 529 };    // mor
            this.boardCellPositions[5] = { x: 62, y: 488 };    // kahve
            this.boardCellPositions[6] = { x: 73, y: 445 };    // yeşil
            this.boardCellPositions[7] = { x: 89, y: 397 };    // mavi
            this.boardCellPositions[8] = { x: 68, y: 352 };    // sarı
            this.boardCellPositions[9] = { x: 93, y: 307 };    // kahve
            this.boardCellPositions[10] = { x: 125, y: 271 };   // mavi
            this.boardCellPositions[11] = { x: 175, y: 263 };   // mor
            this.boardCellPositions[12] = { x: 232, y: 264 };   // yeşil
            this.boardCellPositions[13] = { x: 281, y: 256 };   // turuncu
            this.boardCellPositions[14] = { x: 341, y: 260 };   // pembe
            this.boardCellPositions[15] = { x: 397, y: 285 };   // mor
            this.boardCellPositions[16] = { x: 383, y: 331 };   // kahve
            this.boardCellPositions[17] = { x: 366, y: 370 };   // sarı
            this.boardCellPositions[18] = { x: 396, y: 416 };   // mor
            this.boardCellPositions[19] = { x: 428, y: 463 };   // mavi
            this.boardCellPositions[20] = { x: 404, y: 512 };   // turuncu
            this.boardCellPositions[21] = { x: 405, y: 569 };    // mavi
            this.boardCellPositions[22] = { x: 383, y: 608 };     // yeşil
            this.boardCellPositions[23] = { x: 382, y: 660 };    // turuncu   
            this.boardCellPositions[24] = { x: 406, y: 725 };   // pembe
            this.boardCellPositions[25] = { x: 346, y: 767 };    // mavi
            this.boardCellPositions[26] = { x: 281, y: 767 };    // yeşil
            this.boardCellPositions[27] = { x: 222, y: 762 };    // mor
            this.boardCellPositions[28] = { x: 172, y: 764 };    // kahve
            this.boardCellPositions[29] = { x: 120, y: 750 };    // mor

            this.posPawnFinal = { x:25, y:750 };
        } else if(this.theScene.gameMode == GameModes.HEARTS) {
            this.boardArray[0] = 0;
            this.boardArray[1] = 0;
            this.boardArray[2] = 0;
            this.boardArray[3] = TrophyTypes.LOVE;
            this.boardArray[4] = 0;
            this.boardArray[5] = 0;
            this.boardArray[6] = 0;
            this.boardArray[7] = 0;
            this.boardArray[8] = TrophyTypes.LOVE;
            this.boardArray[9] = 0;
            this.boardArray[10] = TrophyTypes.LOVE;
            this.boardArray[11] = 0;
            this.boardArray[12] = TrophyTypes.LOVE;
            this.boardArray[13] = 0;
            this.boardArray[14] = 0;
            this.boardArray[15] = TrophyTypes.LOVE;
            this.boardArray[16] = 0;
            this.boardArray[17] = TrophyTypes.LOVE;
            this.boardArray[18] = 0;
            this.boardArray[19] = 0;
            this.boardArray[20] = 0;
            this.boardArray[21] = TrophyTypes.LOVE;
            this.boardArray[22] = 0;
            this.boardArray[23] = 0;
            this.boardArray[24] = 0;
            this.boardArray[25] = TrophyTypes.LOVE;
            this.boardArray[26] = TrophyTypes.LOVE;
            this.boardArray[27] = 0;
            this.boardArray[28] = 0;
            this.boardArray[29] = TrophyTypes.LOVE;
            
            this.boardCellPositions[0] = { x: 67, y: 730 };     // sarı
            this.boardCellPositions[1] = { x: 52, y: 680 };    // mavi
            this.boardCellPositions[2] = { x: 56, y: 622 };    // kahve
            this.boardCellPositions[3] = { x: 67, y: 573 };    // pembe
            this.boardCellPositions[4] = { x: 72, y: 529 };    // mor
            this.boardCellPositions[5] = { x: 62, y: 488 };    // kahve
            this.boardCellPositions[6] = { x: 73, y: 445 };    // yeşil
            this.boardCellPositions[7] = { x: 89, y: 397 };    // mavi
            this.boardCellPositions[8] = { x: 68, y: 352 };    // sarı
            this.boardCellPositions[9] = { x: 93, y: 307 };    // kahve
            this.boardCellPositions[10] = { x: 125, y: 271 };   // mavi
            this.boardCellPositions[11] = { x: 175, y: 263 };   // mor
            this.boardCellPositions[12] = { x: 232, y: 264 };   // yeşil
            this.boardCellPositions[13] = { x: 281, y: 256 };   // turuncu
            this.boardCellPositions[14] = { x: 341, y: 260 };   // pembe
            this.boardCellPositions[15] = { x: 397, y: 285 };   // mor
            this.boardCellPositions[16] = { x: 383, y: 331 };   // kahve
            this.boardCellPositions[17] = { x: 366, y: 370 };   // sarı
            this.boardCellPositions[18] = { x: 396, y: 416 };   // mor
            this.boardCellPositions[19] = { x: 428, y: 463 };   // mavi
            this.boardCellPositions[20] = { x: 404, y: 512 };   // turuncu
            this.boardCellPositions[21] = { x: 405, y: 569 };    // mavi
            this.boardCellPositions[22] = { x: 383, y: 608 };     // yeşil
            this.boardCellPositions[23] = { x: 382, y: 660 };    // turuncu   
            this.boardCellPositions[24] = { x: 406, y: 725 };   // pembe
            this.boardCellPositions[25] = { x: 346, y: 767 };    // mavi
            this.boardCellPositions[26] = { x: 281, y: 767 };    // yeşil
            this.boardCellPositions[27] = { x: 222, y: 762 };    // mor
            this.boardCellPositions[28] = { x: 172, y: 764 };    // kahve
            this.boardCellPositions[29] = { x: 120, y: 750 };    // mor

            this.posPawnFinal = { x:25, y:750 };
        } else if(this.theScene.gameMode == GameModes.MONEY) {
            this.boardArray[0] = 0;
            this.boardArray[1] = TrophyTypes.MONEY;
            this.boardArray[2] = 0;
            this.boardArray[3] = TrophyTypes.MONEY;
            this.boardArray[4] = 0;
            this.boardArray[5] = 0;
            this.boardArray[6] = 0;
            this.boardArray[7] = 0;
            this.boardArray[8] = TrophyTypes.MONEY;
            this.boardArray[9] = 0;
            this.boardArray[10] = 0;
            this.boardArray[11] = TrophyTypes.MONEY;
            this.boardArray[12] = 0;
            this.boardArray[13] = 0;
            this.boardArray[14] = TrophyTypes.MONEY;
            this.boardArray[15] = 0;
            this.boardArray[16] = 0;
            this.boardArray[17] = 0;
            this.boardArray[18] = TrophyTypes.MONEY;
            this.boardArray[19] = 0;
            this.boardArray[20] = 0;
            this.boardArray[21] = TrophyTypes.MONEY;
            this.boardArray[22] = 0;
            this.boardArray[23] = TrophyTypes.MONEY;
            this.boardArray[24] = 0;
            this.boardArray[25] = TrophyTypes.MONEY;
            this.boardArray[26] = 0;
            this.boardArray[27] = TrophyTypes.MONEY;
            this.boardArray[28] = 0;
            this.boardArray[29] = 0;
            
            this.boardCellPositions[0] = { x: 67, y: 730 };     // sarı
            this.boardCellPositions[1] = { x: 52, y: 680 };    // mavi
            this.boardCellPositions[2] = { x: 56, y: 622 };    // kahve
            this.boardCellPositions[3] = { x: 67, y: 573 };    // pembe
            this.boardCellPositions[4] = { x: 72, y: 529 };    // mor
            this.boardCellPositions[5] = { x: 62, y: 488 };    // kahve
            this.boardCellPositions[6] = { x: 73, y: 445 };    // yeşil
            this.boardCellPositions[7] = { x: 89, y: 397 };    // mavi
            this.boardCellPositions[8] = { x: 68, y: 352 };    // sarı
            this.boardCellPositions[9] = { x: 93, y: 307 };    // kahve
            this.boardCellPositions[10] = { x: 125, y: 271 };   // mavi
            this.boardCellPositions[11] = { x: 175, y: 263 };   // mor
            this.boardCellPositions[12] = { x: 232, y: 264 };   // yeşil
            this.boardCellPositions[13] = { x: 281, y: 256 };   // turuncu
            this.boardCellPositions[14] = { x: 341, y: 260 };   // pembe
            this.boardCellPositions[15] = { x: 397, y: 285 };   // mor
            this.boardCellPositions[16] = { x: 383, y: 331 };   // kahve
            this.boardCellPositions[17] = { x: 366, y: 370 };   // sarı
            this.boardCellPositions[18] = { x: 396, y: 416 };   // mor
            this.boardCellPositions[19] = { x: 428, y: 463 };   // mavi
            this.boardCellPositions[20] = { x: 404, y: 512 };   // turuncu
            this.boardCellPositions[21] = { x: 405, y: 569 };    // mavi
            this.boardCellPositions[22] = { x: 383, y: 608 };     // yeşil
            this.boardCellPositions[23] = { x: 382, y: 660 };    // turuncu   
            this.boardCellPositions[24] = { x: 406, y: 725 };   // pembe
            this.boardCellPositions[25] = { x: 346, y: 767 };    // mavi
            this.boardCellPositions[26] = { x: 281, y: 767 };    // yeşil
            this.boardCellPositions[27] = { x: 222, y: 762 };    // mor
            this.boardCellPositions[28] = { x: 172, y: 764 };    // kahve
            this.boardCellPositions[29] = { x: 120, y: 750 };    // mor

            this.posPawnFinal = { x:25, y:750 };
        }
    }
    
    public getTrophyName(value:number) {
        for (const [key, val] of Object.entries(TrophyTypes)) {
            if (val === value) {
                //return key + "xx"; // Return the trophy name
                return this.theScene.translateMe('TROPHIES.' + key);
            }
        }

        return null; // Return null if value is not found
    }

    public handleAfterPawnMakesAllTheMovementsGameEngine(): number {
        let result:any = 0;

        if(this.posPlayer > 0 || this.posPlayer < this.boardArray.length) {
            result = this.boardArray[this.posPlayer];
        }
        else {
            // GAME OVER
        }
        
        this.uıpdateTrophyMap();
        
        if(result > 0) {   
            this.boardArray[this.posPlayer] = 0;
            this.theScene.board.removeTrophyFromTheBoard(this.boardCellPositions[this.posPlayer].x, this.boardCellPositions[this.posPlayer].y);
        }

        if(this.theScene.gameMode != GameModes.PRIME) {
            let gameOverCheck = this.gameOverCells.find(q => q == this.posPlayer);
            if(gameOverCheck) {
                this.isGameOver = true;
            }
            else {
                if(result > 0)
                    this.appendToGameOverCells(this.posPlayer);
            }
        }

        return result;
    }

    private uıpdateTrophyMap(): void {
        if(this.boardArray[this.posPlayer] > 0) {
            var tt = this.boardArray[this.posPlayer];
          
            if (this.trophyMap.has(tt)) {
               this.trophyMap.set(tt, this.trophyMap.get(tt) + 1);
            } else {
               this.trophyMap.set(tt, 1);
            }
        
           this.trophyMap = this.sortTrophiesByHits(this.trophyMap);

           this.theScene.events.emit(ENGINE_EVENTS.TROPHIES_UPDATED, this.boardArray[this.posPlayer]);
        }
    }

    private sortTrophiesByHits(tM:Map<any, any>): Map<any, any>{
        const sortedArray = Array.from(tM).sort((a, b) => b[1] - a[1]); // Descending order
        return new Map(sortedArray);
    }

    public appendToGameOverCells(idxCell:number): void {
        this.gameOverCells.push(idxCell);
        let pos:{x:number, y:number} = this.boardCellPositions[idxCell];

        /*
        let dX:number = +50;
        let dY:number = -50;
        if(pos.x > this.theScene.scale.width / 2)
            dX = -50;

        pos = {x:pos.x + dX, y:pos.y + dY};
        
        const strMessage:string = this.theScene.translateMe('MESSAGES.GAME_OVER_CELL');
        this.theScene.displayVanishingText(strMessage, pos.x, pos.y, '24px');
        */
    }

    public handlePlayAgain(): void {
        this.trophyMap = new Map();
        this.gameOverCells = [];
        this.boardArray = [];
        this.createBoardArray();
        this.isGameOver = false;
        this.posPlayer = -1;
        this.bonusesObtained = [];
        this.createBonusDefinitions();
    }

    public updateTexts(): void {
        this.bonusDefinitions = [];
        this.createBonusDefinitions();
    }

    public getNumItemsObtained(): number {
        if(this.theScene.gameMode == GameModes.HEARTS) {
            return this.trophyMap.get(TrophyTypes.LOVE);
        }
        else if(this.theScene.gameMode == GameModes.MONEY) {
            return this.trophyMap.get(TrophyTypes.MONEY);
        }
        else {
            return 0;
        }
    }

    public getBonusDefinition(idxBonus:number): string {
        return this.bonusDefinitions[idxBonus];
    }
}
