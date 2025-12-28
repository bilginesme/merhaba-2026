import { Component, OnInit } from '@angular/core';
import Phaser from 'phaser';
import { GameScene } from './game.scene';
import { ShopScene } from './shop.scene'; 
import { TranslateService } from '@ngx-translate/core';
import { Settings } from '../services/settings';
import { inject } from '@angular/core'; 
import { IapService } from '../services/iap.service';
import { ModeChoosingScene } from './mode-choosing.scene';

@Component({
  selector: 'app-game',
  templateUrl: './game.page.html',
  styleUrls: ['./game.page.scss'],
  standalone: false,
})
export class GamePage implements OnInit {
  phaserGame!: Phaser.Game;
  resizeTimeout: any;  
  private iap = inject(IapService);

  constructor(
    private translate: TranslateService, 
    public settings: Settings) { 
    }

  ngOnInit() {
  }

  ngAfterViewInit(): void {
      const lang = this.settings.language$.value;
      this.translate.use(lang).subscribe(() => {
        
        // Delay so Ionic finishes layout inside WebView
        setTimeout(() => {
          const initialWidth = window.innerWidth; 
          const initialHeight = window.innerHeight;  
        
          const config: Phaser.Types.Core.GameConfig = { 
            type: Phaser.AUTO, 
            parent: 'phaser-container', 
            backgroundColor: '#FF0000', 
            
            // --- Crucial addition for initial size --- 
            width: initialWidth, height: 
            initialHeight, // ---------------------------------------- 
            
            scale: { 
              mode: Phaser.Scale.FIT, // This maintains aspect ratio (letterboxing if needed) 
              autoCenter: Phaser.Scale.CENTER_BOTH, // Define a reference size for your game world 
              //height: 800,    //1280 
              height: 974,
              width: 450,     //720
            }, 
            scene: [GameScene, ShopScene, ModeChoosingScene], 
            render: { 
              antialiasGL: true,  
              antialias: true, 
              pixelArt: false, 
            }, 
            callbacks: {
              postBoot: (game) => {
                // KEY STEP: Put the Angular Service into the Phaser Registry
                game.registry.set('translateService', this.translate);
                game.registry.set('settings', this.settings);
                game.registry.set('iap', this.iap);
              }
            }
          };
      
          const game = new Phaser.Game(config);
        
          game.scale.on('resize', (gameSize: Phaser.Structs.Size, baseSize: Phaser.Structs.Size) => { 
            // This event fires when the browser window/container is resized. 
            // Use this to update the camera or scene elements if necessary. 
            // Example: If you have a specific UI element in your scene, you might move it:
            // this.cameras.main.setViewport(0, 0, gameSize.width, gameSize.height); 
            });
        }, 500);

      });
      
  }
  
}
