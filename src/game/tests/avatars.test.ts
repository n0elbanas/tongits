import { describe, it, expect } from 'vitest';
import {
  AVATARS_CATALOG,
  DEFAULT_AVATARS,
  OPTIONAL_AVATARS,
  getAvatarData,
} from '../avatars/avatarData';
import { BOT_PRESETS, getAvailableBots } from '../ai/personalities';

describe('Avatar Catalog & Roster', () => {
  it('contains exactly 25 avatars', () => {
    expect(AVATARS_CATALOG.length).toBe(25);
  });

  it('contains exactly 10 default starter avatars', () => {
    expect(DEFAULT_AVATARS.length).toBe(10);
  });

  it('contains exactly 15 optional extended avatars', () => {
    expect(OPTIONAL_AVATARS.length).toBe(15);
  });

  it('resolves legacy avatar IDs correctly to maintain compatibility', () => {
    expect(getAvatarData('avatar-miguel').id).toBe('avatar-1');
    expect(getAvatarData('avatar-sofia').id).toBe('avatar-2');
    expect(getAvatarData('avatar-marco').id).toBe('avatar-5');
    expect(getAvatarData('avatar-1').imageUrl).toBe('/avatars/avatar-1.jpg');
    expect(getAvatarData('avatar-25').imageUrl).toBe('/avatars/avatar-25.jpg');
  });

  it('has valid images for all 25 avatars', () => {
    for (let i = 1; i <= 25; i++) {
      const av = getAvatarData(`avatar-${i}`);
      expect(av.imageUrl).toBe(`/avatars/avatar-${i}.jpg`);
      expect(av.name).toBeTruthy();
    }
  });
});

describe('Bot & Player Exclusion Logic', () => {
  it('excludes the human player chosen avatar from available bots', () => {
    // If player chooses Marco (avatar-5)
    const availableForPlayer5 = getAvailableBots('avatar-5');
    const hasPlayerAvatar = availableForPlayer5.some(
      (b) => getAvatarData(b.avatar).id === 'avatar-5'
    );
    expect(hasPlayerAvatar).toBe(false);

    // If player chooses Sofia (avatar-2)
    const availableForPlayer2 = getAvailableBots('avatar-2');
    const hasSofia = availableForPlayer2.some(
      (b) => getAvatarData(b.avatar).id === 'avatar-2'
    );
    expect(hasSofia).toBe(false);
  });

  it('prevents Bot 1 and Bot 2 from being the same bot', () => {
    const availableForBot2 = getAvailableBots('avatar-1', 'bot-marco');
    expect(availableForBot2.some((b) => b.id === 'bot-marco')).toBe(false);
  });
});
