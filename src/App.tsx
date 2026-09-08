import React, { useState } from 'react';
import { HomeScreen } from './components/screens/HomeScreen';
import { TutorialScreen } from './components/screens/TutorialScreen';
import { SettingsScreen } from './components/screens/SettingsScreen';
import { MultiplayerScreen } from './components/screens/MultiplayerScreen';
import { GameTable } from './components/screens/GameTable';
import { SetupModal } from './components/modals/SetupModal';
import { BotProfile, BOT_PRESETS } from './game/ai/personalities';
import { AIDifficulty } from './game/engine/gameState';
import { DeckStyleProvider } from './context/DeckStyleContext';
import { OrientationPrompt } from './components/ui/OrientationPrompt';
import './styles/index.css';

type Screen = 'HOME' | 'GAME' | 'TUTORIAL' | 'SETTINGS' | 'MULTIPLAYER';

export function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('HOME');
  const [isSetupOpen, setIsSetupOpen] = useState(false);
  const [returnToScreen, setReturnToScreen] = useState<Screen>('HOME');
  const [gameConfig, setGameConfig] = useState<{
    playerName: string;
    playerAvatar: string;
    bot1: BotProfile;
    bot2: BotProfile;
    difficulty: AIDifficulty;
    isMultiplayer?: boolean;
    isServerMultiplayer?: boolean;
    serverPlayerId?: string;
    tableName?: string;
    ante?: number;
    roomCode?: string;
    ping?: string;
  }>({
    playerName: 'You',
    playerAvatar: 'avatar-1',
    bot1: BOT_PRESETS[0], // Marco (Aggressive)
    bot2: BOT_PRESETS[1], // Sofia (Conservative)
    difficulty: 'MEDIUM',
  });

  const createBot = (
    id: string,
    name: string,
    avatar: string,
    difficulty: AIDifficulty = 'MEDIUM',
    personality: 'AGGRESSIVE' | 'CONSERVATIVE' | 'BALANCED' = 'BALANCED'
  ): BotProfile => ({
    id,
    name,
    avatar,
    personality,
    difficulty,
    bio: 'Online Challenger',
    drawCallDeadwoodThreshold: personality === 'AGGRESSIVE' ? 14 : personality === 'CONSERVATIVE' ? 6 : 10,
    challengeDeadwoodThreshold: personality === 'AGGRESSIVE' ? 12 : personality === 'CONSERVATIVE' ? 8 : 10,
    openMeldAggressiveness: personality === 'AGGRESSIVE' ? 0.85 : personality === 'CONSERVATIVE' ? 0.4 : 0.65,
  });

  const handleStartGame = (config: typeof gameConfig) => {
    setGameConfig({
      ...config,
      isMultiplayer: false,
      isServerMultiplayer: false,
    });
    setIsSetupOpen(false);
    setReturnToScreen('HOME');
    setCurrentScreen('GAME');
  };

  const handleStartMultiplayerTable = (config: {
    tableName: string;
    ante: number;
    roomCode: string;
    ping: string;
    playerName: string;
    playerAvatar: string;
    opponent1: { name: string; avatar: string; difficulty?: AIDifficulty; personality?: any };
    opponent2: { name: string; avatar: string; difficulty?: AIDifficulty; personality?: any };
    isServerMultiplayer?: boolean;
    serverPlayerId?: string;
  }) => {
    setGameConfig({
      playerName: config.playerName || 'You',
      playerAvatar: config.playerAvatar || 'avatar-1',
      bot1: createBot(
        `mp-opp-1-${Date.now()}`,
        config.opponent1.name,
        config.opponent1.avatar,
        config.opponent1.difficulty || 'MEDIUM',
        config.opponent1.personality || 'BALANCED'
      ),
      bot2: createBot(
        `mp-opp-2-${Date.now()}`,
        config.opponent2.name,
        config.opponent2.avatar,
        config.opponent2.difficulty || 'MEDIUM',
        config.opponent2.personality || 'BALANCED'
      ),
      difficulty: 'MEDIUM',
      isMultiplayer: true,
      isServerMultiplayer: config.isServerMultiplayer,
      serverPlayerId: config.serverPlayerId,
      tableName: config.tableName,
      ante: config.ante,
      roomCode: config.roomCode,
      ping: config.ping,
    });
    setReturnToScreen('MULTIPLAYER');
    setCurrentScreen('GAME');
  };

  return (
    <DeckStyleProvider>
      <div style={{ width: '100%', height: '100%' }}>
        <OrientationPrompt />
        {currentScreen === 'HOME' && (
          <HomeScreen
            onPlaySolo={() => setIsSetupOpen(true)}
            onMultiplayer={() => setCurrentScreen('MULTIPLAYER')}
            onHowToPlay={() => setCurrentScreen('TUTORIAL')}
            onSettings={() => setCurrentScreen('SETTINGS')}
          />
        )}

        {currentScreen === 'TUTORIAL' && (
          <TutorialScreen onBack={() => setCurrentScreen('HOME')} />
        )}

        {currentScreen === 'SETTINGS' && (
          <SettingsScreen onBack={() => setCurrentScreen('HOME')} />
        )}

        {currentScreen === 'MULTIPLAYER' && (
          <MultiplayerScreen
            onBack={() => setCurrentScreen('HOME')}
            onJoinTable={handleStartMultiplayerTable}
          />
        )}

        {currentScreen === 'GAME' && (
          <GameTable
            gameConfig={gameConfig}
            onExit={() => setCurrentScreen(returnToScreen)}
          />
        )}

        <SetupModal
          isOpen={isSetupOpen}
          onClose={() => setIsSetupOpen(false)}
          onStartGame={handleStartGame}
        />
      </div>
    </DeckStyleProvider>
  );
}

export default App;
