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

  it('enforces 5 ads/day limit and progressive cooldowns of 1, 3, 5, and 7 minutes', () => {
    // 1. Initial state: 0 watched, 0 cooldown
    let adStatus = chipBankroll.getRewardedAdStatus();
    expect(adStatus.canWatch).toBe(true);
    expect(adStatus.remainingToday).toBe(MAX_DAILY_REWARDED_ADS);
    expect(adStatus.cooldownRemainingSeconds).toBe(0);
    expect(adStatus.reason).toBe('READY');

    let currentVirtualTime = 1000000;
    vi.spyOn(Date, 'now').mockImplementation(() => currentVirtualTime);

    // 2. Watch 1st ad -> Cooldown tier 1: 1 minute (60s)
    expect(chipBankroll.recordRewardedAdWatch()).toBe(true);
    adStatus = chipBankroll.getRewardedAdStatus();
    expect(adStatus.canWatch).toBe(false);
    expect(adStatus.remainingToday).toBe(4);
    expect(adStatus.cooldownRemainingSeconds).toBe(60);
    expect(adStatus.reason).toBe('COOLDOWN');

    // Advance 61s past 1st cooldown
    currentVirtualTime += 61000;
    adStatus = chipBankroll.getRewardedAdStatus();
    expect(adStatus.canWatch).toBe(true);
    expect(adStatus.reason).toBe('READY');

    // 3. Watch 2nd ad -> Cooldown tier 2: 3 minutes (180s)
    expect(chipBankroll.recordRewardedAdWatch()).toBe(true);
    adStatus = chipBankroll.getRewardedAdStatus();
    expect(adStatus.canWatch).toBe(false);
    expect(adStatus.remainingToday).toBe(3);
    expect(adStatus.cooldownRemainingSeconds).toBe(180);
    expect(adStatus.reason).toBe('COOLDOWN');

    // Advance 181s past 2nd cooldown
    currentVirtualTime += 181000;
    adStatus = chipBankroll.getRewardedAdStatus();
    expect(adStatus.canWatch).toBe(true);
    expect(adStatus.reason).toBe('READY');

    // 4. Watch 3rd ad -> Cooldown tier 3: 5 minutes (300s)
    expect(chipBankroll.recordRewardedAdWatch()).toBe(true);
    adStatus = chipBankroll.getRewardedAdStatus();
    expect(adStatus.canWatch).toBe(false);
    expect(adStatus.remainingToday).toBe(2);
    expect(adStatus.cooldownRemainingSeconds).toBe(300);
    expect(adStatus.reason).toBe('COOLDOWN');

    // Advance 301s past 3rd cooldown
    currentVirtualTime += 301000;
    adStatus = chipBankroll.getRewardedAdStatus();
    expect(adStatus.canWatch).toBe(true);
    expect(adStatus.reason).toBe('READY');

    // 5. Watch 4th ad -> Cooldown tier 4: 7 minutes (420s)
    expect(chipBankroll.recordRewardedAdWatch()).toBe(true);
    adStatus = chipBankroll.getRewardedAdStatus();
    expect(adStatus.canWatch).toBe(false);
    expect(adStatus.remainingToday).toBe(1);
    expect(adStatus.cooldownRemainingSeconds).toBe(420);
    expect(adStatus.reason).toBe('COOLDOWN');

    // Advance 421s past 4th cooldown
    currentVirtualTime += 421000;
    adStatus = chipBankroll.getRewardedAdStatus();
    expect(adStatus.canWatch).toBe(true);
    expect(adStatus.reason).toBe('READY');

    // 6. Watch 5th ad -> Daily limit reached (0 remaining)
    expect(chipBankroll.recordRewardedAdWatch()).toBe(true);
    adStatus = chipBankroll.getRewardedAdStatus();
    expect(adStatus.canWatch).toBe(false);
    expect(adStatus.remainingToday).toBe(0);
    expect(adStatus.reason).toBe('DAILY_LIMIT_REACHED');

    // Attempting to watch 6th ad fails
    expect(chipBankroll.recordRewardedAdWatch()).toBe(false);
  });
});
