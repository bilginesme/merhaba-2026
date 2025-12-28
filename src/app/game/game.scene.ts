import Phaser from 'phaser';
import { TranslateService } from '@ngx-translate/core';
import { CoreGameEngine } from './CoreGameEngine';
import { Board } from './sprites/Board';
import { ChristmasBall } from './sprites/ChristmasBall';
import { Flake } from './sprites/Flake';
import { DTC } from '../DTC';
import Hello from './sprites/Hello';
import { Button} from './sprites/Button';
import Decree from './sprites/Decree';
import { ButtonTypes, DecreeTypes, GameModes as GameModes } from './enums';
import { Settings } from '../services/settings';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import GameModeChangeButton, { GAME_MODE_CHANGE_BUTTON_EVENTS } from './sprites/GameModeChangeButton';
import { EMBOSS_BUTTON_EVENTS } from './sprites/EmbossButton';
import { ShopScene } from './shop.scene'; // Import the class
import { ModeChoosingScene } from './mode-choosing.scene';

export class GameScene extends Phaser.Scene {
  public gameMode:GameModes = GameModes.PRIME;
  private translate!: TranslateService;
  private settings!: Settings;
 
  public coreEngine!: CoreGameEngine;
  public strFontFamily:string = 'Playpen Sans';
  private dtc:DTC = new DTC();
  
  private hello!: Hello;
  public board!: Board;
  private decree!:Decree;
  private christmasBall1!: ChristmasBall;
  private christmasBall2!: ChristmasBall;
  private flakes: Flake[] = [];
  private buttonInfo!: Button;
  private buttonReplay!: Button;
  private buttonSettings!: Button;
  private buttonGmeModeChange!:GameModeChangeButton;
  private txtPlayAgain!: Phaser.GameObjects.Text;
  private imgArrowPlayAgain!: Phaser.GameObjects.Sprite;

  private soundPawn:any;
  private soundGlossyClick:any;
  private soundBonus:any;
  private soundTrophy:any;
  private soundDice:any;
  private soundGameOver:any;
  private soundPlayCardMove:any;
  private backgroundMusic:any;
  private soundPlaycardOpened:any;
  private soundTrophyObtained:any;

  public isDecreeVisible:boolean = false;
  public isFirstTime:boolean = true;

  constructor() {
    super('GameScene');
  }

  preload() {
    this.createLoadingBar();

    //const font = new FontFace(this.strFontFamily, 'url(assets/fonts/LuckiestGuy-Regular.ttf)');
    const font = new FontFace(this.strFontFamily, 'url(assets/fonts/PlaypenSans.ttf)');
    
    font.load().then(() => {
        // Add the font to the document
        document.fonts.add(font);
    }).catch(err => {
        console.error('Font failed to load:', err);
    });
    
    this.load.image('bg', 'assets/images/bg.png');
    this.load.image('board-standard', 'assets/images/board-standard.png');
    this.load.image('board-alternate-reality', 'assets/images/board-alternate-reality.png');
    this.load.image('imgChristmasBall1', 'assets/images/christmas-ball-1.png');
    this.load.image('imgChristmasBall2', 'assets/images/christmas-ball-2.png');
    this.load.image('dashed-line', 'assets/images/dashed-line.png');
    this.load.image('button-question-mark', 'assets/images/buttons/question-mark.png');
    this.load.image('button-replay', 'assets/images/buttons/replay.png');
    this.load.image('button-settings', 'assets/images/buttons/settings.png');
    this.load.image('button-on', 'assets/images/buttons/on.png');
    this.load.image('button-off', 'assets/images/buttons/off.png');
    this.load.image('pinpoint', 'assets/images/buttons/pinpoint.png');
    this.load.image('playcard-back', 'assets/images/playcard-back.png');
    this.load.image('playcard-front', 'assets/images/playcard-front.png');
    this.load.image('game-over-location', 'assets/images/game-over-location.png');
    this.load.image('shop-bg', 'assets/images/shop-bg.png');
    this.load.image('alternate-reality-sample', 'assets/images/alternate-reality-sample.png');
    this.load.image('game-mode-change-clicked', 'assets/images/game-mode-change-clicked.png');
    this.load.image('game-mode-change-normal', 'assets/images/game-mode-change-normal.png');
    this.load.image('lock', 'assets/images/lock.png');
    this.load.image('check-off', 'assets/images/check-off.png');
    this.load.image('check-on', 'assets/images/check-on.png');

    this.load.image('trophy-bonus', 'assets/images/trophy-bonus.png');
    this.load.image('trophy-career', 'assets/images/trophy-career.png');
    this.load.image('trophy-health', 'assets/images/trophy-health.png');
    this.load.image('trophy-love', 'assets/images/trophy-love.png');
    this.load.image('trophy-money', 'assets/images/trophy-money.png');
    this.load.image('trophy-miracle', 'assets/images/trophy-miracle.png');
    this.load.image('pawn-red', 'assets/images/pawn-red.png');
    this.load.image('pawn-yellow', 'assets/images/pawn-yellow.png');
    this.load.image('pawn-green', 'assets/images/pawn-green.png');
    this.load.image('arrow', 'assets/images/arrow.png');
    this.load.image('imgDecreeDown', 'assets/images/decree/decree-down.png');
    this.load.image('imgDecreePaper', 'assets/images/decree/decree-paper.png');
    this.load.image('imgDecreeUp', 'assets/images/decree/decree-up.png');
    this.load.image('imgOracle', 'assets/images/decree/oracle.png');
    this.load.image('ornament', 'assets/images/ornament.png');
    this.load.atlas('spinner-anim', 'assets/images/spinner-anim.png', 'assets/images/spinner-anim.json');

    for(var i = 1; i <= 6; i++) {
      this.load.image('imgDice' + i, 'assets/images/dice/dice-' + i + '.png');
    }

    for(var i = 1; i <= 10; i++) {
      var strN = this.dtc.doubleDigit(i);
      this.load.image('imgFlake' + strN, 'assets/images/flakes/flake-' + strN + '.png');
    }

    this.load.audio('soundPawn', 'assets/sounds/pawn.wav');
    this.load.audio('soundBonus', 'assets/sounds/bonus.mp3');
    this.load.audio('soundTrophy', 'assets/sounds/trophy.mp3');
    this.load.audio('soundDice', 'assets/sounds/dice.mp3');
    this.load.audio('soundGlossyClick', 'assets/sounds/glossy-click.mp3');
    this.load.audio('soundGameOver', 'assets/sounds/end-game.mp3'); 
    this.load.audio('soundPlaycardMove', 'assets/sounds/playcard-move.mp3'); 
    this.load.audio('soundPlaycardOpened', 'assets/sounds/playcard-opened.mp3'); 
    this.load.audio('soundTrophyObtained', 'assets/sounds/trophy-obtained.mp3'); 
    
    this.backgroundMusic = this.load.audio('backgroundMusic', 'assets/sounds/new-year-bg.mp3');
  }

  createLoadingBar() {
      // --- LOADING BAR SETUP START ---
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    // 1. Create a background box for the bar (Dark Teal)
    const progressBox = this.add.graphics();
    progressBox.fillStyle(0xaa1e22, 0.8);
    progressBox.fillRect(width / 2 - 160, height / 2 - 25, 320, 50);

    // 2. Create the filling bar (initially empty)
    const progressBar = this.add.graphics();

    // 3. Loading Text (e.g. "Loading...")
    const loadingText = this.add.text(width / 2, height / 2 - 50, 'LOADING..', {
        font: '30px "Inter", sans-serif',
        color: '#FFFFFF'
    });
    loadingText.setOrigin(0.5, 0.5);

    // 4. Percentage Text (e.g. "50%")
    const percentText = this.add.text(width / 2, height / 2, '0%', {
        font: '18px monospace',
        color: '#ffffff'
    });
    percentText.setOrigin(0.5, 0.5);

    // 5. Listen for Loader Events
    this.load.on('progress', (value: number) => {
        // Update percentage text
        percentText.setText(Math.floor(value * 100) + '%');
        
        // Update bar width (White fill)
        progressBar.clear();
        progressBar.fillStyle(0xffba52, 1);
        progressBar.fillRect(width / 2 - 150, height / 2 - 15, 300 * value, 30);
    });

    this.load.on('complete', () => {
        // Clean up when done
        progressBar.destroy();
        progressBox.destroy();
        loadingText.destroy();
        percentText.destroy();
    });
    // --- LOADING BAR SETUP END ---
  }

  create() {
    this.translate = this.registry.get('translateService');
    this.settings = this.registry.get('settings');

    this.gameMode = this.settings.gameMode$.value;

    this.coreEngine = new CoreGameEngine(this);
    this.cameras.main.setBackgroundColor('#aa1e22'); // for visibility
    
    const bg = this.add.image(0, 0, 'bg').setOrigin(0, 0).setAlpha(0.4);
    bg.setDisplaySize(this.scale.width, this.scale.height);
    bg.setDisplayOrigin(0, 0);

    this.soundPawn = this.sound.add('soundPawn', {loop: false,  volume: 0.5});
    this.soundBonus = this.sound.add('soundBonus', {loop: false,  volume: 0.5});
    this.soundTrophy = this.sound.add('soundTrophy', {loop: false,  volume: 0.5});
    this.soundDice = this.sound.add('soundDice', {loop: false,  volume: 0.3});
    this.soundGameOver = this.sound.add('soundGameOver', {loop: false,  volume: 0.3});
    this.soundGlossyClick = this.sound.add('soundGlossyClick', {loop: false,  volume: 0.5});
    this.soundPlayCardMove = this.sound.add('soundPlaycardMove', {loop: false,  volume: 0.5});
    this.soundPlaycardOpened = this.sound.add('soundPlaycardOpened', {loop: false,  volume: 0.5});
    this.soundTrophyObtained = this.sound.add('soundTrophyObtained', {loop: false,  volume: 0.5});

    this.backgroundMusic = this.sound.add('backgroundMusic', { loop: true,  volume: 0.1});
    if(this.settings.backgroundMusicEnabled$.value == true) {
      this.resumeBackgroundMusic();
    }

    this.flakes.push(new Flake(this, 254, 46, 'imgFlake01'));
    this.flakes.push(new Flake(this, 110, 98, 'imgFlake02'));
    this.flakes.push(new Flake(this, 347, 132, 'imgFlake03'));
    this.flakes.push(new Flake(this, 125, 284, 'imgFlake04'));
    this.flakes.push(new Flake(this, 186, 477, 'imgFlake05'));
    this.flakes.push(new Flake(this, 379, 483, 'imgFlake06'));
    this.flakes.push(new Flake(this, 290, 608, 'imgFlake07'));
    this.flakes.push(new Flake(this, 50, 730, 'imgFlake08'));
    this.flakes.push(new Flake(this, 174, 760, 'imgFlake09'));
    this.flakes.push(new Flake(this, 363, 740, 'imgFlake10'));

    this.board = new Board(this, 0, 0);
    this.christmasBall1 = new ChristmasBall(this, 50, -50, 'imgChristmasBall1');
    this.christmasBall2 = new ChristmasBall(this, 390, -55, 'imgChristmasBall2');
    this.hello = new Hello(this, 100, 60);
    this.decree = new Decree(this);
    this.decree.setVisible(false);

    this.buttonInfo = new Button(this, 50, this.getSize().height - 50, 'button-question-mark', ButtonTypes.Info);
    this.buttonReplay = new Button(this, 125, this.getSize().height - 50, 'button-replay', ButtonTypes.Replay);
    this.buttonReplay.visible = false;
    this.txtPlayAgain = this.add.text(210, this.getSize().height - 50, this.translateMe('BUTTONS.PLAY_AGAIN_MULTI_LINE'),
    {
      fontFamily: this.strFontFamily,
      fontSize: '20px',
      fontStyle: '900',
      align:'center',
      color: '#FFFFFF',
    }).setInteractive().setDepth(10).setVisible(false).setOrigin(0.0, 0.5 );
    this.imgArrowPlayAgain = this.add.sprite(192, this.txtPlayAgain.y, 'arrow')
      .setOrigin(0.0, 0.5).setVisible(false).setScale(-0.5);  

    this.buttonSettings = new Button(this, this.getSize().width - 50, this.getSize().height - 50, 'button-settings', ButtonTypes.Settings);
    this.buttonGmeModeChange = new GameModeChangeButton(this, this.getSize().width / 2, this.getSize().height - 120 );
    this.isDecreeVisible = false;
    
    if(this.isFirstTime) {
      this.isFirstTime = false;
      //let strTRext = this.translateMe('OPENING_MESSAGE.LINE1') + '\n\n' + this.translateMe('OPENING_MESSAGE.LINE2') + '\n\n' + this.translateMe('OPENING_MESSAGE.LINE3');
      //this.openDecree(DecreeTypes.GameStart, strTRext); // TODO bunu kaldır yayınlarken
      //this.displayTheGameEndAnimation();
    }

    this.events.on(GAME_MODE_CHANGE_BUTTON_EVENTS.GAME_MODE_CHANGE_BUTTON_CLICKED, this.handleGameModeChange, this);
    this.events.on('resume', (scene: Phaser.Scene, data: any) => {
        if (data && data.mode) {
            let gameMode:number = this.settings.gameMode$.value;
            let previousGameMode = this.gameMode;
            this.buttonGmeModeChange.updateTexts();
            this.gameMode = gameMode;

            if(previousGameMode != gameMode)
              this.playAgain(); // TODO - all the components should be re-created
        }
    });

    //dthis.displayTheGameEndAnimation();

    // DEVELOPMENT
    // Needed for mouse locations for creating another board
    /*
    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
        let x:number =parseInt(pointer.x.toString());
        let y:number =parseInt(pointer.y.toString());
        console.log(`Screen X: ${x}, Screen Y: ${y}`);
    });
    */

 
  }

  override update(time: number, delta: number) {}

  private handleGameModeChange(): void {
    this.scene.pause();
    this.scene.run('ModeChoosingScene'); // Starts or Wakes
  }

  public displayShopScreen(): void {
    this.scene.pause();
    this.scene.run('ShopScene'); // Starts or Wakes
  }

  public handleLanguageSettingsChange(): void {
    this.txtPlayAgain.text = this.translateMe('BUTTONS.PLAY_AGAIN_MULTI_LINE');
    this.hello.updateTexts();
    this.board.updateTexts();
    this.buttonGmeModeChange.updateTexts();
    this.coreEngine.updateTexts();
    const shopScene = this.scene.get('ShopScene') as ShopScene;
    const modeChoosingScene = this.scene.get('ModeChoosingScene') as ModeChoosingScene;
    if(shopScene && shopScene.isOpenedYet)
      shopScene.updateTexts();
    if(ModeChoosingScene && modeChoosingScene.isOpenedYet)
      modeChoosingScene.updateTexts();
  } 

  public unlockIAP(): void {
    this.settings.setIAPPurchased(true);
    this.board.hideAdvertisement();
    const modeChoosingScene = this.scene.get('ModeChoosingScene') as ModeChoosingScene;    
    if(ModeChoosingScene && modeChoosingScene.isOpenedYet)
      modeChoosingScene.unlockIAP();
  }

  public getEngine(): CoreGameEngine {
    return this.coreEngine;
  }

  public translateMe(str:string): string {
    return this.translate.instant(str);
  }

  public changeLanguage(lang: string): Observable<any> {
      return this.translate.use(lang).pipe(
          // Optional: Use 'tap' if you want to log it here without breaking the stream
          tap(() => console.log('Language loaded internally'))
      );
  }

  public getBonusTranslations(): string[] {
    let bonusDefinitions = [];
    const bonusItems = this.translate.instant('BONUS.DEFINITIONS');

    if (Array.isArray(bonusItems)) {
        bonusDefinitions = bonusItems.slice(); // create a copy
    }

    return bonusDefinitions;
  }

  public playAgain(): void {
    this.coreEngine.handlePlayAgain();
    this.board.handlePlayAgain();
    
    if(this.settings.backgroundMusicEnabled$.value == true) {
      this.resumeBackgroundMusic();
    }
    this.hideButtonReplay();
  }

  public playSound(soundName: string): void {
    if(this.settings.soundEnabled$.value == false) {
      return;
    }

    switch (soundName) {
      case 'soundPawn':
        this.soundPawn.play();
        break;  
      case 'soundBonus':
        this.soundBonus.play();
        break;
      case 'soundTrophy':
        this.soundTrophy.play();
        break;
      case 'soundDice':
        this.soundDice.play();
        break;
      case 'soundGlossyClick':
        this.soundGlossyClick.play();
        break;
      case 'soundGameOver':
        this.soundGameOver.play();
        break;
      case 'soundPlaycardMove':
        this.soundPlayCardMove.play();
        break;
      case 'soundPlaycardOpened':
        this.soundPlaycardOpened.play();
        break;
      case 'soundTrophyObtained':
        this.soundTrophyObtained.play();
        break;
    }
  }

  public pauseBackgroundMusic() {
    this.backgroundMusic.pause();
  }

  public resumeBackgroundMusic() {
    this.backgroundMusic.play();
  }

  public openDecree(decreeType: DecreeTypes, strText: string) {
    this.decree.openDecree(decreeType, strText);
  }
 
  public openDecreeSettings(): void {
    this.decree.openDecree(DecreeTypes.Settings, this.translateMe(' ')); 
  }

  public displayTheGameEndAnimation() {
    if(this.settings.backgroundMusicEnabled$.value == true) {
      this.backgroundMusic.pause();
      this.soundGameOver.play();
    }
    else if(this.settings.backgroundMusicEnabled$.value == false && this.settings.soundEnabled$.value == true) {
      this.soundGameOver.play();
    }

    this.displayButtonReplay();

    let strText = this.translateMe('GAME_END.LINE1') + '\n\n' + this.translateMe('GAME_END.LINE2') + '\n\n' + this.translateMe('GAME_END.LINE3');
    let numItems:number = this.coreEngine.getNumItemsObtained();

    if(this.gameMode == GameModes.HEARTS || this.gameMode == GameModes.MONEY) {
      let strScoreComment:string = '';
      
      if(numItems == 10) {
        strScoreComment = this.translateMe('GAME_MODES.SCORE_COMMENTS.PERFECT');
      }
      else if (numItems >= 7 && numItems < 10) {
        strScoreComment = this.translateMe('GAME_MODES.SCORE_COMMENTS.HIGH');
      }
      else if (numItems >= 5 && numItems < 7) {
        strScoreComment = this.translateMe('GAME_MODES.SCORE_COMMENTS.MID');
      }
      else if (numItems >= 3 && numItems < 5) {
        strScoreComment = this.translateMe('GAME_MODES.SCORE_COMMENTS.LOW');
      }
      else if (numItems < 3) {
        strScoreComment = this.translateMe('GAME_MODES.SCORE_COMMENTS.ZERO');
      }

      strText = numItems + '|' + strScoreComment;
    }

    this.decree.openDecree(DecreeTypes.GameEnd, strText);
  }

  public displayButtonReplay() {
    this.buttonReplay.setVisible(true);
    this.txtPlayAgain.setVisible(true);
    this.imgArrowPlayAgain.setVisible(true);
  
    const animateMe = () => {
        const randomDuration = Phaser.Math.Between(500, 900); // Random duration
        const randomAlpha = Phaser.Math.FloatBetween(0.6, 1.0); // Random swing angle

        // Tween to move the ball down
        this.tweens.add({
            targets: this.buttonReplay,
            duration: randomDuration, // Use random duration
            alpha: randomAlpha,
            ease: 'Sine.easeInOut', // Smooth easing
            onComplete: () => {
              const randomAlphaReturn = Phaser.Math.FloatBetween(0.6, 1.0); // Random swing angle
              this.tweens.add({
                    targets: this.buttonReplay,
                    duration: Phaser.Math.Between(500, 900), // Random duration for upward motion
                    alpha: randomAlphaReturn,
                    ease: 'Sine.easeInOut',
                    onComplete: animateMe // Loop by calling moveBall again
                });
            }
        });
    };
    animateMe(); // Start the animation
  
    let posXrrow:number = this.imgArrowPlayAgain.x
        
    const animateArrow = () => {
        this.tweens.add({
        targets: this.imgArrowPlayAgain,
        duration: 600, 
        x: posXrrow,
        ease: 'Sine.easeInOut', // Smooth easing
        onComplete: () => {
            this.tweens.add({
                targets: this.imgArrowPlayAgain,
                duration: 600, 
                x: posXrrow + 10,
                ease: 'Sine.easeInOut',
                onComplete: animateArrow // Loop by calling moveBall again
            });
        }
    });
    };

    animateArrow();

   this.buttonReplay.on('pointerdown', () => {
      if(!this.isDecreeVisible) {
         this.soundGlossyClick.play();
         this.tweens.add({
            targets:  this.buttonReplay,
            scaleX: 1.5, 
            scaleY: 1.5,
            duration: 100, // Duration of the scaling up
            yoyo: true, // Return to normal size
            ease: 'Power1', // Smooth easing effect
            onComplete: () => {
               this.hideButtonReplay();
               this.playAgain();
               this.board.dice.displayToolTip();
            }
         });
      }
   });
  }
  
  public hideButtonReplay() {
    this.buttonReplay.setVisible(false);
    this.txtPlayAgain.setVisible(false);
    this.imgArrowPlayAgain.setVisible(false);
  }

  public displayVanishingText(strText:string, posX:number, posY:number, fontSize:string) {
   let txtShadow = this.add.text(posX + 3, posY + 3, strText, 
    {fontFamily: this.strFontFamily, fontSize: fontSize, fontStyle: '900', align:'center', color: '#505050'});
   txtShadow.setOrigin(0.5, 0.5).setDepth(200);

   let txtNormal = this.add.text(posX, posY, strText, 
    {fontFamily: this.strFontFamily, fontSize: fontSize, fontStyle: '900', align:'center', color: '#ffffff'});
   txtNormal.setOrigin(0.5, 0.5).setDepth(200);

   this.tweens.add({
      targets: txtNormal,
      scaleX: 1,
      scaleY: 1,
      alpha: 1,
      duration: 1000, 
      ease: 'Bounce.easeOut',
      onStart: () => {
         txtNormal.setScale(0); 
         txtNormal.setAlpha(1); 
      },
      onComplete: () => {
         setTimeout(() => {
            this.tweens.add({
               targets: txtNormal,
               alpha: 0,
               duration: 3000, 
               ease: 'Power1',
               onComplete: () => {
                  txtNormal.destroy(); 
               }
            });
         }, 500);
      }
      });

   this.tweens.add({
      targets: txtShadow,
      scaleX: 1,
      scaleY: 1,
      alpha: 1,
      duration: 1000, 
      ease: 'Bounce.easeOut',
      onStart: () => {
         txtShadow.setScale(0); 
         txtShadow.setAlpha(1); 
      },
      onComplete: () => {
         setTimeout(() => {
            this.tweens.add({
               targets: txtShadow,
               alpha: 0,
               duration: 2000, 
               ease: 'Power1',
               onComplete: () => {
                  txtShadow.destroy(); 
               }
            });
         }, 500);
      }
      });
  }

  public getSettings(): Settings {
    return this.settings;
  }

  public getSize(): {width:number, height:number} {
    return {width: this.scale.width, height: this.scale.height};
  }

  public openDecreeInfo(): void {
    this.decree.openDecree(DecreeTypes.Info, this.translateMe('ABOUT.LINE1') + '\n\n' + this.translateMe('ABOUT.LINE2') + '\n\n' + this.translateMe('ABOUT.LINE3'));

    //this.settings.clearAllSettings();
    //console.log('Settings cleared');  // DEVELOPER ONLY
      
    //this.displayTheGameEndAnimation();
    //this.handleShopClick();
  }
}
