import Phaser from 'phaser';
import EmbossButton, { EMBOSS_BUTTON_EVENTS } from './sprites/EmbossButton';
import { TranslateService } from '@ngx-translate/core';
import { DTC } from '../DTC';
import { Settings } from '../services/settings';
import { GameModes } from './enums';
import { IapService } from '../services/iap.service';

export class ModeChoosingScene extends Phaser.Scene {
  private dtc:DTC = new DTC();
  private translate!: TranslateService;
  private settings!: Settings;
  private txtTitle!:Phaser.GameObjects.Text;
  private txtDesciption!:Phaser.GameObjects.Text;
  private buttonExit!: EmbossButton;
  private buttonPurchase!: EmbossButton;
  private buttonRestorePurchases!: EmbossButton;
  private spinner!: Phaser.GameObjects.Sprite;
  private txtRestoreStatus!: Phaser.GameObjects.Text;
  private strPrice:string = '';
  private isIAPPurchased:boolean = false;
  private isSoundOn:boolean = false;
  public isOpenedYet:boolean = false;
  private soundBonus:any;

  private textGamemodeNormal: Phaser.GameObjects.Text[] = [];
  private textGamemodeShadow: Phaser.GameObjects.Text[] = [];
  private checkboxes: Phaser.GameObjects.Sprite[] = [];

  private isUnlocking:boolean = false; // For the spinner
  private isOwned:boolean = false;     // To track status locally

  constructor() {
    // The key is how you refer to this scene later
    super({ key: 'ModeChoosingScene' });
  }

  create() {
    this.translate = this.registry.get('translateService');
    this.settings = this.registry.get('settings');
    
    this.soundBonus = this.sound.add('soundBonus', {loop: false,  volume: 0.5});

    this.isIAPPurchased = this.settings.isIAPPurchased$.value;
    this.isSoundOn = this.settings.soundEnabled$.value;

    this.add.image(0, 0, 'bg').setOrigin(0, 0);
    this.add.image(this.scale.width / 2, this.scale.height / 2, 'shop-bg').setOrigin(0.5);
    
    this.txtTitle = this.add.text(this.scale.width / 2, 110, '', {
      fontSize: '20px',
      fontFamily: this.dtc.strFontFamily,
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    this.txtDesciption = this.add.text(this.scale.width / 2, 190, '', {
      fontSize: '22px',
      fontFamily: this.dtc.strFontFamily,
      color: '#300404ff',
      wordWrap: { width: 380 },
      align: 'center'
    }).setOrigin(0.5, 0);

    if(!this.isIAPPurchased) {
      this.buttonPurchase = new EmbossButton('UNLOCK_GAME', this, this.scale.width / 2, 680, '', 20, this.dtc.strFontFamily, this.isSoundOn);
      this.buttonRestorePurchases = new EmbossButton('RESTORE_PURCHASES', this, this.scale.width / 2, 750, '', 20, this.dtc.strFontFamily, this.isSoundOn);
    }

    this.spinner = this.add.sprite(this.scale.width / 2 + 150, 750, 'spinner-anim').setScale(0.5);
    this.anims.create({
      key: 'spin',
      frames: this.anims.generateFrameNames('spinner-anim', 
        { prefix: '', start: 1, end: 12, zeroPad: 2, suffix: '.png' }),
      frameRate: 7,
      repeat: -1  });
    this.spinner.play('spin');
    this.spinner.setVisible(false);

    this.txtRestoreStatus = this.add.text(this.scale.width / 2, 780, '', 
    { 
      fontSize: '16px', 
      fontFamily: this.dtc.strFontFamily, 
      color: '#3004047b'
    }).setOrigin(0.5, 0.5).setVisible(false);
    
    this.buttonExit = new EmbossButton('EXIT_FROM_GAME_MODE_SCENE', this, this.scale.width / 2, this.scale.height - 130, '', 30, this.dtc.strFontFamily, this.isSoundOn);

    this.events.on(EMBOSS_BUTTON_EVENTS.EMBOSS_BUTTON_CLICKED, (strResult:String) => {
      if(strResult == 'EXIT_FROM_GAME_MODE_SCENE') {
        this.closeMe();
      }
      else if(strResult == 'UNLOCK_GAME') {
        this.handleBuy();
      }
      else if(strResult == 'RESTORE_PURCHASES') {
        this.restorePurchases();
      }
    }, this);

    this.createGameModes();
    this.updateTexts();
    this.isOpenedYet = true;
    
      // 2. Setup the "Wake" listener
    this.events.on('wake', () => {
        //this.resetScreen();
    });

    // Check current status immediately
    this.updateUI();

   console.log("Subscribing to price updates");
    if (IapService.instance) { 
      IapService.instance.price$.subscribe((priceText) => 
        { 
          console.log("Price updated: " + priceText);
          this.strPrice = priceText;
          this.updateTexts();
        }); 
    }

    console.log("Subscribing to purchase");
    if (IapService.instance) {
      IapService.instance.isPro$.subscribe((status) => {
        this.isOwned = status;    // may be TRUE or FALSE
        if (status == true) {
          console.log("Status changed to UNLOCKED!");
          this.unlockIAP(); // Unlock your UI here
        }
        // DO NOT put an 'else' here to log failure. 
        // 'false' is just the normal starting state, not an error. 
      });
    }

    console.log("Subscribing to restore");
    if (IapService.instance) {
      IapService.instance.restoreInProgress$.subscribe((loading) => {
        this.isUnlocking = loading;
        
        // DO NOT put an 'else' here to log failure. 
        // 'false' is just the normal starting state, not an error.
      });
    }
  }

  private createGameModes(): void {
    this.textGamemodeNormal = [];
    this.textGamemodeShadow = [];

    let posStartX:number = 120;
    let posStartY:number = 350;
    let heightRow:number = 54;

    let count:number = 0;

    (this.getEnumOptions(GameModes)).forEach(element => {
      let strText:string = this.translate.instant('GAME_MODES.' + element.name + '.TITLE'); 
      let posX:number = posStartX;
      let posY:number = posStartY + heightRow * count;

      let txtShadow = this.add.text(posX, posY, strText, {
            fontFamily: this.dtc.strFontFamily,
            fontSize: '20px',
            fontStyle: '900',
            color: '#5e5c0483',
            align: 'left'
          }).setInteractive().setDepth(100);
        txtShadow.setOrigin(0, 0.5);
        txtShadow.setVisible(true);

      let txtNnormal = this.add.text(posX, posY, strText, {
            fontFamily: this.dtc.strFontFamily,
            fontSize: '20px',
            fontStyle: '900',
            color: '#300404ff',
            align: 'left'
          }).setInteractive().setDepth(100);
        txtNnormal.setOrigin(0, 0.5);
        txtNnormal.setVisible(true);

        let checkbox:Phaser.GameObjects.Sprite = this.add.sprite(posX -26, posY, 'check-off').setInteractive().setScale(0.9);
        
        this.checkboxes.push(checkbox);
        this.textGamemodeNormal.push(txtNnormal);  
        this.textGamemodeShadow.push(txtShadow);  

        if(count == 0 || this.isIAPPurchased) {
          txtNnormal.on('pointerdown', () => {
            //this.theScene.playSound('soundGlossyClick');
            this.tweens.add({
              targets: txtNnormal,
              scaleX: 1.2,
              scaleY: 1.2,
              duration: 100, // Duration of the scaling up
              yoyo: true, // Return to normal size
              ease: 'Power1', // Smooth easing effect
              onComplete: () => { 
                  this.settings.setGameMode(element.value);
                  this.setTheCheckedOne();
                  //this.closeMe();
                  //this.soundGlossyClick.play();
              } 
            });
              this.tweens.add({
              targets: txtShadow,
              scaleX: 1.2,
              scaleY: 1.2,
              duration: 100, // Duration of the scaling up
              yoyo: true, // Return to normal size
              ease: 'Power1', // Smooth easing effect
              onComplete: () => { } 
            });
        });

        }
        
        if(count > 0 && !this.isIAPPurchased) {
          let posxLock:number = posX + 275;
          this.add.image(posxLock, posY, 'lock').setScale(0.8);
        }

        count++;
    });

    this.setTheCheckedOne();
  }

  private setTheCheckedOne(): void {
    let gameMode:number = this.settings.gameMode$.value;
    let idxGamemode:number = gameMode - 1;

    for(let i:number = 0; i < this.checkboxes.length; i++) {
      this.checkboxes[i].setTexture('check-off');
      this.checkboxes[idxGamemode].setTexture('check-on');
    }
  }

  private closeMe():void {
     let gameMode:number = this.settings.gameMode$.value;
      this.scene.sleep();
      this.scene.resume('GameScene', { mode: gameMode }); 
  }

  private handleBuy() {
    console.log('Making a purchase');
    IapService.instance.purchase();
  }

  async restorePurchases() {
    this.spinner.setVisible(true);
    await new Promise(resolve => setTimeout(resolve, 3000));

    // 1. Start the process (Spinner shows up automatically via subscription above)
    await IapService.instance.restore();
    
    // 2. The line below runs ONLY after Apple/Google finishes responding.

    this.spinner.setVisible(false);
    this.txtRestoreStatus.setVisible(true);

    // 3. Check the result
    if (this.isOwned) {
      // Success is already handled by the subscription in ngOnInit
      console.log("Restore successful"); 
      this.txtRestoreStatus.setText(this.translate.instant('MESSAGES.RESTORE_SUCCESS'));
    } else {
      // FAILURE / NOTHING FOUND
      console.log("No previous purchases found");
      this.txtRestoreStatus.setText(this.translate.instant('MESSAGES.RESTORE_FAILURE'));
    }
  }

  private updateUI() {}

  private getEnumOptions(enumObj: any) {
    return Object.keys(enumObj)
        .filter(key => isNaN(Number(key))) // Keep only string keys
        .map(key => ({
            name: key,
            value: enumObj[key]
        }));
  }

  private updateGameModesTexts(): void {
    let count:number = 0;

  (this.getEnumOptions(GameModes)).forEach(element => {
      let strText:string = this.translate.instant('GAME_MODES.' + element.name + '.TITLE'); 

      let txtShadow = this.textGamemodeShadow[count];
      let txtNormal = this.textGamemodeNormal[count];

      if(txtShadow)
        txtShadow.setText(strText);
      
      if(txtNormal)
        txtNormal.setText(strText);

      count++;
    });
  }

  public updateTexts(): void {
    const strTitle:string = this.translate.instant('MODE_CHOOSING_SCREEN.TITLE');
    const strDescription:string = this.translate.instant('MODE_CHOOSING_SCREEN.DESCRIPTION');
    const strUnlock:string = this.translate.instant('MODE_CHOOSING_SCREEN.UNLOCK') + ' - ' + this.strPrice;
    const strRestorePurchases:string = this.translate.instant('MODE_CHOOSING_SCREEN.RESTORE_PURCHASES');
    const strButtonExitText:string = this.translate.instant('MODE_CHOOSING_SCREEN.BACK_TO_GAME');

    this.txtTitle.setText(strTitle);
    this.txtDesciption.setText(strDescription);
    this.buttonExit.updateText(strButtonExitText); 

    if(this.buttonPurchase)
      this.buttonPurchase.updateText(strUnlock);
    
    if(this.buttonRestorePurchases)
      this.buttonRestorePurchases.updateText(strRestorePurchases);

    if(this.settings.isIAPPurchased$.value) {
      if(this.buttonPurchase)
        this.buttonPurchase.setVisible(false);
      if(this.buttonRestorePurchases)
        this.buttonRestorePurchases.setVisible(false);
    }

    this.updateGameModesTexts();
  }

  public unlockIAP(): void {
    this.soundBonus.play();
    this.settings.setIAPPurchased(true);
    this.updateTexts();
 
    [...this.children.getChildren()].forEach(element => {
      const sp = element as Phaser.GameObjects.Image;

      if (sp.texture && sp.texture.key && sp.texture.key.includes('lock')) {
        sp.destroy();
      }
    });

    if(this.buttonPurchase) {
      this.buttonPurchase.hide();
    }  
      
    if(this.buttonRestorePurchases) {
      this.buttonRestorePurchases.hide();
      this.spinner.setVisible(false);
      this.txtRestoreStatus.setVisible(false);
    }

    let count:number = 0;
    (this.getEnumOptions(GameModes)).forEach(element => {
        if(count != 0) {
          this.textGamemodeNormal[count].setInteractive();
          this.textGamemodeShadow[count].setInteractive();

          this.textGamemodeNormal[count].on('pointerdown', () => {
            //this.theScene.playSound('soundGlossyClick');
            this.tweens.add({
              targets: this.textGamemodeNormal[count],
              scaleX: 1.2,
              scaleY: 1.2,
              duration: 100, // Duration of the scaling up
              yoyo: true, // Return to normal size
              ease: 'Power1', // Smooth easing effect
              onComplete: () => { 
                  this.settings.setGameMode(element.value);
                  this.setTheCheckedOne();
                  //this.closeMe();
                  //this.soundGlossyClick.play();
              } 
            });

            this.tweens.add({
              targets: this.textGamemodeShadow[count],
              scaleX: 1.2,
              scaleY: 1.2,
              duration: 100, // Duration of the scaling up
              yoyo: true, // Return to normal size
              ease: 'Power1', // Smooth easing effect
              onComplete: () => { } 
            });

          }); 
        }
          
        count++;     
    });
   
  }

  // Helper to show the alert
  async showRestoreFailedAlert() {
    // Use Ionic AlertController or standard alert
    alert("No previous purchases found for 'Unlock Your Destiny'.");
  }
}