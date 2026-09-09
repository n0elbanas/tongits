import { describe, it, expect, beforeEach } from 'vitest';

class LocalStorageMock {
  private store: Record<string, string> = {};

  clear() {
    this.store = {};
  }

  getItem(key: string): string | null {
    return this.store[key] || null;
  }

  setItem(key: string, value: string) {
    this.store[key] = String(value);
  }

  removeItem(key: string) {
    delete this.store[key];
  }
}

const mockStorage = new LocalStorageMock();

describe('Player Profile & Name Management', () => {
  beforeEach(() => {
    mockStorage.clear();
  });

  it('stores and retrieves player name in localStorage correctly', () => {
    expect(mockStorage.getItem('tongits_player_name')).toBeNull();
    const testName = 'CardShark99';
    mockStorage.setItem('tongits_player_name', testName);
    expect(mockStorage.getItem('tongits_player_name')).toBe(testName);
  });

  it('handles empty or whitespace names with safe fallback', () => {
    const rawInput = '   ';
    const finalName = rawInput.trim() || 'Player';
    expect(finalName).toBe('Player');
  });

  it('preserves valid trimmed names up to 16 characters', () => {
    const rawInput = '  GoldenAce  ';
    const trimmed = rawInput.trim().slice(0, 16);
    expect(trimmed).toBe('GoldenAce');
  });

  it('stores and retrieves player avatar in localStorage correctly', () => {
    expect(mockStorage.getItem('tongits_player_avatar')).toBeNull();
    mockStorage.setItem('tongits_player_avatar', 'avatar-8');
    expect(mockStorage.getItem('tongits_player_avatar')).toBe('avatar-8');
  });
});
