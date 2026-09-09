import React, { useState, useEffect, useCallback } from 'react';
import type { GameState, Player } from '../../game/engine/gameState';
import {
  startNewGame,
  startNewRound,
  applyDrawStock,
  applyDrawDiscard,
  applyMeld,
  applySapaw,
  applyDiscard,
  applyCallDraw,
  applyDrawResponse,
  validateCallDraw,
  validateDrawDiscard,
  validateDrawStock,
  validateMeld,
  validateSapaw,
  validateDiscard,
} from '../../game/engine/rules';
import { sortCards, sortCardsByRank } from '../../game/engine/cards';
import type { Card } from '../../game/engine/cards';
import { canSapaw } from '../../game/engine/melds';
import type { Meld } from '../../game/engine/melds';
import { decideAIAction } from '../../game/ai/aiPlayer';
import type { BotProfile } from '../../game/ai/personalities';
import { StockPile } from '../table/StockPile';
import { DiscardPile } from '../table/DiscardPile';
import { MeldArea } from '../table/MeldArea';
import { PlayerArea } from '../table/PlayerArea';
import { Hand } from '../cards/Hand';
import { PlayerAvatar } from '../common/PlayerAvatar';
import { ActionBar } from '../actions/ActionBar';
import { ActionText } from '../actions/ActionText';
import { ScoreboardModal } from '../modals/ScoreboardModal';
import { DrawModal } from '../modals/DrawModal';
import { VictoryModal } from '../modals/VictoryModal';
import { DiscardHistoryModal } from '../modals/DiscardHistoryModal';
import { ArrowLeft, Volume2, VolumeX, Coins, Sparkles, Globe, Wifi, MessageSquare, Smile } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { soundManager } from '../../audio/soundEffects';
import '../../styles/table.css';
import { wsTransport } from '../../game/network/websocketTransport';
import { MobileFullscreenButton } from '../ui/MobileFullscreenButton';
import { chipBankroll } from '../../services/chipBankroll';
import { FreeChipsModal } from '../modals/FreeChipsModal';

interface GameTableProps {
  gameConfig: {
    playerName: string;
    playerAvatar: string;
    bot1: BotProfile;
    bot2: BotProfile;
    isMultiplayer?: boolean;
    isServerMultiplayer?: boolean;
    serverPlayerId?: string;
    tableName?: string;
    ante?: number;
    roomCode?: string;
    ping?: string;
  };
  onExit: () => void;
}

export const GameTable: React.FC<GameTableProps> = ({ gameConfig, onExit }) => {
  const [gameState, setGameState] = useState<GameState>(() => {
    const savedChips = chipBankroll.getChips();
    return startNewGame(
      [
        { id: 'player-human', name: gameConfig.playerName, avatar: gameConfig.playerAvatar, type: 'HUMAN', initialChips: savedChips },
        { id: gameConfig.bot1.id, name: gameConfig.bot1.name, avatar: gameConfig.bot1.avatar, type: 'AI', aiDifficulty: gameConfig.bot1.difficulty, aiPersonality: gameConfig.bot1.personality },
        { id: gameConfig.bot2.id, name: gameConfig.bot2.name, avatar: gameConfig.bot2.avatar, type: 'AI', aiDifficulty: gameConfig.bot2.difficulty, aiPersonality: gameConfig.bot2.personality },
      ],
      {
        ante: gameConfig.ante,
        tableName: gameConfig.tableName,
        isMultiplayer: gameConfig.isMultiplayer,
      }
    );
  });

  const [selectedCardIds, setSelectedCardIds] = useState<Set<string>>(new Set());
  const [sortByRank, setSortByRank] = useState(false);
  const [isSapawMode, setIsSapawMode] = useState(false);
  const [actionNotification, setActionNotification] = useState<{ id: number; text: string; type?: 'primary' | 'gold' | 'danger' | 'special' } | null>(null);
  const notificationCountRef = React.useRef(0);
  const [isThinking, setIsThinking] = useState(false);
  const [showVictoryModal, setShowVictoryModal] = useState(false);
  const [showScoreboard, setShowScoreboard] = useState(false);
  const [showDiscardHistory, setShowDiscardHistory] = useState(false);
  const [showChatMenu, setShowChatMenu] = useState(false);
  const [activeChatBubble, setActiveChatBubble] = useState<{ sender: string; message: string } | null>(null);
  const [showFreeChipsModal, setShowFreeChipsModal] = useState(false);

  const humanPlayerId =
    gameConfig.isServerMultiplayer && gameConfig.serverPlayerId
      ? gameConfig.serverPlayerId
      : 'player-human';

  const humanPlayer = gameState.players.find((p) => p.id === humanPlayerId) || gameState.players[0];
  const opponents = gameState.players.filter((p) => p.id !== humanPlayer.id);
  const bot1 = opponents[0] || gameState.players[1] || gameState.players[0];
  const bot2 = opponents[1] || gameState.players[2] || gameState.players[0];

  const isHumanTurn = gameState.currentPlayerId === humanPlayer.id;

  // Sync human player chips to persistent bankroll and listen for ad rewards
  useEffect(() => {
    if (humanPlayer && typeof humanPlayer.chips === 'number') {
      chipBankroll.setChips(humanPlayer.chips);
    }
  }, [humanPlayer?.chips]);

  useEffect(() => {
    const handleChipsFromAd = (e: any) => {
      const newChips = e.detail;
      setGameState((prev) => ({
        ...prev,
        players: prev.players.map((p) =>
          p.id === humanPlayerId ? { ...p, chips: newChips } : p
        ),
      }));
    };
    window.addEventListener('tongits_chips_updated', handleChipsFromAd);
    return () => window.removeEventListener('tongits_chips_updated', handleChipsFromAd);
  }, [humanPlayerId]);

  const showNotification = useCallback((text: string, type: 'primary' | 'gold' | 'danger' | 'special' = 'gold', duration = 1800) => {
    notificationCountRef.current += 1;
    const currentId = notificationCountRef.current;
    setActionNotification({ id: currentId, text, type });
    setTimeout(() => {
      setActionNotification((cur) => (cur?.id === currentId ? null : cur));
    }, duration);
  }, []);

  // Server state sync & chat subscriptions
  useEffect(() => {
    if (!gameConfig.isServerMultiplayer) return;

    const unsubState = wsTransport.subscribeToState((serverState) => {
      setGameState(serverState);
    });

    const unsubChat = wsTransport.subscribeToChat((chat) => {
      setActiveChatBubble({ sender: chat.senderName, message: chat.message });
      setTimeout(() => setActiveChatBubble(null), 3500);
    });

    const unsubError = wsTransport.subscribeToErrors((err) => {
      showNotification(err, 'danger');
    });

    const unsubNotif = wsTransport.subscribeToNotifications((notif) => {
      showNotification(notif.text, notif.type as any || 'gold');
    });

    return () => {
      unsubState();
      unsubChat();
      unsubError();
      unsubNotif();
    };
  }, [gameConfig.isServerMultiplayer, showNotification]);

  const QUICK_CHATS = [
    'Good luck sa lahat! 🃏',
    'Game na! 🔥',
    'Tongits na itu! 😉',
    'Nice hand! 👏',
    'Hay naku! 😂',
    'Huli ka! 🎯',
  ];

  const handleSendQuickChat = (msg: string) => {
    soundManager.playButtonClick();
    setActiveChatBubble({ sender: humanPlayer.name, message: msg });
    setShowChatMenu(false);
    setTimeout(() => setActiveChatBubble(null), 3000);

    if (gameConfig.isServerMultiplayer) {
      wsTransport.sendChat(msg);
    } else if (gameConfig.isMultiplayer && Math.random() > 0.3) {
      // Simulated opponent reactions in local multiplayer
      setTimeout(() => {
        const replies = ['Good luck!', 'Laban lang!', 'Nice!', 'Kaya pa yan! 🃏', 'Haha nice one!'];
        const randomOpponent = Math.random() > 0.5 ? bot1.name : bot2.name;
        const randomReply = replies[Math.floor(Math.random() * replies.length)];
        setActiveChatBubble({ sender: randomOpponent, message: randomReply });
        setTimeout(() => setActiveChatBubble(null), 3000);
      }, 1400);
    }
  };

  // Show banner on turn change
  useEffect(() => {
    if (gameState.phase === 'PLAYER_TURN' || gameState.phase === 'AFTER_DRAW') {
      const cur = gameState.players.find((p) => p.id === gameState.currentPlayerId);
      if (cur?.id === humanPlayer.id) {
        showNotification('YOUR TURN', 'primary', 1400);
      }
    }
  }, [gameState.currentPlayerId, gameState.phase, humanPlayer.id, showNotification]);

  // Check Round End triggers
  useEffect(() => {
    if (gameState.phase === 'ROUND_END') {
      if (gameState.roundResult?.winReason === 'TONGITS') {
        setShowVictoryModal(true);
      } else {
        setShowScoreboard(true);
      }
    }
  }, [gameState.phase, gameState.roundResult]);

  // AI Decision Engine Loop (Local Solo games only - Server handles multiplayer AI authoritative execution)
  useEffect(() => {
    if (gameConfig.isServerMultiplayer) return;
    if (gameState.phase === 'ROUND_END' || gameState.phase === 'GAME_OVER') return;

    const currentPlayer = gameState.players.find((p) => p.id === gameState.currentPlayerId);

    // 1. If currently in DRAW_CALLED phase, let eligible AI opponents respond
    if (gameState.phase === 'DRAW_CALLED' && gameState.drawCallState) {
      const pendingAi = gameState.drawCallState.eligibleOpponents.find(
        (id) => id !== humanPlayer.id && gameState.drawCallState!.responses[id] === 'PENDING'
      );
      if (pendingAi) {
        setIsThinking(true);
        const timer = setTimeout(() => {
          setIsThinking(false);
          const aiAction = decideAIAction(gameState, pendingAi);
          if (aiAction && aiAction.type === 'RESPOND_DRAW') {
            setGameState((prev) => applyDrawResponse(prev, pendingAi, aiAction.response));
          }
        }, 900);
        return () => clearTimeout(timer);
      }
    }

    // 2. Regular AI Bot turn execution
    if (currentPlayer && currentPlayer.type === 'AI') {
      setIsThinking(true);
      const delay = 750 + Math.random() * 550; // 750ms - 1300ms realistic delay
      const timer = setTimeout(() => {
        setIsThinking(false);
        const action = decideAIAction(gameState, currentPlayer.id);
        if (!action) return;

        try {
          if (action.type === 'CALL_DRAW') {
            showNotification(`${currentPlayer.name} CALLED DRAW!`, 'danger');
            soundManager.playDrawCall();
            setGameState((prev) => applyCallDraw(prev, currentPlayer.id));
          } else if (action.type === 'DRAW_STOCK') {
            soundManager.playCardFlick();
            setGameState((prev) => applyDrawStock(prev, currentPlayer.id));
          } else if (action.type === 'DRAW_DISCARD') {
            soundManager.playMeld();
            showNotification(`${currentPlayer.name} took discard & melded!`, 'gold');
            setGameState((prev) => applyDrawDiscard(prev, currentPlayer.id, action.meldCards));
          } else if (action.type === 'MELD') {
            soundManager.playMeld();
            showNotification(`${currentPlayer.name} Melded!`, 'gold');
            setGameState((prev) => applyMeld(prev, currentPlayer.id, action.cards));
          } else if (action.type === 'SAPAW') {
            soundManager.playSapaw();
            showNotification(`${currentPlayer.name} SAPAW!`, 'special');
            setGameState((prev) => applySapaw(prev, currentPlayer.id, action.card, action.targetMeldId));
          } else if (action.type === 'DISCARD') {
            soundManager.playCardSnap();
            setGameState((prev) => applyDiscard(prev, currentPlayer.id, action.card));
          }
        } catch (err: any) {
          console.error('AI Action Error:', err);
        }
      }, delay);

      return () => clearTimeout(timer);
    }
  }, [gameState, gameConfig.isServerMultiplayer, humanPlayer.id, showNotification]);

  // Card Selection handlers
  const handleCardToggle = (card: Card) => {
    setSelectedCardIds((prev) => {
      const next = new Set(prev);
      if (next.has(card.id)) {
        next.delete(card.id);
      } else {
        next.add(card.id);
      }
      return next;
    });
    setIsSapawMode(false);
  };

  const selectedCards = humanPlayer.hand.filter((c) => selectedCardIds.has(c.id));

  // Validations for human actions
  const canDrawStock = isHumanTurn && validateDrawStock(gameState, humanPlayer.id).valid;
  const drawDiscardCheck = isHumanTurn ? validateDrawDiscard(gameState, humanPlayer.id) : { valid: false };
  const canDrawDiscard = drawDiscardCheck.valid;
  const meldCheck = isHumanTurn && selectedCards.length >= 3 ? validateMeld(gameState, humanPlayer.id, selectedCards) : { valid: false };
  const canMeld = meldCheck.valid;
  const canDiscard = isHumanTurn && gameState.phase === 'AFTER_DRAW' && selectedCards.length === 1;
  const drawCallCheck = isHumanTurn ? validateCallDraw(gameState, humanPlayer.id) : { valid: false };
  const canCallDraw = drawCallCheck.valid;

  // Sapaw targeting validation
  const validSapawMeldIds = new Set<string>();
  if (isHumanTurn && gameState.phase === 'AFTER_DRAW' && selectedCards.length === 1) {
    const card = selectedCards[0];
    for (const m of gameState.melds) {
      if (canSapaw(card, m)) {
        validSapawMeldIds.add(m.id);
      }
    }
  }
  const canSapawFromHand = validSapawMeldIds.size > 0;

  // Action handlers
  const handleHumanDrawStock = () => {
    soundManager.playCardFlick();
    setSelectedCardIds(new Set());
    if (gameConfig.isServerMultiplayer) {
      wsTransport.sendAction('DRAW_STOCK', {});
    } else {
      try {
        setGameState((prev) => applyDrawStock(prev, humanPlayer.id));
      } catch (err: any) {
        showNotification(err.message, 'danger');
      }
    }
  };

  const handleHumanDrawDiscard = () => {
    if (drawDiscardCheck.possibleMelds && drawDiscardCheck.possibleMelds.length > 0) {
      const meldToUse = drawDiscardCheck.possibleMelds[0];
      soundManager.playMeld();
      setSelectedCardIds(new Set());
      if (gameConfig.isServerMultiplayer) {
        wsTransport.sendAction('DRAW_DISCARD', { meldCards: meldToUse });
      } else {
        try {
          setGameState((prev) => applyDrawDiscard(prev, humanPlayer.id, meldToUse));
          showNotification('Discard Taken & Melded!', 'gold');
        } catch (err: any) {
          showNotification(err.message, 'danger');
        }
      }
    }
  };

  const handleHumanMeld = () => {
    soundManager.playMeld();
    const cardsToMeld = [...selectedCards];
    setSelectedCardIds(new Set());
    if (gameConfig.isServerMultiplayer) {
      wsTransport.sendAction('MELD', { cards: cardsToMeld });
    } else {
      try {
        setGameState((prev) => applyMeld(prev, humanPlayer.id, cardsToMeld));
        showNotification('MELD EXPOSED!', 'gold');
      } catch (err: any) {
        showNotification(err.message, 'danger');
      }
    }
  };

  const handleHumanSapawStart = () => {
    setIsSapawMode(true);
    showNotification('Tap a highlighted table meld to Sapaw!', 'special', 2500);
  };

  const handleMeldClickForSapaw = (meld: Meld) => {
    if (selectedCards.length === 1 && validSapawMeldIds.has(meld.id)) {
      soundManager.playSapaw();
      const sapawCard = selectedCards[0];
      setSelectedCardIds(new Set());
      setIsSapawMode(false);
      if (gameConfig.isServerMultiplayer) {
        wsTransport.sendAction('SAPAW', { card: sapawCard, targetMeldId: meld.id });
      } else {
        try {
          setGameState((prev) => applySapaw(prev, humanPlayer.id, sapawCard, meld.id));
          showNotification('SAPAW!', 'special');
        } catch (err: any) {
          showNotification(err.message, 'danger');
        }
      }
    }
  };

  const handleHumanDiscard = () => {
    if (selectedCards.length === 1) {
      soundManager.playCardSnap();
      const discardCard = selectedCards[0];
      setSelectedCardIds(new Set());
      if (gameConfig.isServerMultiplayer) {
        wsTransport.sendAction('DISCARD', { card: discardCard });
      } else {
        try {
          setGameState((prev) => applyDiscard(prev, humanPlayer.id, discardCard));
        } catch (err: any) {
          showNotification(err.message, 'danger');
        }
      }
    }
  };

  const handleHumanCallDraw = () => {
    soundManager.playDrawCall();
    if (gameConfig.isServerMultiplayer) {
      wsTransport.sendAction('CALL_DRAW', {});
    } else {
      try {
        setGameState((prev) => applyCallDraw(prev, humanPlayer.id));
        showNotification('YOU CALLED DRAW!', 'danger');
      } catch (err: any) {
        showNotification(err.message, 'danger');
      }
    }
  };

  const handleHumanDrawResponse = (response: 'FOLD' | 'CHALLENGE') => {
    if (gameConfig.isServerMultiplayer) {
      wsTransport.sendAction('RESPOND_DRAW', { response });
    } else {
      try {
        setGameState((prev) => applyDrawResponse(prev, humanPlayer.id, response));
      } catch (err: any) {
        showNotification(err.message, 'danger');
      }
    }
  };

  const handleNextRound = () => {
    setShowScoreboard(false);
    setShowVictoryModal(false);
    if (gameConfig.isServerMultiplayer) {
      wsTransport.sendAction('NEXT_ROUND', {});
    } else {
      const nextDealerId = gameState.roundResult?.winnerId || gameState.dealerId;
      setGameState((prev) => startNewRound(prev, nextDealerId));
    }
  };

  // Sort human cards
  const sortedHand = sortByRank ? sortCardsByRank(humanPlayer.hand) : sortCards(humanPlayer.hand);

  return (
    <div className="table-container">
      {/* Table Surface */}
      <div className="felt-table">
        {/* Top Header Bar */}
        <div className="table-top-bar">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <button
              className="action-btn secondary"
              onClick={() => {
                soundManager.playButtonClick();
                if (gameConfig.isServerMultiplayer) {
                  wsTransport.leaveRoom();
                }
                onExit();
              }}
              style={{ padding: '6px 14px', fontSize: 12 }}
            >
              <ArrowLeft size={14} />
              <span>EXIT</span>
            </button>

            {gameConfig.isMultiplayer && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '4px 12px',
                  borderRadius: 20,
                  background: 'rgba(16, 185, 129, 0.15)',
                  border: '1px solid rgba(16, 185, 129, 0.35)',
                }}
              >
                <Globe size={13} color="#10b981" />
                <span style={{ fontSize: 11, fontWeight: 800, color: '#10b981' }}>
                  {gameConfig.tableName || 'Online Match'}
                </span>
                <span style={{ fontSize: 10, color: 'rgba(255, 255, 255, 0.4)' }}>•</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: '#10b981', fontWeight: 700 }}>
                  <Wifi size={12} />
                  <span>{gameConfig.ping || '24ms'}</span>
                </div>
              </div>
            )}
          </div>

          <div className="pot-badge">
            <Coins size={16} />
            <span>Side Pot: {gameState.sidePot} Chips</span>
            {gameState.ante && gameState.ante > 0 && (
              <span style={{ fontSize: 10, opacity: 0.8, marginLeft: 4 }}>
                (Ante: {gameState.ante})
              </span>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ fontSize: 13, color: '#fbbf24', fontWeight: 800 }}>
              Round {gameState.roundNumber}
            </div>

            {gameConfig.isMultiplayer && (
              <div style={{ position: 'relative' }}>
                <button
                  className="action-btn secondary"
                  onClick={() => {
                    soundManager.playButtonClick();
                    setShowChatMenu((prev) => !prev);
                  }}
                  style={{ padding: '6px 12px', fontSize: 11, display: 'flex', alignItems: 'center', gap: 5 }}
                >
                  <MessageSquare size={13} />
                  <span>CHAT</span>
                </button>

                {/* Quick Chat Menu */}
                {showChatMenu && (
                  <div
                    className="glass-panel"
                    style={{
                      position: 'absolute',
                      top: 36,
                      right: 0,
                      width: 200,
                      padding: 8,
                      borderRadius: 12,
                      zIndex: 100,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 4,
                      background: 'rgba(15, 23, 42, 0.96)',
                      border: '1px solid rgba(245, 158, 11, 0.4)',
                      boxShadow: '0 12px 30px rgba(0, 0, 0, 0.6)',
                    }}
                  >
                    <div style={{ fontSize: 10, color: '#9ca3af', fontWeight: 800, padding: '4px 6px', textTransform: 'uppercase' }}>
                      Quick Reactions
                    </div>
                    {QUICK_CHATS.map((msg) => (
                      <button
                        key={msg}
                        onClick={() => handleSendQuickChat(msg)}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          color: '#f3f4f6',
                          fontSize: 12,
                          textAlign: 'left',
                          padding: '6px 8px',
                          borderRadius: 6,
                          cursor: 'pointer',
                          transition: 'background 0.15s ease',
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(245, 158, 11, 0.15)')}
                        onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                      >
                        {msg}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Mobile-only Fullscreen Toggle */}
            <MobileFullscreenButton />
          </div>
        </div>

        {/* Floating Chat Bubble */}
        <AnimatePresence>
          {activeChatBubble && (
            <motion.div
              initial={{ opacity: 0, scale: 0.85, y: -8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.85, y: -8 }}
              style={{
                position: 'absolute',
                top: 54,
                left: '50%',
                transform: 'translateX(-50%)',
                zIndex: 90,
                padding: '8px 18px',
                borderRadius: 20,
                background: 'rgba(15, 23, 42, 0.95)',
                border: '1px solid rgba(245, 158, 11, 0.6)',
                boxShadow: '0 8px 24px rgba(0, 0, 0, 0.5)',
                color: '#ffffff',
                fontSize: 13,
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                pointerEvents: 'none',
              }}
            >
              <span style={{ color: '#fbbf24', fontWeight: 800 }}>{activeChatBubble.sender}:</span>
              <span>"{activeChatBubble.message}"</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Opponents Row */}
        <div className="opponents-row">
          <PlayerArea
            player={bot1}
            isActiveTurn={gameState.currentPlayerId === bot1.id}
            isDealer={gameState.dealerId === bot1.id}
            isThinking={isThinking && gameState.currentPlayerId === bot1.id}
            position="top-left"
          />

          <PlayerArea
            player={bot2}
            isActiveTurn={gameState.currentPlayerId === bot2.id}
            isDealer={gameState.dealerId === bot2.id}
            isThinking={isThinking && gameState.currentPlayerId === bot2.id}
            position="top-right"
          />
        </div>

        {/* Center Table Area */}
        <div className="center-table-area">
          <div className="piles-container">
            <StockPile
              cards={gameState.stock}
              isClickable={canDrawStock}
              onDrawStock={handleHumanDrawStock}
            />

            <DiscardPile
              discardPile={gameState.discardPile}
              isPickable={canDrawDiscard}
              onPickDiscard={handleHumanDrawDiscard}
              onViewHistory={() => setShowDiscardHistory(true)}
            />
          </div>

          {/* Table Melds */}
          <MeldArea
            melds={gameState.melds}
            players={gameState.players}
            selectedSapawCardId={selectedCards.length === 1 ? selectedCards[0].id : undefined}
            validSapawMeldIds={isSapawMode ? validSapawMeldIds : undefined}
            onMeldClick={handleMeldClickForSapaw}
          />
        </div>

        {/* Bottom Human Player Area */}
        <div className="bottom-player-section">
          <ActionBar
            phase={gameState.phase}
            isMyTurn={isHumanTurn}
            selectedCards={selectedCards}
            canDrawStock={canDrawStock}
            canDrawDiscard={canDrawDiscard}
            canMeld={canMeld}
            meldType={meldCheck.type}
            canSapaw={canSapawFromHand}
            canDiscard={canDiscard}
            canCallDraw={canCallDraw}
            drawCallDisabledReason={drawCallCheck.error}
            onDrawStock={handleHumanDrawStock}
            onDrawDiscard={handleHumanDrawDiscard}
            onMeld={handleHumanMeld}
            onSapawStart={handleHumanSapawStart}
            onDiscard={handleHumanDiscard}
            onCallDraw={handleHumanCallDraw}
            onSortToggle={() => setSortByRank((prev) => !prev)}
            sortByRank={sortByRank}
          />

          <Hand
            cards={sortedHand}
            selectedCardIds={selectedCardIds}
            onCardToggle={handleCardToggle}
            disabled={!isHumanTurn}
          />

          <div className="human-player-badge">
            <div className="human-player-avatar-wrap" style={{ position: 'relative', flexShrink: 0 }}>
              <PlayerAvatar
                avatarId={humanPlayer.avatar}
                name={humanPlayer.name}
                size={26}
                status={isHumanTurn ? 'YOUR_TURN' : 'IDLE'}
                showStatusRing={isHumanTurn}
              />
              {gameState.dealerId === humanPlayer.id && (
                <div className="dealer-button" style={{ bottom: -2, right: -2, width: 14, height: 14, fontSize: 8 }}>D</div>
              )}
            </div>
            <span style={{ fontWeight: 800, fontSize: 'clamp(12px, 1.3vw, 14px)', color: isHumanTurn ? '#fbbf24' : '#f3f4f6', whiteSpace: 'nowrap' }}>
              {humanPlayer.name}
            </span>
            <button
              onClick={() => {
                soundManager.playButtonClick();
                setShowFreeChipsModal(true);
              }}
              title="Get Free Chips (Watch Ad)"
              style={{
                background: humanPlayer.chips <= (gameState.ante ?? 2) ? 'rgba(239, 68, 68, 0.25)' : 'rgba(245, 158, 11, 0.15)',
                border: humanPlayer.chips <= (gameState.ante ?? 2) ? '1px solid #ef4444' : '1px solid rgba(245, 158, 11, 0.4)',
                borderRadius: 9999,
                padding: '2px 8px',
                color: '#fbbf24',
                fontWeight: 800,
                fontSize: 'clamp(10px, 1.1vw, 12px)',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4,
                whiteSpace: 'nowrap',
              }}
            >
              <span>⬡ {humanPlayer.chips} Chips</span>
              <span style={{ fontSize: 11, opacity: 0.9 }}>+</span>
            </button>
            {humanPlayer.opened && (
              <span style={{ fontSize: 9, fontWeight: 800, color: '#10b981', background: 'rgba(16, 185, 129, 0.2)', padding: '1px 5px', borderRadius: 4 }}>
                OPENED
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Dynamic Action Notification */}
      <ActionText notification={actionNotification} />

      {/* Modals */}
      <DrawModal
        isOpen={gameState.phase === 'DRAW_CALLED'}
        drawState={gameState.drawCallState}
        players={gameState.players}
        humanPlayerId="player-human"
        onRespond={handleHumanDrawResponse}
      />

      <VictoryModal
        isOpen={showVictoryModal}
        winner={gameState.players.find((p) => p.id === gameState.roundResult?.winnerId)}
        onDismiss={() => {
          setShowVictoryModal(false);
          setShowScoreboard(true);
        }}
      />

      <ScoreboardModal
        isOpen={showScoreboard}
        roundResult={gameState.roundResult}
        players={gameState.players}
        sidePot={gameState.sidePot}
        onNextRound={handleNextRound}
      />

      <DiscardHistoryModal
        isOpen={showDiscardHistory}
        discardPile={gameState.discardPile}
        onClose={() => setShowDiscardHistory(false)}
      />

      <FreeChipsModal
        isOpen={showFreeChipsModal}
        onClose={() => setShowFreeChipsModal(false)}
      />
    </div>
  );
};
