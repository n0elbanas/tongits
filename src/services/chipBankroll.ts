/**
 * Persistent chip bankroll and daily reward economy manager.
 * Stores virtual chip balances and daily streak claims safely in localStorage with fallback.
 */

const CHIPS_STORAGE_KEY = 'tongits_player_chips';
const LAST_DAILY_CLAIM_KEY = 'tongits_last_daily_claim';
const STREAK_KEY = 'tongits_login_streak';
export const DEFAULT_STARTING_CHIPS = 300;

export const STREAK_REWARDS = [100, 150, 200, 250, 300, 400, 500];

export interface DailyRewardStatus {
  canClaim: boolean;
  streak: number; // 1-7
  rewardAmount: number;
  hoursUntilNextClaim: number;
}

const memoryStore: Record<string, string> = {};

function getStorage() {
  if (typeof window !== 'undefined' && window.localStorage) {
    return window.localStorage;
  }
  if (typeof globalThis !== 'undefined' && (globalThis as any).localStorage) {
    return (globalThis as any).localStorage;
  }
  return {
    getItem: (key: string) => memoryStore[key] ?? null,
    setItem: (key: string, val: string) => {
      memoryStore[key] = String(val);
    },
    removeItem: (key: string) => {
      delete memoryStore[key];
    },
    clear: () => {
      for (const k in memoryStore) delete memoryStore[k];
    },
  };
}

export const chipBankroll = {
  getChips(): number {
    const storage = getStorage();
    const stored = storage.getItem(CHIPS_STORAGE_KEY);
    if (stored === null) {
      storage.setItem(CHIPS_STORAGE_KEY, DEFAULT_STARTING_CHIPS.toString());
      return DEFAULT_STARTING_CHIPS;
    }
    const val = parseInt(stored, 10);
    return isNaN(val) ? DEFAULT_STARTING_CHIPS : Math.max(0, val);
  },

  setChips(chips: number): void {
    const storage = getStorage();
    const safe = Math.max(0, Math.floor(chips));
    storage.setItem(CHIPS_STORAGE_KEY, safe.toString());
    if (typeof window !== 'undefined' && window.dispatchEvent) {
      window.dispatchEvent(new CustomEvent('tongits_chips_updated', { detail: safe }));
    }
  },

  addChips(amount: number): number {
    const current = this.getChips();
    const updated = current + amount;
    this.setChips(updated);
    return updated;
  },

  deductChips(amount: number): boolean {
    const current = this.getChips();
    if (current < amount) return false;
    this.setChips(current - amount);
    return true;
  },

  getDailyRewardStatus(): DailyRewardStatus {
    const storage = getStorage();
    const lastClaimStr = storage.getItem(LAST_DAILY_CLAIM_KEY);
    const streakStr = storage.getItem(STREAK_KEY);
    let streak = streakStr ? parseInt(streakStr, 10) : 1;
    if (isNaN(streak) || streak < 1 || streak > 7) streak = 1;

    if (!lastClaimStr) {
      return {
        canClaim: true,
        streak: 1,
        rewardAmount: STREAK_REWARDS[0],
        hoursUntilNextClaim: 0,
      };
    }

    const lastClaimDate = new Date(parseInt(lastClaimStr, 10));
    const now = new Date();
    const diffMs = now.getTime() - lastClaimDate.getTime();
    const diffHours = diffMs / (1000 * 60 * 60);

    // If less than 20 hours have passed since last claim, cannot claim yet
    if (diffHours < 20) {
      return {
        canClaim: false,
        streak,
        rewardAmount: STREAK_REWARDS[streak - 1],
        hoursUntilNextClaim: Math.max(1, Math.ceil(20 - diffHours)),
      };
    }

    // If more than 48 hours have passed, streak resets to 1
    let nextStreak = streak;
    if (diffHours > 48) {
      nextStreak = 1;
    } else {
      nextStreak = (streak % 7) + 1;
    }

    return {
      canClaim: true,
      streak: nextStreak,
      rewardAmount: STREAK_REWARDS[nextStreak - 1],
      hoursUntilNextClaim: 0,
    };
  },

  claimDailyReward(): { success: boolean; amount: number; streak: number } {
    const storage = getStorage();
    const status = this.getDailyRewardStatus();
    if (!status.canClaim) {
      return { success: false, amount: 0, streak: status.streak };
    }

    const reward = status.rewardAmount;
    this.addChips(reward);
    storage.setItem(LAST_DAILY_CLAIM_KEY, Date.now().toString());
    storage.setItem(STREAK_KEY, status.streak.toString());
    if (typeof window !== 'undefined' && window.dispatchEvent) {
      window.dispatchEvent(
        new CustomEvent('tongits_daily_reward_claimed', {
          detail: { amount: reward, streak: status.streak },
        })
      );
    }

    return { success: true, amount: reward, streak: status.streak };
  },

  resetForTests(): void {
    const storage = getStorage();
    storage.removeItem(CHIPS_STORAGE_KEY);
    storage.removeItem(LAST_DAILY_CLAIM_KEY);
    storage.removeItem(STREAK_KEY);
  },
};
