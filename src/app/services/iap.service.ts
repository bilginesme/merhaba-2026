import { Injectable, NgZone } from '@angular/core';
import { Platform } from '@ionic/angular';
import { BehaviorSubject } from 'rxjs';
import 'cordova-plugin-purchase';

@Injectable({ providedIn: 'root' })
export class IapService {
  public static instance: IapService;
  readonly PRODUCT_ID = 'com.bilginesme.dicetomidnight.alternatereality';

  // --- Observables ---
  // Default is FALSE. We only switch to TRUE if a purchase is found.
  private proStatus = new BehaviorSubject<boolean>(false);
  public isPro$ = this.proStatus.asObservable();

  private priceStatus = new BehaviorSubject<string>('...');
  public price$ = this.priceStatus.asObservable();

  private restoreLoading = new BehaviorSubject<boolean>(false);
  public restoreInProgress$ = this.restoreLoading.asObservable();

  constructor(private platform: Platform, private zone: NgZone) {
    IapService.instance = this;
    console.log('IAP Service initialized');

    this.platform.ready().then(() => {
      if (this.platform.is('cordova') || this.platform.is('capacitor')) {
        this.initStore();
      }
    });
  }

 private initStore() {
    const { store, ProductType, Platform, LogLevel } = CdvPurchase;
    
    store.verbosity = LogLevel.DEBUG;

    store.register({
      type: ProductType.NON_CONSUMABLE,
      id: this.PRODUCT_ID,
      platform: Platform.APPLE_APPSTORE,
    });

    // --- EVENT LISTENERS ---

    // 1. Handle Errors (Corrected)
    // .error() belongs to 'store', not 'store.when()'
    store.error((err) => {
        console.error('IAP Error:', err);
        this.zone.run(() => this.restoreLoading.next(false));
    });

    // 2. Handle Approval (Client-Side Only)
    store.when().approved((transaction) => {
        console.log('Payment Approved. Unlocking content...');
        this.zone.run(() => this.proStatus.next(true));
        transaction.finish(); 
      });

    // 3. Handle Price Updates
    store.when().updated(() => {
      this.zone.run(() => this.updatePrice());
    });
    
    // Initialize
    store.initialize([Platform.APPLE_APPSTORE]).then(() => {
      this.checkOwnership();    
    });
  }

  private updatePrice() {
    const product = CdvPurchase.store.get(this.PRODUCT_ID);
    const offer = product?.getOffer();
    const priceStr = offer?.pricingPhases[0]?.price;

    if (priceStr && priceStr !== this.priceStatus.value) {
      this.priceStatus.next(priceStr);
    }
  }

  private checkOwnership() {
    // If the local store cache knows we own it, unlock immediately
    if (CdvPurchase.store.owned(this.PRODUCT_ID)) {
        console.log('User already owns this product.');
        this.zone.run(() => this.proStatus.next(true));
    }
  }

  // --- PUBLIC ACTIONS ---

  purchase() {
    const offer = CdvPurchase.store.get(this.PRODUCT_ID)?.getOffer();
    if (offer) {
        offer.order();
    } else {
        console.warn('Product not loaded or invalid');
    }
  }

  async restore() {
    this.restoreLoading.next(true);
    try {
      // This asks Apple for past receipts. 
      // If found, the 'approved' listener above triggers automatically.
      await CdvPurchase.store.restorePurchases();
    } catch (e) {
      console.warn('Restore cancelled or failed', e);
    } finally {
      this.zone.run(() => this.restoreLoading.next(false));
    }
  }
}