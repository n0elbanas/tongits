import { describe, it, expect } from 'vitest';
import { createCard } from '../engine/cards';
import {
  startNewGame,
  applyDrawStock,
  applyDrawDiscard,
  applyMeld,
  applySapaw,
  applyDiscard,
  applyCallDraw,
  applyDrawResponse,
  validateCallDraw,
  validateDrawDiscard,
} from '../engine/rules';
import { calculateRoundScores } from '../engine/scoring';

describe('Game Rules and State Transitions', () => {
  const players = [
    { id: 'p1', name: 'You', avatar: '👤', type: 'HUMAN' as const },
    { id: 'p2', name: 'Marco', avatar: '🤖', type: 'AI' as const },
    { id: 'p3', name: 'Sofia', avatar: '🤖', type: 'AI' as const },
  ];

  it('starts a new game properly with dealer having 13 cards in AFTER_DRAW phase', () => {
    const state = startNewGame(players);
    expect(state.phase).toBe('AFTER_DRAW');
    const dealer = state.players.find((p) => p.id === state.dealerId)!;
    expect(dealer.hand.length).toBe(13);
    expect(state.stock.length).toBe(15);
    expect(state.sidePot).toBe(6); // 2 chips ante * 3 players
  });

  it('blocks illegal discard before drawing when in PLAYER_TURN phase', () => {
    let state = startNewGame(players);
    const dealer = state.players.find((p) => p.id === state.dealerId)!;
    // Dealer discards to end first turn
    state = applyDiscard(state, dealer.id, dealer.hand[0]);
    expect(state.phase).toBe('PLAYER_TURN');

    // Next player cannot discard directly without drawing
    const nextPlayer = state.players.find((p) => p.id === state.currentPlayerId)!;
    expect(() => applyDiscard(state, nextPlayer.id, nextPlayer.hand[0])).toThrow();
  });

  it('enforces discard pickup rule: must immediately form valid exposed meld', () => {
    let state = startNewGame(players);
    const dealer = state.players.find((p) => p.id === state.dealerId)!;
    // Set a known discard
    const discardCard = createCard('hearts', '7');
    dealer.hand.push(discardCard);
    state = applyDiscard(state, dealer.id, discardCard);

    const nextPlayer = state.players.find((p) => p.id === state.currentPlayerId)!;
    // Give next player non-matching cards
    nextPlayer.hand = [
      createCard('spades', '2'),
      createCard('spades', '9'),
      createCard('clubs', 'K'),
    ];

    const validation = validateDrawDiscard(state, nextPlayer.id);
    expect(validation.valid).toBe(false);
  });

  it('locks Draw call on next turn if player was Sapawed by an opponent', () => {
    let state = startNewGame(players);
    const p1 = state.players[0];
    const p2 = state.players[1];

    // p1 has an exposed meld
    p1.opened = true;
    p1.exposedMelds = [
      {
        id: 'meld-1',
        type: 'run',
        cards: [
          createCard('hearts', '4'),
          createCard('hearts', '5'),
          createCard('hearts', '6'),
        ],
        ownerId: p1.id,
      },
    ];
    state.melds = [...p1.exposedMelds];

    // Simulate p2's turn: p2 draws then Sapaws on p1's meld
    state.currentPlayerId = p2.id;
    state.phase = 'AFTER_DRAW';
    p2.hand = [createCard('hearts', '7'), createCard('clubs', 'K')];

    state = applySapaw(state, p2.id, createCard('hearts', '7'), 'meld-1');
    const updatedP1 = state.players.find((p) => p.id === p1.id)!;
    expect(updatedP1.sapawedSinceLastTurn).toBe(true);

    // When p1's turn comes, validateCallDraw should reject
    state.currentPlayerId = p1.id;
    state.phase = 'PLAYER_TURN';
    const drawCheck = validateCallDraw(state, p1.id);
    expect(drawCheck.valid).toBe(false);
    expect(drawCheck.error).toContain('Sapaw');
  });

  it('triggers Tongits when player hand reaches 0 cards', () => {
    let state = startNewGame(players);
    const p1 = state.players[0];
    state.currentPlayerId = p1.id;
    state.phase = 'AFTER_DRAW';

    p1.hand = [
      createCard('hearts', '7'),
      createCard('spades', '7'),
      createCard('diamonds', '7'),
    ];

    state = applyMeld(state, p1.id, p1.hand);
    expect(state.phase).toBe('ROUND_END');
    expect(state.roundResult?.winReason).toBe('TONGITS');
    expect(state.roundResult?.winnerId).toBe(p1.id);
  });

  it('supports custom ante stakes and table metadata for multiplayer games', () => {
    const customAnte = 10;
    const state = startNewGame(players, {
      ante: customAnte,
      tableName: 'Manila Masters',
      isMultiplayer: true,
    });

    expect(state.ante).toBe(10);
    expect(state.tableName).toBe('Manila Masters');
    expect(state.isMultiplayer).toBe(true);
    // Side pot must equal ante * players
    expect(state.sidePot).toBe(30);
    // Each player chips deducted by ante
    state.players.forEach((p) => {
      expect(p.chips).toBe(100 - customAnte);
    });
  });
});
