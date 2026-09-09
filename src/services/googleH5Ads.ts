/**
 * Google AdSense for Games / H5 Games Ads (AdPlacement API) Service.
 *
 * Implements Google's official adBreak specification for rewarded ads:
 * https://developers.google.com/ad-placement/docs/rewarded-ads
 *
 * Provides production-ready SDK loading and a polished in-app fallback
 * runner when running offline, in development, or if AdSense script is blocked.
 */

declare global {
  interface Window {
    adsbygoogle?: any[];
    adBreak?: (options: any) => void;
    adConfig?: (options: any) => void;
    GOOGLE_ADSENSE_CLIENT_ID?: string;
  }
}

export interface RewardedAdOptions {
  name?: string;
  rewardAmount?: number;
  onStart?: () => void;
  onReward: (amount: number) => void;
  onDismiss?: () => void;
  onError?: (err: any) => void;
}

class GoogleH5AdsService {
  private isInitialized = false;
  private clientId: string | null = null;

  init(clientId?: string) {
    if (this.isInitialized) return;
    this.clientId = clientId || window.GOOGLE_ADSENSE_CLIENT_ID || 'ca-pub-test-tongits';

    window.adsbygoogle = window.adsbygoogle || [];
    window.adBreak =
      window.adBreak ||
      function (o: any) {
        window.adsbygoogle?.push(o);
      };

    // Attempt to load official AdSense H5 script if not already on the page
    if (typeof document !== 'undefined' && !document.querySelector('script[src*="adsbygoogle.js"]')) {
      const script = document.createElement('script');
      script.async = true;
      script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${this.clientId}`;
      script.crossOrigin = 'anonymous';
      script.setAttribute('data-ad-frequency-hint', '30s');
      script.onerror = () => {
        console.warn('[Google H5 Ads] AdSense script failed to load (ad blocker or offline). Using fallback runner.');
      };
      document.head.appendChild(script);
    }

    this.isInitialized = true;
  }

  /**
   * Request a Rewarded Video Ad via Google H5 Ads.
   * If real ad breaks are available, uses Google's AdPlacement API.
   * Otherwise, calls onFallback to trigger the interactive in-game ad modal.
   */
  requestRewardedAd(options: RewardedAdOptions, onFallback?: () => void) {
    const { name = 'free_chips', rewardAmount = 100, onStart, onReward, onDismiss, onError } = options;

    this.init();

    // Check if Google AdSense adBreak is active with real ad serving
    const hasRealAdBreak =
      typeof window !== 'undefined' &&
      typeof window.adBreak === 'function' &&
      window.adsbygoogle &&
      Array.isArray(window.adsbygoogle) &&
      (window.adsbygoogle as any).loaded === true;

    if (hasRealAdBreak) {
      try {
        let rewarded = false;
        window.adBreak!({
          type: 'reward',
          name,
          beforeAd: () => {
            onStart?.();
          },
          beforeReward: (showAdFn: () => void) => {
            showAdFn();
          },
          adViewed: () => {
            rewarded = true;
            onReward(rewardAmount);
          },
          adDismissed: () => {
            if (!rewarded) {
              onDismiss?.();
            }
          },
          adBreakDone: (placementInfo: any) => {
            if (placementInfo?.breakStatus === 'error' && onError) {
              onError(placementInfo);
            }
          },
        });
        return;
      } catch (err) {
        console.warn('[Google H5 Ads] Error executing window.adBreak, falling back to simulated ad.', err);
      }
    }

    // Fallback: Trigger custom in-app rewarded ad viewer modal
    if (onFallback) {
      onFallback();
    } else {
      // Direct reward fallback if no modal provided
      onStart?.();
      setTimeout(() => {
        onReward(rewardAmount);
      }, 3000);
    }
  }
}

export const googleH5Ads = new GoogleH5AdsService();
