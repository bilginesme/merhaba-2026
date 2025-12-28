import { Component } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Settings } from './services/settings';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  standalone: false,
})

export class AppComponent {
  constructor(private translate: TranslateService, public settings: Settings) {
    // 1. Always set fallback first (synchronous)
    translate.setFallbackLang('en'); 

    // 2. Subscribe to your language stream
    // This will fire immediately with the default, AND again when storage loads,
    // AND again when the user changes settings.
    this.settings.language$.subscribe(lang => {
      if (lang) {
        translate.use(lang);
      }
    });
  }
}