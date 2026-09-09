import { describe, it, expect, beforeEach } from 'vitest';
import { chipBankroll, DEFAULT_STARTING_CHIPS, STREAK_REWARDS } from '../../services/chipBankroll';

describe('Chip Bankroll & Daily Reward Economy', () => {
  beforeEach(() => {
    chipBankroll.resetForTests();
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
});
