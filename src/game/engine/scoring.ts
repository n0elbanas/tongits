import { Card } from './cards';
import { Meld } from './melds';

export interface ScoringConfig {
  baseWinChips: number; // 1
  tongitsWinChips: number; // 3
  drawChallengeWinChips: number; // 3
  aceBonusChips: number; // 1 per Ace
  secretFourBonusChips: number; // 3 per 4-of-a-kind
  sunogPenaltyChips: number; // 1 per burned player
  sidePotAnte: number; // 2 chips per player
}

export const DEFAULT_SCORING_CONFIG: ScoringConfig = {
  baseWinChips: 1,
  tongitsWinChips: 3,
  drawChallengeWinChips: 3,
  aceBonusChips: 1,
  secretFourBonusChips: 3,
  sunogPenaltyChips: 1,
  sidePotAnte: 2,
};

export type WinReason =
  | 'TONGITS'
  | 'DRAW_NO_CHALLENGE'
  | 'DRAW_WON_CHALLENGE'
  | 'STOCK_EXHAUSTED';

export interface PlayerScoreBreakdown {
  playerId: string;
  isWinner: boolean;
  isSunog: boolean;
  deadwood: number;
  chipDelta: number; // net chips won or lost this round
  details: {
    baseWin?: number;
    tongitsBonus?: number;
    drawChallengeBonus?: number;
    aceCount?: number;
    aceBonus?: number;
    secretFourCount?: number;
    secretFourBonus?: number;
    sunogPenalty?: number;
    sidePotWon?: number;
  };
}

export interface RoundScoringResult {
  winnerId: string;
  winReason: WinReason;
  playerBreakdowns: Record<string, PlayerScoreBreakdown>;
  sidePotWon: boolean;
  sidePotAmount: number;
  newSidePot: number;
}

export function calculateRoundScores(params: {
  winnerId: string;
  winReason: WinReason;
  players: Array<{
    id: string;
    hand: Card[];
    exposedMelds: Meld[];
    opened: boolean;
    burned: boolean;
    winStreak: number;
  }>;
  currentSidePot: number;
  config?: ScoringConfig;
}): RoundScoringResult {
  const config = params.config ?? DEFAULT_SCORING_CONFIG;
  const winner = params.players.find((p) => p.id === params.winnerId)!;
  const losers = params.players.filter((p) => p.id !== params.winnerId);

  // 1. Calculate Winner Ace bonus:
  // Count Aces in winner's remaining hand + winner's exposed melds
  const winnerAcesInHand = winner.hand.filter((c) => c.rank === 'A').length;
  const winnerAcesInMelds = winner.exposedMelds.reduce(
    (count, m) => count + m.cards.filter((c) => c.rank === 'A').length,
    0
  );
  const totalWinnerAces = winnerAcesInHand + winnerAcesInMelds;
  const aceBonusTotal = totalWinnerAces * config.aceBonusChips;

  // 2. Secret 4-of-a-kind in winner hand
  const winnerRankCounts: Record<string, number> = {};
  for (const card of winner.hand) {
    winnerRankCounts[card.rank] = (winnerRankCounts[card.rank] || 0) + 1;
  }
  let secretFourCount = 0;
  for (const rank in winnerRankCounts) {
    if (winnerRankCounts[rank] === 4) secretFourCount++;
  }
  const secretFourBonus = secretFourCount * config.secretFourBonusChips;

  // 3. Sunog count among losers
  const sunogCount = losers.filter((p) => p.burned || !p.opened).length;
  const sunogPenaltyTotal = sunogCount * config.sunogPenaltyChips;

  // 4. Base win rate per loser
  let baseWinPerLoser = config.baseWinChips;
  if (params.winReason === 'TONGITS') {
    baseWinPerLoser = config.tongitsWinChips;
  } else if (params.winReason === 'DRAW_WON_CHALLENGE') {
    baseWinPerLoser = config.drawChallengeWinChips;
  }

  // Each loser pays baseWin + aceBonusTotal + secretFourBonus + (if loser is sunog, sunogPenalty)
  let totalCollectedByWinner = 0;
  const breakdowns: Record<string, PlayerScoreBreakdown> = {};

  for (const loser of losers) {
    const isLoserSunog = loser.burned || !loser.opened;
    const loserSunogExtra = isLoserSunog ? config.sunogPenaltyChips : 0;
    const loserPayment = baseWinPerLoser + aceBonusTotal + secretFourBonus + loserSunogExtra;
    totalCollectedByWinner += loserPayment;

    breakdowns[loser.id] = {
      playerId: loser.id,
      isWinner: false,
      isSunog: isLoserSunog,
      deadwood: loser.hand.reduce((sum, c) => sum + c.value, 0),
      chipDelta: -loserPayment,
      details: {
        sunogPenalty: isLoserSunog ? -config.sunogPenaltyChips : 0,
      },
    };
  }

  // 5. Side Pot calculation:
  // Winner wins side pot if this is their 2nd consecutive win (winStreak + 1 >= 2)
  const isSidePotWon = (winner.winStreak + 1) >= 2 && params.currentSidePot > 0;
  const sidePotWonAmount = isSidePotWon ? params.currentSidePot : 0;
  const newSidePot = isSidePotWon ? 0 : params.currentSidePot;

  breakdowns[winner.id] = {
    playerId: winner.id,
    isWinner: true,
    isSunog: false,
    deadwood: winner.hand.reduce((sum, c) => sum + c.value, 0),
    chipDelta: totalCollectedByWinner + sidePotWonAmount,
    details: {
      baseWin: baseWinPerLoser * losers.length,
      tongitsBonus: params.winReason === 'TONGITS' ? (config.tongitsWinChips - config.baseWinChips) * losers.length : 0,
      drawChallengeBonus: params.winReason === 'DRAW_WON_CHALLENGE' ? (config.drawChallengeWinChips - config.baseWinChips) * losers.length : 0,
      aceCount: totalWinnerAces,
      aceBonus: aceBonusTotal * losers.length,
      secretFourCount,
      secretFourBonus: secretFourBonus * losers.length,
      sunogPenalty: sunogPenaltyTotal,
      sidePotWon: sidePotWonAmount,
    },
  };

  return {
    winnerId: winner.id,
    winReason: params.winReason,
    playerBreakdowns: breakdowns,
    sidePotWon: isSidePotWon,
    sidePotAmount: sidePotWonAmount,
    newSidePot,
  };
}
