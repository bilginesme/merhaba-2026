import Phaser, { Game } from "phaser";
import { GameScene } from "../game.scene";
import { DecreeTypes } from "../enums";
import { DTC } from "src/app/DTC";
import { Share } from '@capacitor/share';
import { Browser } from '@capacitor/browser';

export default class Decree extends Phaser.GameObjects.Container {
  private dtc:DTC = new DTC();
  private theScene!: GameScene;
  private posYStart = 206;
  private imgDecreeUp!: Phaser.GameObjects.Sprite;
  private imgDecreeDown!: Phaser.GameObjects.Sprite;
  private imgDecreePaper!: Phaser.GameObjects.Sprite;
  private imgOracle!: Phaser.GameObjects.Sprite;
  private imgOrnament!:Phaser.GameObjects.Image;
  private buttonShare!: Phaser.GameObjects.Text;
  private buttonHomePage!: Phaser.GameObjects.Text;
  private buttonClose!: Phaser.GameObjects.Text;
  private buttonCloseShadow!: Phaser.GameObjects.Text;
  private buttonReplay!: Phaser.GameObjects.Text;
  private buttonSound!: Phaser.GameObjects.Sprite;
  private buttonBackgroundMusic!: Phaser.GameObjects.Sprite;
  private pinpoint!: Phaser.GameObjects.Sprite;
  private txtDecree!: Phaser.GameObjects.Text;
  private txtSoundTitle!: Phaser.GameObjects.Text;
  private txtBackgroundMusicTitle!: Phaser.GameObjects.Text;
  private txtLanguageTitle!: Phaser.GameObjects.Text;
  private txtLanguageName!: Phaser.GameObjects.Text;
  private txtLanguages:Phaser.GameObjects.Text[] = [];
  private txtScore!: Phaser.GameObjects.Text;
  private txtScoreComment!: Phaser.GameObjects.Text;

  constructor(scene: GameScene) {
    super(scene);

    this.theScene = scene;
    this.setScale(1);

    const upX = scene.scale.width / 2;

    this.imgDecreePaper = this.theScene.add.sprite(0, 0, 'imgDecreePaper').setDepth(100);
    this.imgDecreePaper.x = upX;
    this.imgDecreePaper.y = this.posYStart;
    this.imgDecreePaper.setOrigin(0.5, 0);
    this.imgDecreePaper.scaleY = 0.05;
    this.imgDecreePaper.setVisible(false);

    this.imgDecreeUp = this.theScene.add.sprite(0, 0, 'imgDecreeUp').setDepth(100);
    this.imgDecreeUp.x = upX;
    this.imgDecreeUp.y = this.posYStart;
    this.imgDecreeUp.setVisible(false);

    this.imgDecreeDown = this.theScene.add.sprite(0, 0, 'imgDecreeDown').setDepth(100);
    this.imgDecreeDown.x = this.imgDecreeUp.x;
    this.imgDecreeDown.y = this.imgDecreeUp.y + this.imgDecreeUp.height + 50;
    this.imgDecreeDown.setVisible(false);

    this.imgOracle = this.theScene.add.sprite(0, 0, 'imgOracle').setInteractive().setDepth(100);
    this.imgOracle.setOrigin(0.5, 0.5);
    this.imgOracle.setVisible(false);

    this.imgOrnament = this.theScene.add.image(0, 0, 'ornament').setDepth(100);
    this.imgOrnament.setOrigin(0.5, 0.5);
    this.imgOrnament.setVisible(false);

    this.txtDecree = this.theScene.add.text(this.theScene.getSize().width / 2, 210, '', {
      fontFamily: this.theScene.strFontFamily,
      fontSize: '21px',
      color: '#303040',
      wordWrap: { width: 240 },
      align: 'center',
    }).setOrigin(0.5, 0);
    this.txtDecree.setAlpha(0).setDepth(100);
  }

  public openDecree(decreeType: DecreeTypes, strText: string): void {
    if (this.theScene.isDecreeVisible) return;
    this.theScene.isDecreeVisible = true;
    var posYStart = 112;

    this.imgDecreeUp.x = this.scene.scale.width / 2;
    this.imgDecreeUp.y = posYStart;
    this.imgDecreeUp.setVisible(true);

    this.imgDecreeDown.x = this.imgDecreeUp.x;
    this.imgDecreeDown.y = this.imgDecreeUp.y + this.imgDecreeUp.height + 10;
    this.imgDecreeDown.setVisible(true);

    this.imgDecreePaper.x = this.imgDecreeUp.x;
    this.imgDecreePaper.y = this.imgDecreeUp.y + this.imgDecreeUp.height / 2 - 25;
    this.imgDecreePaper.setOrigin(0.5, 0);
    this.imgDecreePaper.setVisible(true);
    this.imgDecreePaper.scaleY = 0.05;

    this.theScene.tweens.add({
      targets: this.imgDecreePaper,
      scaleY: 1,
      duration: 800,
      ease: 'Sine.easeInOut',
      repeat: 0,
      onComplete: () => {
        this.theScene.isDecreeVisible = true;

        this.txtDecree.setText(strText);
        this.txtDecree.setAlpha(0);
        if(decreeType == DecreeTypes.Bonus) {
          this.txtDecree.setFontSize(24);
        }
        else {
          this.txtDecree.setFontSize(21);
        }

        this.theScene.tweens.add({
          targets: this.txtDecree,
          alpha: 1, // Fade to full visibility
          duration: 1000, // Duration of 1 second
          ease: 'Power1', // Easing for smooth animation
          onComplete: () => {},
        });

        this.imgOrnament.x = this.theScene.getSize().width / 2;
        this.imgOrnament.y = this.y + 170;
        this.imgOrnament.setAlpha(0.2);
        this.imgOrnament.setVisible(true);

        if (decreeType == DecreeTypes.Bonus) {
          this.imgOracle.setVisible(true);
          this.imgOracle.setAlpha(0);
          this.imgOracle.x = this.theScene.getSize().width / 2;
          this.imgOracle.y = 600;
          this.imgOracle.scaleX = 1.0;
          this.imgOracle.scaleY = 1.0;
          this.theScene.tweens.add({
            targets: this.imgOracle,
            alpha: 0.6, // Fade to full visibility
            duration: 1000, // Duration of 1 second
            ease: 'Power1', // Easing for smooth animation
            onComplete: () => {},
          });
        } else if (decreeType == DecreeTypes.GameEnd) {
          if(strText.includes('|')) {    // which mens it's LOVE or MONEY
            let text = strText;
            const myArray = text.split("|");

            this.txtDecree.setText('');

            let strScore:string = myArray[0] +' / 10';
            let strScoreComment = myArray[1];

            this.txtScore = this.theScene.add.text(225, 300, strScore, {
              fontFamily: this.theScene.strFontFamily,
              fontSize: '48px',
              fontStyle: '900',
              color: '#333204ff',
            }).setInteractive().setDepth(100);
            this.txtScore.setOrigin(0.5, 0.5);

            this.txtScoreComment = this.theScene.add.text(225, 400, strScoreComment, {
              fontFamily: this.theScene.strFontFamily,
              fontSize: '32px',
              fontStyle: '900',
              align: 'center',
              wordWrap: { width: 300 },
              color: '#333204ff',
              }).setInteractive().setDepth(100);
            this.txtScoreComment.setOrigin(0.5, 0);
            }

          this.buttonReplay = this.theScene.add.text(225, 650, this.theScene.translateMe('BUTTONS.PLAY_AGAIN_SINGLE_LINE'),
              {
                fontFamily: this.theScene.strFontFamily,
                fontSize: '24px',
                fontStyle: '900',
                color: '#333204ff',
              }
            ).setInteractive().setDepth(100);
          this.buttonReplay.setOrigin(0.5, 0.5);

          this.buttonReplay.on('pointerdown', () => {
            this.theScene.playSound('soundGlossyClick');
            this.theScene.pauseBackgroundMusic();
            this.theScene.tweens.add({
              targets: this.buttonReplay,
              scaleX: 1.2,
              scaleY: 1.2,
              duration: 100, // Duration of the scaling up
              yoyo: true, // Return to normal size
              ease: 'Power1', // Smooth easing effect
              onComplete: () => {
                this.buttonClose.setVisible(false);
                this.buttonCloseShadow.setVisible(false);
                this.buttonReplay.setVisible(false);
                this.buttonShare.setVisible(false);
                if(this.txtScore)
                  this.txtScore.setVisible(false);
                if(this.txtScoreComment)
                  this.txtScoreComment.setVisible(false);
                this.closeDecree();
                this.theScene.playAgain();
              },
            });
          });

          this.buttonShare = this.theScene.add
            .text(225, 705, this.theScene.translateMe('BUTTONS.SHARE'), {
              fontFamily: this.theScene.strFontFamily,
              fontSize: '24px',
              fontStyle: '900',
              color: '#333204ff',
            }).setInteractive().setDepth(100);
          this.buttonShare.setOrigin(0.5, 0.5);

          this.buttonShare.on('pointerdown', () => {
            this.theScene.playSound('soundGlossyClick');
            this.theScene.tweens.add({
              targets: this.buttonShare,
              scaleX: 1.2,
              scaleY: 1.2,
              duration: 100, // Duration of the scaling up
              yoyo: true, // Return to normal size
              ease: 'Power1', // Smooth easing effect
              onComplete: () => {
                this.buttonClose.setVisible(false);
                this.buttonCloseShadow.setVisible(false);
                this.buttonReplay.setVisible(false);
                this.buttonShare.setVisible(false);
             
                if(this.txtScore)
                  this.txtScore.setVisible(false);
                if(this.txtScoreComment)
                  this.txtScoreComment.setVisible(false);

                this.closeDecree();
                this.theScene.displayButtonReplay();
                this.shareGame();
              },
            });
          });
        } else if (decreeType == DecreeTypes.Info) {
          this.buttonHomePage = this.theScene.add
            .text(225, 600, this.theScene.translateMe('BUTTONS.HOME_PAGE'), {
              fontFamily: this.theScene.strFontFamily,
              fontSize: '24px',
              fontStyle: '900',
              color: '#333204ff',
            }).setInteractive().setDepth(100);
          this.buttonHomePage.setOrigin(0.5, 0.5);

          this.buttonHomePage.on('pointerdown', () => {
            this.theScene.playSound('soundGlossyClick');
            this.theScene.tweens.add({
              targets: this.buttonHomePage,
              scaleX: 1.2,
              scaleY: 1.2,
              duration: 100, // Duration of the scaling up
              yoyo: true, // Return to normal size
              ease: 'Power1', // Smooth easing effect
              onComplete: () => {
                this.buttonClose.setVisible(false);
                this.buttonCloseShadow.setVisible(false);
                this.buttonShare.setVisible(false);
                this.buttonHomePage.setVisible(false);
                this.closeDecree();
                
                this.openHomepage();
              },
            });
          });

          this.buttonShare = this.theScene.add.text(225, 650, this.theScene.translateMe('BUTTONS.SHARE'), {
              fontFamily: this.theScene.strFontFamily,
              fontSize: '26px',
              fontStyle: '900',
              color: '#333204ff',
            }).setInteractive().setDepth(100);
          this.buttonShare.setOrigin(0.5, 0.5);
          this.buttonShare.on('pointerdown', () => {
            this.theScene.playSound('soundGlossyClick');
            this.theScene.tweens.add({
              targets: this.buttonShare,
              scaleX: 1.2,
              scaleY: 1.2,
              duration: 100, // Duration of the scaling up
              yoyo: true, // Return to normal size
              ease: 'Power1', // Smooth easing effect
              onComplete: () => {
                this.buttonClose.setVisible(false);
                this.buttonCloseShadow.setVisible(false);
                this.buttonShare.setVisible(false);
                this.buttonHomePage.setVisible(false);
                this.closeDecree();
                this.shareGame();
              },
            });
          });
        } else if(decreeType == DecreeTypes.Settings) {
          this.createContentSettings();
        }

        // BUTTON CLOSE
        // VALID FOR ALL DECREE TYPES
        this.buttonCloseShadow = this.theScene.add.text(223, 778, this.theScene.translateMe('BUTTONS.CLOSE'), {
            fontFamily: this.theScene.strFontFamily,
            fontSize: '30px',
            fontStyle: '900',
            color: '#5e5c0483',
          }).setInteractive().setDepth(100);
        this.buttonCloseShadow.setOrigin(0.5, 0.5);
        this.buttonCloseShadow.setVisible(true);

        this.buttonClose = this.theScene.add.text(225, 780, this.theScene.translateMe('BUTTONS.CLOSE'), {
            fontFamily: this.theScene.strFontFamily,
            fontSize: '30px',
            fontStyle: '900',
            color: '#333204ff',
          }).setInteractive().setDepth(100);
        this.buttonClose.setOrigin(0.5, 0.5);
        this.buttonClose.setVisible(true);

        this.buttonClose.on('pointerdown', () => {
          this.theScene.playSound('soundGlossyClick');
          this.theScene.tweens.add({
            targets: this.buttonClose,
            scaleX: 1.2,
            scaleY: 1.2,
            duration: 100, // Duration of the scaling up
            yoyo: true, // Return to normal size
            ease: 'Power1', // Smooth easing effect
            onComplete: () => {
              this.theScene.children.remove(this.buttonClose);
              this.theScene.children.remove(this.buttonCloseShadow);
              //this.theScene.children.remove(this.txtDecree);

              if (decreeType == DecreeTypes.GameEnd) {
                this.theScene.children.remove(this.buttonReplay);
                this.theScene.children.remove(this.buttonShare);
                this.theScene.children.remove(this.txtScore);
                this.theScene.children.remove(this.txtScoreComment);
                this.theScene.displayButtonReplay();
              } else if (decreeType == DecreeTypes.Info) {
                this.theScene.children.remove(this.buttonHomePage);
                this.theScene.children.remove(this.buttonShare);
              } else if(decreeType == DecreeTypes.Settings) {
                this.theScene.children.remove(this.buttonSound);
                this.theScene.children.remove(this.buttonBackgroundMusic);
                this.theScene.children.remove(this.txtSoundTitle);
                this.theScene.children.remove(this.txtBackgroundMusicTitle);
                this.theScene.children.remove(this.txtLanguageTitle);
                this.theScene.children.remove(this.txtLanguageName);
                this.txtLanguages.forEach(element => {
                  this.theScene.children.remove(element);
                }); 
                this.theScene.children.remove(this.pinpoint);

                //this.theScene.scene.restart();  // TODO sadece oyun tipi ve dil değişmişse yapalım, restart için her şeyin ona göre ayarlanması alzım
                //this.theScene.playAgain();
                this.theScene.handleLanguageSettingsChange();
              } 

              this.closeDecree();
            },
          });
        });
      },
    });

    this.theScene.tweens.add({
      targets: this.imgDecreeDown,
      y: 830, 
      duration: 800, 
      ease: 'Sine.easeInOut',
      repeat: 0, 
   });
  }

  private createContentSettings(): void {
    let settings = this.theScene.getSettings();
 
    // SOUND
    this.txtSoundTitle = this.theScene.add.text(100, 210, this.theScene.translateMe('SETTINGS.SOUND'), {
        fontFamily: this.theScene.strFontFamily,
        fontSize: '20px',
        color: '#000000a1',
    }).setOrigin(0.0, 0.5).setDepth(100);

    let strTextureSound = 'button-on';
    if(settings.soundEnabled$.value == false) {
      strTextureSound = 'button-off';
    }
        
    this.buttonSound = this.theScene.add.sprite(330, 210, strTextureSound).setInteractive().setDepth(100);
    this.buttonSound.setOrigin(0.5, 0.5);

    this.buttonSound.on('pointerdown', () => {
      this.theScene.playSound('soundGlossyClick');
      this.theScene.tweens.add({
        targets: this.buttonSound,
        scale: 1.2,
        duration: 100,
        yoyo: true, // Return to normal size
        ease: 'Power1', // Smooth easing effect
        onComplete: () => {
          if (settings.soundEnabled$.value == false) {
            settings.setSound(true);
            this.buttonSound.setTexture('button-on');
          } else {
            settings.soundEnabled$.next(false);
            settings.setSound(false);
            this.buttonSound.setTexture('button-off');
          }
        },
      });
    });

    // BACKGROUND MUSIC
    this.txtBackgroundMusicTitle = this.theScene.add.text(100, 250, this.theScene.translateMe('SETTINGS.BACKGROUND_MUSIC'), {
        fontFamily: this.theScene.strFontFamily,
        fontSize: '20px',
        color: '#000000a1',
    }).setOrigin(0.0, 0.5).setDepth(100);

    let strTextureBackgroundMusic = 'button-on';
    if(settings.backgroundMusicEnabled$.value == false) {
      strTextureBackgroundMusic = 'button-off';
    }
             
    this.buttonBackgroundMusic = this.theScene.add.sprite(330, 250, strTextureBackgroundMusic).setInteractive().setDepth(100);
    this.buttonBackgroundMusic.setOrigin(0.5, 0.5);

    this.buttonBackgroundMusic.on('pointerdown', () => {
      this.theScene.playSound('soundGlossyClick');
      this.theScene.tweens.add({
        targets: this.buttonBackgroundMusic,
        scale: 1.2,
        duration: 100,
        yoyo: true, // Return to normal size
        ease: 'Power1', // Smooth easing effect
        onComplete: () => {
          if (settings.backgroundMusicEnabled$.value == false) {
            settings.setBackgroundMusic(true);
            this.buttonBackgroundMusic.setTexture('button-on');
            this.theScene.resumeBackgroundMusic();
          } else {
            settings.backgroundMusicEnabled$.next(false);
            settings.setBackgroundMusic(false);
            this.buttonBackgroundMusic.setTexture('button-off');
            this.theScene.pauseBackgroundMusic();
          }
        },
      });
    });

    // LANGUAGE
    this.txtLanguageTitle = this.theScene.add.text(100, 320, this.theScene.translateMe('SETTINGS.LANGUAGE'), {
        fontFamily: this.theScene.strFontFamily,
        fontSize: '20px',
        color: '#000000a1',
    }).setOrigin(0.0, 0.5).setDepth(100);

    this.txtLanguages = [];
    const startPos:{x:number, y:number} = {x: 88, y: 370};
    const rowSpace:number = 24;
    const colSpace:number = 100;

    const supportedLanguageCodes = this.dtc.getSupportedLanguageCodes();
    const supportedLanguageNames:Map<string, string> = this.dtc.getSupportedLanguageNames();
    const lang:string = settings.language$.value;
    const langName:string = supportedLanguageNames.get(lang)!;

    this.txtLanguageName = this.theScene.add.text(230, 320, langName, {
        fontFamily: this.theScene.strFontFamily,
        fontSize: '20px',
        color: '#5c5050a1',
    }).setOrigin(0.0, 0.5).setDepth(100);

    for (let i = 0; i < supportedLanguageCodes.length; i++) {
      const pos:{x:number, y:number} = {
        x: startPos.x + (i % 3) * colSpace,
        y: startPos.y + Math.floor(i / 3) * (rowSpace + 20),
      };

      const languageCode:string = supportedLanguageCodes[i];
      const languageName:string = supportedLanguageNames.get(languageCode)!;

      let fontSize:string = '15px';
      let fontColor:string = '#00000085';

      let posPinpoint:{x:number, y:number} = { x:pos.x - 9, y:pos.y - 10 };

      if(settings.language$.value == languageCode) {
        this.pinpoint = this.theScene.add.sprite(posPinpoint.x, posPinpoint.y, 'pinpoint').setInteractive().setDepth(100);
        this.pinpoint.setOrigin(0.5, 0.5);
        this.pinpoint.setScale(0.7)
        fontSize = '16px';
        fontColor = '#302b2bff';
      }

      let txt:Phaser.GameObjects.Text = this.theScene.add.text(pos.x, pos.y, languageName, {
        fontFamily: this.theScene.strFontFamily,
        fontSize: fontSize,
        align: 'left',
        color: fontColor,
      }).setDepth(100);
      txt.setOrigin(0.0, 1.0);
      txt.setInteractive();
      this.txtLanguages.push(txt);

      txt.on('pointerdown', () => {
      this.theScene.playSound('soundGlossyClick');
      this.theScene.tweens.add({
        targets: txt,
        scale: 1.2,
        duration: 100,
        yoyo: true, // Return to normal size
        ease: 'Power1', // Smooth easing effect
        onComplete: () => {
          this.txtLanguageName.setText(languageName);
          settings.setLanguage(languageCode);
          this.theScene.changeLanguage(languageCode);
          this.applyLanguageToSettings(languageCode, i, posPinpoint);
        },
      });
    });
    }

  }

  private applyLanguageToSettings(lang:string, idxLang:number, posPinpoint:{x:number, y:number}): void {
    this.theScene.changeLanguage(lang).subscribe({
          next: () => {
              this.pinpoint.x = posPinpoint.x;
              this.pinpoint.y = posPinpoint.y;

              this.txtSoundTitle.setText(this.theScene.translateMe('SETTINGS.SOUND'));
              this.txtBackgroundMusicTitle.setText(this.theScene.translateMe('SETTINGS.BACKGROUND_MUSIC'));
              this.txtLanguageTitle.setText(this.theScene.translateMe('SETTINGS.LANGUAGE'));
              this.buttonClose.setText(this.theScene.translateMe('BUTTONS.CLOSE'));
              this.buttonCloseShadow.setText(this.theScene.translateMe('BUTTONS.CLOSE'));

              for(let i:number = 0; i < this.txtLanguages.length; i++) {
                if(i == idxLang) {
                  this.txtLanguages[i].setColor('#302b2bff');
                  this.txtLanguages[i].setFontSize('16px');
                } else {
                  this.txtLanguages[i].setColor('#00000085');
                  this.txtLanguages[i].setFontSize('15px');
                }
              }

          },
          error: (err) => {
              console.error('Failed to load language', err);
          }
      });
  }

  private hideButtonReplay() {
    this.buttonReplay.setVisible(false);
  }

  private closeDecree(): void {
   this.txtDecree.setText('');
   this.txtDecree.setAlpha(0);
   this.imgOracle.setAlpha(0);
   this.imgOracle.setVisible(false);
   this.imgOrnament.setVisible(false);
   this.imgDecreeUp.setVisible(false);
   this.buttonClose.setText('');  
   this.buttonCloseShadow.setText('');  
   this.buttonClose.setVisible(false);
   this.buttonCloseShadow.setVisible(false);
   this.theScene.children.remove(this.buttonClose);
    this.theScene.children.remove(this.buttonCloseShadow);

  if(this.buttonHomePage)
    this.theScene.children.remove(this.buttonHomePage);
  if(this.buttonShare)
    this.theScene.children.remove(this.buttonShare);
  if(this.buttonReplay)
    this.theScene.children.remove(this.buttonReplay);

   this.theScene.tweens.add({
      targets: this.imgDecreePaper,
      scaleY: 0.05, 
      duration: 400, 
      ease: 'Sine.easeInOut',
      repeat: 0, 
      onComplete: () => {
         setTimeout(() => {
            this.theScene.isDecreeVisible = false;
            this.imgDecreeUp.setVisible(false);
            this.imgDecreeDown.setVisible(false);
            this.imgDecreePaper.setVisible(false);
            this.theScene.board.dice.displayToolTip(); 
        }, 300);
     }
   });

   this.theScene.tweens.add({
      targets: this.imgDecreeDown,
      y: this.imgDecreeUp.y + this.imgDecreeUp.height + 5, 
      duration: 400, 
      ease: 'Sine.easeInOut',
      repeat: 0, 
   });
  }

  public async shareGame() {
    let title = this.theScene.translateMe('SHARE.TITLE');
    let text = this.theScene.translateMe('SHARE.TEXT') + ' :)';
    let url = 'https://apps.apple.com/app/id6753584068'; // Your App Store URL

    try {
        await Share.share({
            title: title,
            text: text,
            url: url,
            dialogTitle: 'Share with friends', // Android only
        });
    } catch (error) {
        console.error('Error sharing:', error);
    }
  }

  public async openHomepage() {
    const urlHomepage = 'https://bilgin.esme.org/BitsAndBytes/DiceToMidnight';
    await Browser.open({ url: urlHomepage });
  }
}
