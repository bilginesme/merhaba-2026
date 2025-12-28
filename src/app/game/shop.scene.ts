import Phaser from 'phaser';
import { IapService } from '../services/iap.service'; // Adjust path
import EmbossButton, { EMBOSS_BUTTON_EVENTS } from './sprites/EmbossButton';
import { TranslateService } from '@ngx-translate/core';
import { DTC } from '../DTC';
import { Settings } from '../services/settings';
import { GameScene } from './game.scene';

export class ShopScene extends Phaser.Scene {
  private dtc:DTC = new DTC();
  private translate!: TranslateService;
  private settings!: Settings;
  private buttonExit!: EmbossButton;
  private buttonPurchase!: EmbossButton;
  private buttonRestorePurchases!: EmbossButton;
  private spinner!: Phaser.GameObjects.Sprite;
  private txtRestoreStatus!: Phaser.GameObjects.Text;

  private strPrice:string = '';
  private isSoundOn:boolean = false;
  private txtTitle!:Phaser.GameObjects.Text;
  private txtDesciption!:Phaser.GameObjects.Text;
  public isOpenedYet:boolean = false;
  private soundBonus:any;

  private isUnlocking:boolean = false; // For the spinner
  private isOwned:boolean = false;     // To track status locally
  
  constructor() {
    // The key is how you refer to this scene later
    super({ key: 'ShopScene' });
  }

  create() {
    this.translate = this.registry.get('translateService');
    this.settings = this.registry.get('settings');
    this.isSoundOn = this.settings.soundEnabled$.value;
    this.soundBonus = this.sound.add('soundBonus', {loop: false,  volume: 0.5});
    
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

    this.add.sprite(this.scale.width / 2, 510, 'alternate-reality-sample').setOrigin(0.5).setScale(0.9);
    
    this.buttonPurchase = new EmbossButton('UNLOCK_GAME', this, this.scale.width / 2, 690, '', 20, this.dtc.strFontFamily, this.isSoundOn);
    this.buttonRestorePurchases = new EmbossButton('RESTORE_PURCHASES', this, this.scale.width / 2, 760, '', 20, this.dtc.strFontFamily, this.isSoundOn);
    this.buttonExit = new EmbossButton('EXIT_FROM_SHOP_SCENE', this, this.scale.width / 2, this.scale.height - 130, '', 30, this.dtc.strFontFamily, this.isSoundOn);

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


    this.events.on(EMBOSS_BUTTON_EVENTS.EMBOSS_BUTTON_CLICKED, (strResult:String) => {
      if(strResult == 'EXIT_FROM_SHOP_SCENE') {
        this.closeMe();
      }
      else if(strResult == 'UNLOCK_GAME') {
        this.handleBuy();
      }
      else if(strResult == 'RESTORE_PURCHASES') {
        this.restorePurchases();
      }
    }, this);

       // 2. Setup the "Wake" listener
    this.events.on('wake', () => {
        //this.resetScreen();
    });
    
    this.updateTexts();

    this.isOpenedYet = true;

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

  private closeMe():void {
      this.scene.sleep();
      this.scene.resume('GameScene'); 
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
  
  private updateUI() {
   /*
    if (IapService.instance && IapService.instance.isUnlocked) {
        this.statusText.setText('UNLOCKED!');
        this.statusText.setColor('#00ff00');
        this.buyButton.setVisible(false); // Hide buy button if owned
    }
        */
  }

  private unlockIAP() {

    this.soundBonus.play();
    this.settings.setIAPPurchased(true);
    this.updateTexts();

    if(this.buttonPurchase) {
      this.buttonPurchase.hide();
    }  

    if(this.buttonRestorePurchases) {
      this.buttonRestorePurchases.hide();
      this.spinner.setVisible(false);
      this.txtRestoreStatus.setVisible(false);
    }
 
    const theScene = this.scene.get('GameScene') as GameScene;     
    theScene.unlockIAP();

    this.closeMe();
  }

  public updateTexts(): void {
    const strTitle:string = this.translate.instant('SHOP_SCREEN.TITLE');
    const strDescription:string = this.translate.instant('SHOP_SCREEN.DESCRIPTION');
    const strUnlock:string = this.translate.instant('SHOP_SCREEN.UNLOCK') + ' - ' + this.strPrice;
    const strRestorePurchases:string = this.translate.instant('SHOP_SCREEN.RESTORE_PURCHASES');
    const strButtonExitText:string = this.translate.instant('SHOP_SCREEN.BACK_TO_GAME');

    this.txtTitle.setText(strTitle);
    this.txtDesciption.setText(strDescription);
    this.buttonPurchase.updateText(strUnlock);
    this.buttonRestorePurchases.updateText(strRestorePurchases);
    this.buttonExit.updateText(strButtonExitText); 
  }
}