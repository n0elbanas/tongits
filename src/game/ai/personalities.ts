import { AIPersonality, AIDifficulty } from '../engine/gameState';
import { getAvatarData } from '../avatars/avatarData';

export interface BotProfile {
  id: string;
  name: string;
  avatar: string; // avatarId from avatarData catalog
  personality: AIPersonality;
  difficulty: AIDifficulty;
  bio: string;
  drawCallDeadwoodThreshold: number; // max deadwood to initiate Draw
  challengeDeadwoodThreshold: number; // max deadwood to challenge a Draw
  openMeldAggressiveness: number; // 0.0 to 1.0 (how eager to open melds immediately)
}

export const BOT_PRESETS: BotProfile[] = [
  {
    id: 'bot-marco',
    name: 'Marco',
    avatar: 'avatar-5',
    personality: 'AGGRESSIVE',
    difficulty: 'MEDIUM',
    bio: 'Fast and aggressive player who puts pressure by calling Draw early and opening melds quickly.',
    drawCallDeadwoodThreshold: 14,
    challengeDeadwoodThreshold: 12,
    openMeldAggressiveness: 0.9,
  },
  {
    id: 'bot-sofia',
    name: 'Sofia',
    avatar: 'avatar-2',
    personality: 'CONSERVATIVE',
    difficulty: 'MEDIUM',
    bio: 'Careful strategist who conceals her melds until she has minimal deadwood.',
    drawCallDeadwoodThreshold: 6,
    challengeDeadwoodThreshold: 8,
    openMeldAggressiveness: 0.4,
  },
  {
    id: 'bot-liza',
    name: 'Liza',
    avatar: 'avatar-4',
    personality: 'BALANCED',
    difficulty: 'MEDIUM',
    bio: 'Balanced calculator who prioritizes high-value Sapaw lay-offs and safe discards.',
    drawCallDeadwoodThreshold: 10,
    challengeDeadwoodThreshold: 10,
    openMeldAggressiveness: 0.7,
  },
  {
    id: 'bot-rafael',
    name: 'Rafael',
    avatar: 'avatar-3',
    personality: 'AGGRESSIVE',
    difficulty: 'HARD',
    bio: 'Master card tracker who punishes high deadwood hands.',
    drawCallDeadwoodThreshold: 12,
    challengeDeadwoodThreshold: 11,
    openMeldAggressiveness: 0.85,
  },
  {
    id: 'bot-andrea',
    name: 'Andrea',
    avatar: 'avatar-6',
    personality: 'BALANCED',
    difficulty: 'EASY',
    bio: 'Friendly casual player learning the ropes.',
    drawCallDeadwoodThreshold: 15,
    challengeDeadwoodThreshold: 14,
    openMeldAggressiveness: 0.95,
  },
  {
    id: 'bot-daniel',
    name: 'Daniel',
    avatar: 'avatar-7',
    personality: 'AGGRESSIVE',
    difficulty: 'HARD',
    bio: 'Unpredictable tactician who baits opponents into expensive discards.',
    drawCallDeadwoodThreshold: 11,
    challengeDeadwoodThreshold: 11,
    openMeldAggressiveness: 0.8,
  },
  {
    id: 'bot-elena',
    name: 'Elena',
    avatar: 'avatar-8',
    personality: 'CONSERVATIVE',
    difficulty: 'HARD',
    bio: 'Deadwood perfectionist who hoards safe discard cards.',
    drawCallDeadwoodThreshold: 7,
    challengeDeadwoodThreshold: 9,
    openMeldAggressiveness: 0.35,
  },
  {
    id: 'bot-gabriel',
    name: 'Gabriel',
    avatar: 'avatar-9',
    personality: 'BALANCED',
    difficulty: 'MEDIUM',
    bio: 'Solid tournament player with consistent tempo and tight play.',
    drawCallDeadwoodThreshold: 10,
    challengeDeadwoodThreshold: 10,
    openMeldAggressiveness: 0.65,
  },
  {
    id: 'bot-chloe',
    name: 'Chloe',
    avatar: 'avatar-10',
    personality: 'AGGRESSIVE',
    difficulty: 'HARD',
    bio: 'Fearless competitor who hunts for instant Tongits closures.',
    drawCallDeadwoodThreshold: 13,
    challengeDeadwoodThreshold: 12,
    openMeldAggressiveness: 0.85,
  },
  {
    id: 'bot-carmela',
    name: 'Carmela',
    avatar: 'avatar-12',
    personality: 'BALANCED',
    difficulty: 'MEDIUM',
    bio: 'Former casino dealer with razor sharp probability estimation.',
    drawCallDeadwoodThreshold: 9,
    challengeDeadwoodThreshold: 9,
    openMeldAggressiveness: 0.7,
  },
  {
    id: 'bot-rodrigo',
    name: 'Rodrigo',
    avatar: 'avatar-13',
    personality: 'AGGRESSIVE',
    difficulty: 'HARD',
    bio: 'High-roller with explosive Sapaw attacks that catch opponents off guard.',
    drawCallDeadwoodThreshold: 14,
    challengeDeadwoodThreshold: 13,
    openMeldAggressiveness: 0.9,
  },
  {
    id: 'bot-isabella',
    name: 'Isabella',
    avatar: 'avatar-14',
    personality: 'CONSERVATIVE',
    difficulty: 'MEDIUM',
    bio: 'Unbreakable defense who almost never gets caught with high point cards.',
    drawCallDeadwoodThreshold: 6,
    challengeDeadwoodThreshold: 8,
    openMeldAggressiveness: 0.45,
  },
  {
    id: 'bot-carlos',
    name: 'Carlos',
    avatar: 'avatar-25',
    personality: 'BALANCED',
    difficulty: 'HARD',
    bio: 'Legendary table veteran whose calm facade masks master-level plays.',
    drawCallDeadwoodThreshold: 10,
    challengeDeadwoodThreshold: 11,
    openMeldAggressiveness: 0.75,
  },
];

/**
 * Filter available bots excluding the player's selected avatar and optionally an opponent bot ID.
 */
export function getAvailableBots(excludedAvatarId?: string, excludedBotId?: string): BotProfile[] {
  const normalizedExcludedAvatar = excludedAvatarId ? getAvatarData(excludedAvatarId).id : '';

  return BOT_PRESETS.filter((bot) => {
    const normalizedBotAvatar = getAvatarData(bot.avatar).id;
    if (normalizedExcludedAvatar && normalizedBotAvatar === normalizedExcludedAvatar) {
      return false;
    }
    if (excludedBotId && bot.id === excludedBotId) {
      return false;
    }
    return true;
  });
}
