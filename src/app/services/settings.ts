import { Injectable } from '@angular/core';
import { Preferences } from '@capacitor/preferences';
import { BehaviorSubject } from 'rxjs';
import { DTC } from '../DTC';

const SETTINGS_KEYS = {
  SOUND_ENABLED: 'sound_enabled',
  BACKGROUND_MUSIC_ENABLED: 'background_music_enabled', 
  IAP_PURCHASED: 'iap_purchased',
  GAME_MODE: 'game_mode', 
  LANGUAGE: 'language'
};

@Injectable({
  providedIn: 'root'
})
export class Settings {
  private dtc:DTC = new DTC();
  public soundEnabled$ = new BehaviorSubject<boolean>(true);
  public backgroundMusicEnabled$ = new BehaviorSubject<boolean>(true);
  public isIAPPurchased$ = new BehaviorSubject<boolean>(false);
  public language$ = new BehaviorSubject<string>('en');   // Initialize with a temporary default, but we will overwrite it instantly in loadSettings
  public gameMode$ = new BehaviorSubject<number>(1);

  constructor() {
    this.loadSettings();
  }

  async loadSettings() {
    //  Load Sound 
    const { value: soundVal } = await Preferences.get({ key: SETTINGS_KEYS.SOUND_ENABLED });
    if (soundVal !== null) {
      this.soundEnabled$.next(JSON.parse(soundVal));
    }

    //  Load Background Music 
    const { value: bgMusicVal } = await Preferences.get({ key: SETTINGS_KEYS.BACKGROUND_MUSIC_ENABLED });
    if (bgMusicVal !== null) {
      this.backgroundMusicEnabled$.next(JSON.parse(bgMusicVal));
    }

    //  Load IAP Purchased
    const { value: iapPurchased } = await Preferences.get({ key: SETTINGS_KEYS.IAP_PURCHASED });
    if (iapPurchased !== null) {
      this.isIAPPurchased$.next(JSON.parse(iapPurchased));
    }

    //  Load Game Mode
    const { value: gameMode } = await Preferences.get({ key: SETTINGS_KEYS.GAME_MODE });
    if (gameMode !== null) {
      this.gameMode$.next(JSON.parse(gameMode));
    }

    // Load Language
    const { value: langVal } = await Preferences.get({ key: SETTINGS_KEYS.LANGUAGE });

    if (langVal) {
      // A. User has manually chosen a language before. Use it.
      this.language$.next(langVal);
      console.log('Language settings is : ' + langVal);
    } else {
      // B. First time user. Detect device language.
      const deviceLang = this.getDeviceLanguage();
      this.language$.next(deviceLang);
      
      console.log('Settings device language : ' + deviceLang);
      // Save this detected default so we don't guess next time
      await this.setLanguage(deviceLang); 
    }
  }

  async clearAllSettings() {
    await Preferences.clear();
    console.log('All preferences wiped!');
  }

  /**
   * Detects browser/device language and normalizes it
   * e.g. "en-US" -> "en", "tr-TR" -> "tr"
   */
  private getDeviceLanguage(): string {
    // 1. Get the raw browser language (e.g., 'en-US', 'es-ES', 'tr')
    // navigator.language is supported in all modern WebViews (iOS/Android)
    const rawLang = navigator.language || 'en';

    // 2. Split by hyphen to get the primary code (e.g., 'en-US' becomes ['en', 'US'])
    const langCode = rawLang.split('-')[0]; 
    
    // 3. Check against your supported languages to be safe
    //const supportedLanguages = ['en', 'es', 'fr', 'tr']; // <--- Add your supported langs here
    const supportedLanguages = this.dtc.getSupportedLanguageCodes();

    if (supportedLanguages.includes(langCode)) {
      return langCode;
    } else {
      return 'en'; // Fallback if their device is in a language you don't support (e.g., German)
    }
  }

  async setSound(isEnabled: boolean) {
      // 1. Update State (for the app to react immediately)
      this.soundEnabled$.next(isEnabled);
      
      // 2. Persist to Disk
      await Preferences.set({
        key: SETTINGS_KEYS.SOUND_ENABLED,
        value: JSON.stringify(isEnabled) // Preferences only stores strings
      });
  }

  async setBackgroundMusic(isEnabled: boolean) {
      // 1. Update State (for the app to react immediately)
      this.backgroundMusicEnabled$.next(isEnabled);
      
      // 2. Persist to Disk
      await Preferences.set({
        key: SETTINGS_KEYS.BACKGROUND_MUSIC_ENABLED,
        value: JSON.stringify(isEnabled) // Preferences only stores strings
      });
  }

  async setIAPPurchased(isEnabled: boolean) {
      this.isIAPPurchased$.next(isEnabled);
      
      await Preferences.set({
        key: SETTINGS_KEYS.IAP_PURCHASED,
        value: JSON.stringify(isEnabled) // Preferences only stores strings
      });
  }

  async setGameMode(gameMode: number) {
      this.gameMode$.next(gameMode);
      
      await Preferences.set({
        key: SETTINGS_KEYS.GAME_MODE,
        value: JSON.stringify(gameMode) // Preferences only stores strings
      });
  }

  async setLanguage(lang: string) {
      this.language$.next(lang);
      await Preferences.set({
        key: SETTINGS_KEYS.LANGUAGE,
        value: lang
      });
  }
    
}