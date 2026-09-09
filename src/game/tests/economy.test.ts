import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  chipBankroll,
  DEFAULT_STARTING_CHIPS,
  STREAK_REWARDS,
  MAX_DAILY_REWARDED_ADS,
  AD_COOLDOWN_SECONDS,
} from '../../services/chipBankroll';

describe('Chip Bankroll & Daily Reward Economy', () => {
  beforeEach(() => {
    chipBankroll.resetForTests();
    vi.restoreAllMocks();
  });

  it('initializes with default starting chips when storage is empty', () => {
    expect(chipBankroll.getChips()).toBe(DEFAULT_STARTING_CHIPS);
  });

  it('adds and deducts chips correctly', () => {
    chipBankroll.setChips(500);
    expect(chipBankroll.getChips()).toBe(500);

    const added = chipBankroll.addChips(150);
    expect(added).toBe(650);
    expect(chipBankroll.getChips()).toBe(650);

    const deducted = chipBankroll.deductChips(200);
    expect(deducted).toBe(true);
    expect(chipBankroll.getChips()).toBe(450);

    const failedDeduct = chipBankroll.deductChips(1000);
    expect(failedDeduct).toBe(false);
    expect(chipBankroll.getChips()).toBe(450);
  });

  it('allows claiming daily reward on first visit and increments streak', () => {
    const status = chipBankroll.getDailyRewardStatus();
    expect(status.canClaim).toBe(true);
    expect(status.streak).toBe(1);
    expect(status.rewardAmount).toBe(STREAK_REWARDS[0]);

    const initialChips = chipBankroll.getChips();
    const claimResult = chipBankroll.claimDailyReward();
    expect(claimResult.success).toBe(true);
    expect(claimResult.amount).toBe(STREAK_REWARDS[0]);
    expect(chipBankroll.getChips()).toBe(initialChips + STREAK_REWARDS[0]);

    // Right after claiming, player cannot claim again immediately
    const nextStatus = chipBankroll.getDailyRewardStatus();
    expect(nextStatus.canClaim).toBe(false);
    expect(nextStatus.hoursUntilNextClaim).toBeGreaterThan(0);
  });

  it('enforces 5 ads/day limit and 60-second cooldown between watches', () => {
    // 1. Initial state
    let adStatus = chipBankroll.getRewardedAdStatus();
    expect(adStatus.canWatch).toBe(true);
    expect(adStatus.remainingToday).toBe(MAX_DAILY_REWARDED_ADS);
    expect(adStatus.cooldownRemainingSeconds).toBe(0);
    expect(adStatus.reason).toBe('READY');

    // 2. Watch 1st ad
    const success1 = chipBankroll.recordRewardedAdWatch();
    expect(success1).toBe(true);

    // Immediately in cooldown
    adStatus = chipBankroll.getRewardedAdStatus();
    expect(adStatus.canWatch).toBe(false);
    expect(adStatus.remainingToday).toBe(4);
    expect(adStatus.cooldownRemainingSeconds).toBeGreaterThan(0);
    expect(adStatus.cooldownRemainingSeconds).toBeLessThanOrEqual(AD_COOLDOWN_SECONDS);
    expect(adStatus.reason).toBe('COOLDOWN');

    // Cannot watch again during cooldown
    const rejectedDuringCooldown = chipBankroll.recordRewardedAdWatch();
    expect(rejectedDuringCooldown).toBe(false);

    // 3. Fast-forward past cooldown (simulate 61s elapsed)
    const now = Date.now();
    let currentVirtualTime = now + 61000;
    vi.spyOn(Date, 'now').mockImplementation(() => currentVirtualTime);

    adStatus = chipBankroll.getRewardedAdStatus();
    expect(adStatus.canWatch).toBe(true);
    expect(adStatus.remainingToday).toBe(4);
    expect(adStatus.cooldownRemainingSeconds).toBe(0);
    expect(adStatus.reason).toBe('READY');

    // 4. Watch remaining 4 ads with time jumps
    for (let i = 2; i <= 5; i++) {
      const watched = chipBankroll.recordRewardedAdWatch();
      expect(watched).toBe(true);
      currentVirtualTime += 61000;
    }

    // 5. Check daily limit reached
    adStatus = chipBankroll.getRewardedAdStatus();
    expect(adStatus.canWatch).toBe(false);
    expect(adStatus.remainingToday).toBe(0);
    expect(adStatus.reason).toBe('DAILY_LIMIT_REACHED');

    // Attempting to watch 6th ad fails
    const rejectedLimit = chipBankroll.recordRewardedAdWatch();
    expect(rejectedLimit).toBe(false);
  });
});
