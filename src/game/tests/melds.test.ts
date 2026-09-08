import { describe, it, expect } from 'vitest';
import { createCard } from '../engine/cards';
import {
  isValidSet,
  isValidRun,
  canSapaw,
  findMeldsWithTargetCard,
  calculateDeadwood,
  Meld,
} from '../engine/melds';

describe('Meld Detection and Validation', () => {
  describe('Sets', () => {
    it('accepts valid 3-card and 4-card sets with distinct suits', () => {
      const set3 = [
        createCard('hearts', '7'),
        createCard('spades', '7'),
        createCard('diamonds', '7'),
      ];
      expect(isValidSet(set3)).toBe(true);

      const set4 = [
        createCard('hearts', 'K'),
        createCard('spades', 'K'),
        createCard('diamonds', 'K'),
        createCard('clubs', 'K'),
      ];
      expect(isValidSet(set4)).toBe(true);
    });

    it('rejects sets with duplicate suits or invalid card count', () => {
      const duplicateSuits = [
        createCard('hearts', '7'),
        createCard('hearts', '7'),
        createCard('diamonds', '7'),
      ];
      expect(isValidSet(duplicateSuits)).toBe(false);

      const twoCards = [
        createCard('hearts', '7'),
        createCard('diamonds', '7'),
      ];
      expect(isValidSet(twoCards)).toBe(false);

      const mixedRanks = [
        createCard('hearts', '7'),
        createCard('spades', '7'),
        createCard('diamonds', '8'),
      ];
      expect(isValidSet(mixedRanks)).toBe(false);
    });
  });

  describe('Runs', () => {
    it('accepts valid sequential runs with identical suits (Ace is Low: A-2-3)', () => {
      const a23 = [
        createCard('hearts', 'A'),
        createCard('hearts', '2'),
        createCard('hearts', '3'),
      ];
      expect(isValidRun(a23)).toBe(true);

      const longRun = [
        createCard('spades', '8'),
        createCard('spades', '9'),
        createCard('spades', '10'),
        createCard('spades', 'J'),
      ];
      expect(isValidRun(longRun)).toBe(true);
    });

    it('strictly rejects Q-K-A and wrapping runs (Ace cannot follow King)', () => {
      const qka = [
        createCard('hearts', 'Q'),
        createCard('hearts', 'K'),
        createCard('hearts', 'A'),
      ];
      expect(isValidRun(qka)).toBe(false);

      const ka2 = [
        createCard('clubs', 'K'),
        createCard('clubs', 'A'),
        createCard('clubs', '2'),
      ];
      expect(isValidRun(ka2)).toBe(false);
    });

    it('rejects runs with gaps or mixed suits', () => {
      const gapRun = [
        createCard('hearts', '3'),
        createCard('hearts', '4'),
        createCard('hearts', '6'),
      ];
      expect(isValidRun(gapRun)).toBe(false);

      const mixedSuitRun = [
        createCard('hearts', '3'),
        createCard('spades', '4'),
        createCard('hearts', '5'),
      ];
      expect(isValidRun(mixedSuitRun)).toBe(false);
    });
  });

  describe('Sapaw (Lay-off)', () => {
    it('allows valid Sapaw on Sets up to 4 cards', () => {
      const meld: Meld = {
        id: 'm1',
        type: 'set',
        cards: [
          createCard('hearts', '8'),
          createCard('spades', '8'),
          createCard('diamonds', '8'),
        ],
        ownerId: 'p1',
      };

      const validCard = createCard('clubs', '8');
      expect(canSapaw(validCard, meld)).toBe(true);

      const duplicateSuitCard = createCard('hearts', '8');
      expect(canSapaw(duplicateSuitCard, meld)).toBe(false);

      const wrongRankCard = createCard('clubs', '9');
      expect(canSapaw(wrongRankCard, meld)).toBe(false);
    });

    it('allows valid Sapaw on Runs (extending low or high, Ace is low)', () => {
      const runMeld: Meld = {
        id: 'm2',
        type: 'run',
        cards: [
          createCard('hearts', '4'),
          createCard('hearts', '5'),
          createCard('hearts', '6'),
        ],
        ownerId: 'p1',
      };

      expect(canSapaw(createCard('hearts', '3'), runMeld)).toBe(true);
      expect(canSapaw(createCard('hearts', '7'), runMeld)).toBe(true);
      expect(canSapaw(createCard('spades', '3'), runMeld)).toBe(false);
      expect(canSapaw(createCard('hearts', '9'), runMeld)).toBe(false);
    });
  });

  describe('Discard Pickup Matching', () => {
    it('finds valid melds when discard card completes a set or run', () => {
      const hand = [
        createCard('spades', '7'),
        createCard('diamonds', '7'),
        createCard('hearts', '2'),
        createCard('hearts', '3'),
      ];

      const discardSetCard = createCard('hearts', '7');
      const meldsSet = findMeldsWithTargetCard(hand, discardSetCard);
      expect(meldsSet.length).toBeGreaterThan(0);
      expect(isValidSet(meldsSet[0])).toBe(true);

      const discardRunCard = createCard('hearts', '4');
      const meldsRun = findMeldsWithTargetCard(hand, discardRunCard);
      expect(meldsRun.length).toBeGreaterThan(0);
      expect(isValidRun(meldsRun[0])).toBe(true);

      const uselessDiscard = createCard('clubs', 'K');
      const meldsNone = findMeldsWithTargetCard(hand, uselessDiscard);
      expect(meldsNone.length).toBe(0);
    });
  });

  describe('Deadwood Points', () => {
    it('sums values correctly (A=1, 2-10=face, J/Q/K=10)', () => {
      const cards = [
        createCard('hearts', 'A'), // 1
        createCard('spades', '5'),  // 5
        createCard('diamonds', '10'), // 10
        createCard('clubs', 'K'),   // 10
      ];
      expect(calculateDeadwood(cards)).toBe(1 + 5 + 10 + 10);
    });
  });
});
