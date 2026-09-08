import { describe, it, expect } from 'vitest';
import { createCard } from '../engine/cards';
import { calculateRoundScores } from '../engine/scoring';

describe('Scoring Engine', () => {
  it('calculates canonical Pagat scoring: base win + ace bonuses + sunog penalties', () => {
    const players = [
      {
        id: 'p1', // Winner (opened, 2 Aces)
        hand: [createCard('hearts', 'A'), createCard('spades', 'A')],
        exposedMelds: [
          {
            id: 'm1',
            type: 'run' as const,
            cards: [createCard('diamonds', 'A'), createCard('diamonds', '2'), createCard('diamonds', '3')],
            ownerId: 'p1',
          },
        ],
        opened: true,
        burned: false,
        winStreak: 0,
      },
      {
        id: 'p2', // Loser 1 (opened, deadwood 15)
        hand: [createCard('hearts', '10'), createCard('spades', '5')],
        exposedMelds: [
          {
            id: 'm2',
            type: 'set' as const,
            cards: [createCard('hearts', '8'), createCard('spades', '8'), createCard('diamonds', '8')],
            ownerId: 'p2',
          },
        ],
        opened: true,
        burned: false,
        winStreak: 0,
      },
      {
        id: 'p3', // Loser 2 (UNOPENED = SUNOG)
        hand: [createCard('clubs', 'K'), createCard('clubs', 'Q')],
        exposedMelds: [],
        opened: false,
        burned: true,
        winStreak: 0,
      },
    ];

    const result = calculateRoundScores({
      winnerId: 'p1',
      winReason: 'TONGITS',
      players,
      currentSidePot: 6,
    });

    // Winner has 3 Aces (2 in hand + 1 in meld) = 3 Ace bonus per loser
    // Tongits win = 3 chips base per loser
    // Loser p2 pays: 3 (tongits) + 3 (aces) = 6 chips
    // Loser p3 (Sunog) pays: 3 (tongits) + 3 (aces) + 1 (sunog penalty) = 7 chips
    // Total won by winner = 6 + 7 = 13 chips (plus not winning side pot yet because winStreak was 0)
    expect(result.playerBreakdowns['p2'].chipDelta).toBe(-6);
    expect(result.playerBreakdowns['p3'].chipDelta).toBe(-7);
    expect(result.playerBreakdowns['p3'].isSunog).toBe(true);
    expect(result.playerBreakdowns['p1'].chipDelta).toBe(13);
  });

  it('awards side pot when a player achieves their 2nd consecutive win', () => {
    const players = [
      {
        id: 'p1',
        hand: [],
        exposedMelds: [],
        opened: true,
        burned: false,
        winStreak: 1, // Already won 1 game in a row!
      },
      {
        id: 'p2',
        hand: [createCard('hearts', '10')],
        exposedMelds: [],
        opened: true,
        burned: false,
        winStreak: 0,
      },
      {
        id: 'p3',
        hand: [createCard('clubs', '10')],
        exposedMelds: [],
        opened: true,
        burned: false,
        winStreak: 0,
      },
    ];

    const result = calculateRoundScores({
      winnerId: 'p1',
      winReason: 'TONGITS',
      players,
      currentSidePot: 10,
    });

    expect(result.sidePotWon).toBe(true);
    expect(result.sidePotAmount).toBe(10);
    expect(result.newSidePot).toBe(0);
    // Delta includes the 10 side pot chips
    expect(result.playerBreakdowns['p1'].chipDelta).toBeGreaterThanOrEqual(16);
  });
});
