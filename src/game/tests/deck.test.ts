import { describe, it, expect } from 'vitest';
import { createDeck, createCard, sortCards } from '../engine/cards';
import { shuffleDeck, dealCards } from '../engine/deck';

describe('Deck and Card Engine', () => {
  it('creates standard 52-card deck with correct values', () => {
    const deck = createDeck();
    expect(deck.length).toBe(52);

    const ids = new Set(deck.map((c) => c.id));
    expect(ids.size).toBe(52);

    // Verify Ace value is 1
    const aceOfHearts = deck.find((c) => c.rank === 'A' && c.suit === 'hearts');
    expect(aceOfHearts?.value).toBe(1);
    expect(aceOfHearts?.rankIndex).toBe(1);

    // Verify Face cards are 10
    const kingOfSpades = deck.find((c) => c.rank === 'K' && c.suit === 'spades');
    expect(kingOfSpades?.value).toBe(10);
    expect(kingOfSpades?.rankIndex).toBe(13);
  });

  it('shuffles deck without losing cards', () => {
    const deck = createDeck();
    const shuffled = shuffleDeck(deck);
    expect(shuffled.length).toBe(52);
    expect(new Set(shuffled.map((c) => c.id)).size).toBe(52);
  });

  it('deals 13 cards to dealer and 12 to the other 2 players with 15 in stock', () => {
    const deck = createDeck();
    const playerIds = ['p1', 'p2', 'p3'];
    const result = dealCards(deck, 'p1', playerIds);

    expect(result.hands['p1'].length).toBe(13);
    expect(result.hands['p2'].length).toBe(12);
    expect(result.hands['p3'].length).toBe(12);
    expect(result.stock.length).toBe(15);
    expect(13 + 12 + 12 + 15).toBe(52);
  });

  it('sorts cards nicely by suit and rank', () => {
    const cards = [
      createCard('hearts', 'K'),
      createCard('spades', '2'),
      createCard('hearts', '2'),
      createCard('spades', 'A'),
    ];
    const sorted = sortCards(cards);
    expect(sorted[0].suit).toBe('spades');
    expect(sorted[0].rank).toBe('A');
    expect(sorted[1].suit).toBe('spades');
    expect(sorted[1].rank).toBe('2');
  });

  it('has all 52 classic card face images available in public/cards/classic', async () => {
    const fs = await import('fs');
    const path = await import('path');
    const deck = createDeck();
    const assetsDir = path.resolve(process.cwd(), 'public/cards/classic');

    for (const card of deck) {
      const filename = `${card.rank}_${card.suit}.jpg`;
      const filePath = path.join(assetsDir, filename);
      expect(fs.existsSync(filePath), `Missing classic asset for ${filename}`).toBe(true);
    }
  });

  it('has all 52 premium card face images available in public/cards/premium', async () => {
    const fs = await import('fs');
    const path = await import('path');
    const deck = createDeck();
    const assetsDir = path.resolve(process.cwd(), 'public/cards/premium');

    for (const card of deck) {
      const filename = `${card.rank}_${card.suit}.jpg`;
      const filePath = path.join(assetsDir, filename);
      expect(fs.existsSync(filePath), `Missing premium asset for ${filename}`).toBe(true);
    }
  });
});
