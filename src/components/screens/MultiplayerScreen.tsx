import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Users,
  Globe,
  Lock,
  Plus,
  Wifi,
  Zap,
  Copy,
  Check,
  Send,
  Play,
  UserPlus,
  AlertCircle,
} from 'lucide-react';
import { soundManager } from '../../audio/soundEffects';
import { PlayerAvatar } from '../common/PlayerAvatar';
import { wsTransport } from '../../game/network/websocketTransport';
import { RoomState, PublicRoomInfo, RoomPlayer } from '../../game/network/types';

export interface MultiplayerTableData {
  id: string;
  name: string;
  host: string;
  hostAvatar: string;
  players: number;
  max: number;
  ante: number;
  ping: string;
  code: string;
  isPrivate?: boolean;
}

interface MultiplayerScreenProps {
  onBack: () => void;
  onJoinTable: (config: {
    tableName: string;
    ante: number;
    roomCode: string;
    ping: string;
    playerName: string;
    playerAvatar: string;
    opponent1: { name: string; avatar: string; difficulty?: any; personality?: any };
    opponent2: { name: string; avatar: string; difficulty?: any; personality?: any };
    isServerMultiplayer?: boolean;
    serverPlayerId?: string;
  }) => void;
}

const DEFAULT_SAMPLE_ROOMS: MultiplayerTableData[] = [
  {
    id: 'room-1',
    name: 'Manila Masters (High Stakes)',
    host: 'Rafael',
    hostAvatar: 'avatar_3',
    players: 1,
    max: 3,
    ante: 10,
    ping: '22ms',
    code: 'MNL99',
  },
  {
    id: 'room-2',
    name: 'Cebu Casuals Table',
    host: 'Liza',
    hostAvatar: 'avatar_4',
    players: 2,
    max: 3,
    ante: 2,
    ping: '35ms',
    code: 'CEB14',
  },
  {
    id: 'room-3',
    name: 'Baguio Pro League',
    host: 'Marco',
    hostAvatar: 'avatar_5',
    players: 1,
    max: 3,
    ante: 5,
    ping: '18ms',
    code: 'BAG88',
  },
];

interface ChatMsg {
  sender: string;
  text: string;
  isSelf?: boolean;
}

export const MultiplayerScreen: React.FC<MultiplayerScreenProps> = ({ onBack, onJoinTable }) => {
  // Server connection & room state
  const [isConnected, setIsConnected] = useState(wsTransport.isConnected());
  const [serverRooms, setServerRooms] = useState<PublicRoomInfo[]>([]);
  const [serverRoom, setServerRoom] = useState<RoomState | null>(wsTransport.getCurrentRoom());
  const [myPlayerId, setMyPlayerId] = useState<string>(wsTransport.getMyPlayerId());
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<'ALL' | 'CASUAL' | 'HIGH_STAKES'>('ALL');
  const [currentView, setCurrentView] = useState<'LOBBY' | 'WAITING_ROOM'>('LOBBY');

  // Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isQuickMatchModalOpen, setIsQuickMatchModalOpen] = useState(false);
  const [quickMatchStatus, setQuickMatchStatus] = useState<'SEARCHING' | 'FOUND'>('SEARCHING');

  // Create Room Form state
  const [newTableName, setNewTableName] = useState('Manila VIP Table');
  const [newAnte, setNewAnte] = useState(5);
  const [isPrivateRoom, setIsPrivateRoom] = useState(false);

  // Private code input in Lobby
  const [roomCodeInput, setRoomCodeInput] = useState('');

  // Waiting Room state
  const [copiedCode, setCopiedCode] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMsg[]>([
    { sender: 'System', text: 'Connected to live room. Share room code or add bots!' },
  ]);
  const [chatInputText, setChatInputText] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  // Connect to WebSocket Server & register listeners
  useEffect(() => {
    wsTransport.initConnection();

    const unsubConn = wsTransport.subscribeToConnection((conn) => {
      setIsConnected(conn);
    });

    const unsubRooms = wsTransport.subscribeToRooms((rooms) => {
      setServerRooms(rooms);
    });

    const unsubRoom = wsTransport.subscribeToRoom((room, myId) => {
      setServerRoom(room);
      setMyPlayerId(myId);
      if (room) {
        setCurrentView('WAITING_ROOM');
      } else {
        setCurrentView('LOBBY');
      }
    });

    const unsubChat = wsTransport.subscribeToChat((msg) => {
      setChatMessages((prev) => [
        ...prev,
        {
          sender: msg.senderName,
          text: msg.message,
          isSelf: msg.senderId === wsTransport.getMyPlayerId(),
        },
      ]);
    });

    const unsubErrors = wsTransport.subscribeToErrors((err) => {
      setErrorMessage(err);
      setTimeout(() => setErrorMessage(null), 4000);
    });

    const unsubGameStart = wsTransport.subscribeToGameStart((initialState, pId) => {
      soundManager.playMeld();
      const opponents = initialState.players.filter((p) => p.id !== pId);
      const opp1 = opponents[0] || { name: 'Player 2', avatar: 'avatar_2' };
      const opp2 = opponents[1] || { name: 'Player 3', avatar: 'avatar_3' };

      const currentRoom = wsTransport.getCurrentRoom();

      onJoinTable({
        tableName: currentRoom?.name || 'Live Match',
        ante: currentRoom?.ante || initialState.ante || 5,
        roomCode: currentRoom?.code || 'ONLINE',
        ping: '18ms',
        playerName: initialState.players.find((p) => p.id === pId)?.name || 'You',
        playerAvatar: initialState.players.find((p) => p.id === pId)?.avatar || 'avatar_1',
        opponent1: {
          name: opp1.name,
          avatar: opp1.avatar,
          difficulty: 'MEDIUM',
          personality: 'BALANCED',
        },
        opponent2: {
          name: opp2.name,
          avatar: opp2.avatar,
          difficulty: 'MEDIUM',
          personality: 'BALANCED',
        },
        isServerMultiplayer: true,
        serverPlayerId: pId,
      });
    });

    return () => {
      unsubConn();
      unsubRooms();
      unsubRoom();
      unsubChat();
      unsubErrors();
      unsubGameStart();
    };
  }, [onJoinTable]);

  // Combined room list: server rooms + fallback sample rooms if server room list is empty
  const displayRooms: MultiplayerTableData[] =
    serverRooms.length > 0
      ? serverRooms.map((r) => ({
          id: r.id,
          name: r.name,
          host: r.hostName,
          hostAvatar: r.hostAvatar,
          players: r.playerCount,
          max: r.maxPlayers,
          ante: r.ante,
          ping: '18ms',
          code: r.code,
        }))
      : DEFAULT_SAMPLE_ROOMS;

  const filteredRooms = displayRooms.filter((r) => {
    if (activeTab === 'CASUAL') return r.ante <= 5;
    if (activeTab === 'HIGH_STAKES') return r.ante >= 10;
    return true;
  });

  // Action: Select / Join Table
  const handleSelectTable = (table: MultiplayerTableData) => {
    soundManager.playButtonClick();
    wsTransport.joinRoom({
      roomCode: table.code,
      playerName: 'You',
      playerAvatar: 'avatar_1',
    });
  };

  // Action: Create Table
  const handleCreateTableSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    soundManager.playButtonClick();
    wsTransport.createRoom({
      tableName: newTableName.trim() || 'Custom Room',
      ante: newAnte,
      isPrivate: isPrivateRoom,
      playerName: 'You',
      playerAvatar: 'avatar_1',
    });
    setIsCreateModalOpen(false);
  };

  // Action: Quick Play
  const handleQuickPlay = () => {
    soundManager.playButtonClick();
    setIsQuickMatchModalOpen(true);
    setQuickMatchStatus('SEARCHING');

    setTimeout(() => {
      setQuickMatchStatus('FOUND');
      setTimeout(() => {
        setIsQuickMatchModalOpen(false);
        const openServerRoom = serverRooms.find((r) => r.playerCount < 3);
        if (openServerRoom) {
          wsTransport.joinRoom({
            roomCode: openServerRoom.code,
            playerName: 'You',
            playerAvatar: 'avatar_1',
          });
        } else {
          // Auto create a casual table
          wsTransport.createRoom({
            tableName: 'Quick Match Table',
            ante: 5,
            isPrivate: false,
            playerName: 'You',
            playerAvatar: 'avatar_1',
          });
        }
      }, 750);
    }, 1200);
  };

  // Action: Join by Code
  const handleJoinByCode = (e: React.FormEvent) => {
    e.preventDefault();
    const code = roomCodeInput.trim().toUpperCase();
    if (!code) return;
    soundManager.playButtonClick();
    wsTransport.joinRoom({
      roomCode: code,
      playerName: 'You',
      playerAvatar: 'avatar_1',
    });
    setRoomCodeInput('');
  };

  // Action: Send Chat
  const handleSendChat = (textToSend?: string) => {
    const text = (textToSend || chatInputText).trim();
    if (!text) return;
    soundManager.playButtonClick();
    wsTransport.sendChat(text);
    setChatInputText('');
  };

  // Action: Copy Code
  const handleCopyCode = () => {
    if (!serverRoom) return;
    navigator.clipboard.writeText(serverRoom.code);
    setCopiedCode(true);
    soundManager.playButtonClick();
    setTimeout(() => setCopiedCode(false), 2000);
  };

  // Action: Toggle Ready
  const handleToggleReady = () => {
    soundManager.playButtonClick();
    wsTransport.toggleReady();
  };

  // Action: Fill Bots
  const handleFillBots = () => {
    soundManager.playButtonClick();
    wsTransport.fillBots();
  };

  // Action: Start Game
  const handleStartGame = () => {
    soundManager.playButtonClick();
    wsTransport.startGame();
  };

  // Action: Leave Waiting Room
  const handleLeaveRoom = () => {
    soundManager.playButtonClick();
    wsTransport.leaveRoom();
    setCurrentView('LOBBY');
  };

  // Identify my status in waiting room
  const myPlayer = serverRoom?.players.find((p) => p.id === myPlayerId);
  const isHost = serverRoom?.hostId === myPlayerId;
  const canStart =
    isHost &&
    serverRoom?.players.length === 3 &&
    serverRoom.players.every((p) => p.isReady);

  return (
    <div
      style={{
        position: 'relative',
        width: '100vw',
        height: '100dvh',
        backgroundColor: '#05110d',
        background: 'radial-gradient(ellipse at 50% 30%, #0e3b2e 0%, #061f18 70%, #020906 100%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '20px 16px',
        overflow: 'hidden',
        boxSizing: 'border-box',
      }}
    >
      {/* Top Bar */}
      <div
        style={{
          width: '100%',
          maxWidth: 860,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 12,
          zIndex: 20,
        }}
      >
        <button
          className="action-btn secondary"
          onClick={() => {
            soundManager.playButtonClick();
            if (currentView === 'WAITING_ROOM') {
              handleLeaveRoom();
            } else {
              onBack();
            }
          }}
          style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', fontSize: 12 }}
        >
          <ArrowLeft size={16} />
          <span>{currentView === 'WAITING_ROOM' ? 'LEAVE ROOM' : 'BACK TO MENU'}</span>
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Globe size={20} color="#fbbf24" />
          <h2 className="gold-gradient-text" style={{ fontFamily: 'var(--font-serif)', fontSize: 22, margin: 0 }}>
            {currentView === 'WAITING_ROOM' ? 'LIVE WAITING ROOM' : 'ONLINE MULTIPLAYER'}
          </h2>
        </div>

        {/* Server Status Badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '6px 12px',
              borderRadius: 20,
              background: isConnected ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
              border: isConnected
                ? '1px solid rgba(16, 185, 129, 0.4)'
                : '1px solid rgba(239, 68, 68, 0.4)',
              fontSize: 11,
              fontWeight: 800,
              color: isConnected ? '#10b981' : '#ef4444',
            }}
          >
            <div
              style={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                backgroundColor: isConnected ? '#10b981' : '#ef4444',
                boxShadow: isConnected ? '0 0 8px #10b981' : '0 0 8px #ef4444',
              }}
            />
            <span>{isConnected ? 'SERVER ONLINE' : 'RECONNECTING...'}</span>
          </div>
        </div>
      </div>

      {/* Error Banner Alert */}
      <AnimatePresence>
        {errorMessage && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            style={{
              width: '100%',
              maxWidth: 860,
              padding: '10px 16px',
              marginBottom: 10,
              borderRadius: 12,
              background: 'rgba(239, 68, 68, 0.2)',
              border: '1px solid rgba(239, 68, 68, 0.5)',
              color: '#fca5a5',
              fontSize: 13,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              zIndex: 30,
            }}
          >
            <AlertCircle size={16} color="#ef4444" />
            <span>{errorMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <div style={{ width: '100%', maxWidth: 860, flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
        {currentView === 'LOBBY' || !serverRoom ? (
          /* ==================== LOBBY BROWSER VIEW ==================== */
          <motion.div
            className="glass-panel"
            style={{
              flex: 1,
              borderRadius: 20,
              padding: '20px 24px',
              display: 'flex',
              flexDirection: 'column',
              gap: 16,
              overflowY: 'auto',
            }}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {/* Quick Actions Bar */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                gap: 12,
              }}
            >
              {/* Quick Play Matchmaker */}
              <button
                className="action-btn primary"
                onClick={handleQuickPlay}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  padding: '12px 18px',
                  fontSize: 14,
                  fontWeight: 800,
                  boxShadow: '0 0 20px rgba(245, 158, 11, 0.4)',
                }}
              >
                <Zap size={18} fill="#05110d" />
                <span>QUICK PLAY MATCH</span>
              </button>

              {/* Create Table */}
              <button
                className="action-btn secondary"
                onClick={() => {
                  soundManager.playButtonClick();
                  setIsCreateModalOpen(true);
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  padding: '12px 18px',
                  fontSize: 14,
                  fontWeight: 800,
                  border: '1px solid rgba(245, 158, 11, 0.4)',
                }}
              >
                <Plus size={18} />
                <span>CREATE TABLE</span>
              </button>

              {/* Join by Code Form */}
              <form
                onSubmit={handleJoinByCode}
                style={{
                  display: 'flex',
                  gap: 6,
                  alignItems: 'center',
                }}
              >
                <input
                  type="text"
                  maxLength={6}
                  placeholder="Enter 6-Digit Code"
                  value={roomCodeInput}
                  onChange={(e) => setRoomCodeInput(e.target.value.toUpperCase())}
                  style={{
                    flex: 1,
                    height: '100%',
                    padding: '0 12px',
                    borderRadius: 10,
                    background: 'rgba(255, 255, 255, 0.08)',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    color: '#ffffff',
                    fontSize: 13,
                    fontWeight: 700,
                    letterSpacing: 1,
                    outline: 'none',
                    minHeight: 42,
                    textTransform: 'uppercase',
                  }}
                />
                <button
                  type="submit"
                  className="action-btn secondary"
                  style={{ padding: '0 14px', height: '100%', minHeight: 42, fontSize: 12, fontWeight: 800 }}
                >
                  JOIN
                </button>
              </form>
            </div>

            {/* Filter Tabs */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 }}>
              <div style={{ display: 'flex', gap: 8 }}>
                {(['ALL', 'CASUAL', 'HIGH_STAKES'] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => {
                      soundManager.playButtonClick();
                      setActiveTab(tab);
                    }}
                    style={{
                      padding: '6px 14px',
                      borderRadius: 8,
                      border: activeTab === tab ? '1px solid #fbbf24' : '1px solid rgba(255, 255, 255, 0.1)',
                      background: activeTab === tab ? 'rgba(245, 158, 11, 0.2)' : 'rgba(255, 255, 255, 0.04)',
                      color: activeTab === tab ? '#fbbf24' : 'rgba(255, 255, 255, 0.7)',
                      fontSize: 12,
                      fontWeight: 800,
                      cursor: 'pointer',
                    }}
                  >
                    {tab === 'ALL' && 'All Tables'}
                    {tab === 'CASUAL' && 'Casual (2-5 Ante)'}
                    {tab === 'HIGH_STAKES' && 'High Stakes (10+)'}
                  </button>
                ))}
              </div>
              <span style={{ fontSize: 12, color: 'rgba(255, 255, 255, 0.5)' }}>
                {filteredRooms.length} Tables Available
              </span>
            </div>

            {/* Rooms Grid */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, flex: 1, overflowY: 'auto' }}>
              {filteredRooms.map((room) => (
                <div
                  key={room.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: 12,
                    padding: '12px 16px',
                    borderRadius: 14,
                    backgroundColor: 'rgba(255, 255, 255, 0.04)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    transition: 'all 0.2s ease',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'rgba(245, 158, 11, 0.4)')}
                  onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)')}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 200, flex: 1 }}>
                    <PlayerAvatar avatarId={room.hostAvatar} size={42} name={room.host} />
                    <div style={{ overflow: 'hidden' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span style={{ fontWeight: 800, fontSize: 14, color: '#f3f4f6', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {room.name}
                        </span>
                        {room.isPrivate && <Lock size={12} color="#fbbf24" />}
                      </div>
                      <div style={{ fontSize: 11, color: 'rgba(255, 255, 255, 0.5)', marginTop: 2 }}>
                        Host: <strong style={{ color: '#ffffff' }}>{room.host}</strong> • Code: <code style={{ color: '#fbbf24', letterSpacing: 0.5 }}>{room.code}</code>
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 'clamp(10px, 2vw, 18px)', marginLeft: 'auto', flexWrap: 'wrap' }}>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontWeight: 800, fontSize: 13, color: '#fbbf24' }}>
                        {room.ante} Chips
                      </div>
                      <div style={{ fontSize: 9, color: 'rgba(255, 255, 255, 0.5)', textTransform: 'uppercase' }}>
                        Ante
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: '#10b981' }}>
                      <Wifi size={13} />
                      <span>{room.ping}</span>
                    </div>

                    <div style={{ fontWeight: 700, fontSize: 12, color: '#e2e8f0' }}>
                      👥 {room.players}/{room.max}
                    </div>

                    <button
                      className="action-btn primary"
                      style={{ padding: '7px 16px', fontSize: 11, fontWeight: 800 }}
                      onClick={() => handleSelectTable(room)}
                    >
                      JOIN
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        ) : (
          /* ==================== LIVE WAITING ROOM VIEW ==================== */
          <motion.div
            className="glass-panel"
            style={{
              flex: 1,
              borderRadius: 20,
              padding: '20px 24px',
              display: 'flex',
              flexDirection: 'column',
              gap: 16,
              overflowY: 'auto',
            }}
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            {/* Table Info Bar */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 18px',
                borderRadius: 14,
                background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.12) 0%, rgba(16, 185, 129, 0.12) 100%)',
                border: '1px solid rgba(245, 158, 11, 0.3)',
              }}
            >
              <div>
                <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: '#fbbf24' }}>
                  {serverRoom.name}
                </h3>
                <div style={{ fontSize: 12, color: 'rgba(255, 255, 255, 0.6)', marginTop: 2 }}>
                  Ante: <strong style={{ color: '#ffffff' }}>{serverRoom.ante} Chips</strong> • Starting Side Pot: <strong style={{ color: '#fbbf24' }}>{serverRoom.ante * 3} Chips</strong>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <button
                  onClick={handleCopyCode}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    background: 'rgba(255, 255, 255, 0.08)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    padding: '6px 12px',
                    borderRadius: 8,
                    color: '#ffffff',
                    fontSize: 12,
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  {copiedCode ? <Check size={14} color="#10b981" /> : <Copy size={14} />}
                  <span>{copiedCode ? 'COPIED!' : `ROOM CODE: ${serverRoom.code}`}</span>
                </button>

                <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#10b981', fontSize: 12, fontWeight: 700 }}>
                  <Wifi size={14} />
                  <span>18ms</span>
                </div>
              </div>
            </div>

            {/* 3 Real-time Seats Podiums */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: 'clamp(6px, 1.5vw, 14px)',
                padding: '6px 0',
              }}
            >
              {[0, 1, 2].map((seatIndex) => {
                const player = serverRoom.players[seatIndex];
                const isMe = player?.id === myPlayerId;

                if (player) {
                  return (
                    <div
                      key={player.id}
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: 'clamp(10px, 1.8vh, 18px) clamp(4px, 1.2vw, 12px)',
                        borderRadius: 16,
                        background: isMe ? 'rgba(245, 158, 11, 0.08)' : 'rgba(255, 255, 255, 0.03)',
                        border: isMe ? '1px solid rgba(245, 158, 11, 0.5)' : '1px solid rgba(255, 255, 255, 0.1)',
                        gap: 8,
                        boxShadow: isMe ? '0 0 16px rgba(245, 158, 11, 0.15)' : 'none',
                      }}
                    >
                      <PlayerAvatar
                        avatarId={player.avatar}
                        size="clamp(42px, 8.5vw, 60px)"
                        name={player.name}
                        status={player.isReady ? 'YOUR_TURN' : 'IDLE'}
                      />
                      <div style={{ textAlign: 'center' }}>
                        <div
                          style={{
                            fontWeight: 800,
                            fontSize: 'clamp(11px, 2.4vw, 14px)',
                            color: isMe ? '#fbbf24' : '#f3f4f6',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            maxWidth: '100%',
                          }}
                        >
                          {player.name} {isMe && '(You)'}
                        </div>
                        <div style={{ fontSize: 9, color: player.isHost ? '#fbbf24' : player.isBot ? '#38bdf8' : '#9ca3af', fontWeight: 800, textTransform: 'uppercase' }}>
                          {player.isHost ? 'HOST' : player.isBot ? 'AI BOT' : 'PLAYER'}
                        </div>
                      </div>

                      {/* Ready Toggle or Badge */}
                      {isMe ? (
                        <button
                          onClick={handleToggleReady}
                          style={{
                            padding: '4px 12px',
                            borderRadius: 10,
                            background: player.isReady ? '#10b981' : 'rgba(245, 158, 11, 0.2)',
                            color: '#ffffff',
                            fontSize: 10,
                            fontWeight: 800,
                            border: player.isReady ? 'none' : '1px solid #fbbf24',
                            cursor: 'pointer',
                          }}
                        >
                          {player.isReady ? 'READY ✔' : 'TAP READY'}
                        </button>
                      ) : (
                        <div
                          style={{
                            padding: '3px 8px',
                            borderRadius: 10,
                            background: player.isReady ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255, 255, 255, 0.08)',
                            color: player.isReady ? '#10b981' : 'rgba(255, 255, 255, 0.5)',
                            fontSize: 10,
                            fontWeight: 800,
                          }}
                        >
                          {player.isReady ? 'READY ✔' : 'WAITING...'}
                        </div>
                      )}
                    </div>
                  );
                }

                // Empty Seat Slot
                return (
                  <div
                    key={`empty-${seatIndex}`}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: 'clamp(10px, 1.8vh, 18px) clamp(4px, 1.2vw, 12px)',
                      borderRadius: 16,
                      background: 'rgba(255, 255, 255, 0.02)',
                      border: '1px dashed rgba(255, 255, 255, 0.15)',
                      gap: 8,
                      minHeight: 140,
                    }}
                  >
                    <div
                      style={{
                        width: 'clamp(42px, 8.5vw, 60px)',
                        height: 'clamp(42px, 8.5vw, 60px)',
                        borderRadius: '50%',
                        border: '2px dashed rgba(255, 255, 255, 0.2)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'rgba(255, 255, 255, 0.3)',
                      }}
                    >
                      <Users size={22} />
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontWeight: 700, fontSize: 12, color: 'rgba(255, 255, 255, 0.4)' }}>
                        Empty Seat
                      </div>
                    </div>

                    {isHost ? (
                      <button
                        onClick={handleFillBots}
                        className="action-btn secondary"
                        style={{
                          padding: '4px 10px',
                          fontSize: 10,
                          fontWeight: 800,
                          display: 'flex',
                          alignItems: 'center',
                          gap: 4,
                          borderColor: 'rgba(245, 158, 11, 0.4)',
                          color: '#fbbf24',
                        }}
                      >
                        <UserPlus size={12} />
                        <span>ADD BOT</span>
                      </button>
                    ) : (
                      <div style={{ fontSize: 10, color: 'rgba(255, 255, 255, 0.3)' }}>
                        Waiting...
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Waiting Room Real-time Chat */}
            <div
              style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                borderRadius: 14,
                background: 'rgba(0, 0, 0, 0.3)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                padding: 12,
                minHeight: 140,
              }}
            >
              {/* Messages list */}
              <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 6, paddingRight: 4 }}>
                {chatMessages.map((msg, idx) => (
                  <div
                    key={idx}
                    style={{
                      alignSelf: msg.isSelf ? 'flex-end' : 'flex-start',
                      maxWidth: '80%',
                      padding: '6px 12px',
                      borderRadius: 10,
                      background: msg.isSelf ? 'rgba(245, 158, 11, 0.25)' : 'rgba(255, 255, 255, 0.08)',
                      border: msg.isSelf ? '1px solid rgba(245, 158, 11, 0.4)' : '1px solid rgba(255, 255, 255, 0.06)',
                      fontSize: 12,
                      color: '#f3f4f6',
                    }}
                  >
                    <strong style={{ color: msg.isSelf ? '#fbbf24' : '#60a5fa', marginRight: 6 }}>
                      {msg.sender}:
                    </strong>
                    <span>{msg.text}</span>
                  </div>
                ))}
                <div ref={chatEndRef} />
              </div>

              {/* Quick Chat Chips */}
              <div style={{ display: 'flex', gap: 6, overflowX: 'auto', padding: '8px 0' }}>
                {['Game na! 🔥', 'Good luck! 🃏', 'Tongits master here! 😎', 'All in! 💰', 'Tara laro!'].map((msg) => (
                  <button
                    key={msg}
                    onClick={() => handleSendChat(msg)}
                    style={{
                      padding: '4px 10px',
                      borderRadius: 8,
                      background: 'rgba(255, 255, 255, 0.06)',
                      border: '1px solid rgba(255, 255, 255, 0.12)',
                      color: '#e2e8f0',
                      fontSize: 11,
                      whiteSpace: 'nowrap',
                      cursor: 'pointer',
                    }}
                  >
                    {msg}
                  </button>
                ))}
              </div>

              {/* Chat input */}
              <div style={{ display: 'flex', gap: 8 }}>
                <input
                  type="text"
                  placeholder="Type message to table..."
                  value={chatInputText}
                  onChange={(e) => setChatInputText(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendChat()}
                  style={{
                    flex: 1,
                    padding: '8px 12px',
                    borderRadius: 8,
                    background: 'rgba(255, 255, 255, 0.06)',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    color: '#ffffff',
                    fontSize: 12,
                    outline: 'none',
                  }}
                />
                <button
                  onClick={() => handleSendChat()}
                  className="action-btn secondary"
                  style={{ padding: '8px 14px', fontSize: 12, display: 'flex', alignItems: 'center', gap: 4 }}
                >
                  <Send size={13} />
                  <span>SEND</span>
                </button>
              </div>
            </div>

            {/* Start Match / Waiting Bar */}
            <div style={{ display: 'flex', gap: 12, justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' }}>
              <button
                className="action-btn secondary"
                onClick={handleLeaveRoom}
                style={{ padding: '10px 20px', fontSize: 13 }}
              >
                LEAVE ROOM
              </button>

              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                {isHost && serverRoom.players.length < 3 && (
                  <button
                    className="action-btn secondary"
                    onClick={handleFillBots}
                    style={{ padding: '10px 16px', fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}
                  >
                    <UserPlus size={16} />
                    <span>FILL WITH BOTS</span>
                  </button>
                )}

                {isHost ? (
                  <button
                    className="action-btn primary"
                    disabled={!canStart}
                    onClick={handleStartGame}
                    style={{
                      padding: '12px 28px',
                      fontSize: 15,
                      fontWeight: 800,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      boxShadow: canStart ? '0 0 24px rgba(245, 158, 11, 0.5)' : 'none',
                      opacity: canStart ? 1 : 0.5,
                      cursor: canStart ? 'pointer' : 'not-allowed',
                    }}
                  >
                    <Play size={16} fill="#05110d" />
                    <span>START MATCH NOW</span>
                  </button>
                ) : (
                  <div
                    style={{
                      padding: '10px 18px',
                      borderRadius: 12,
                      background: 'rgba(245, 158, 11, 0.1)',
                      border: '1px solid rgba(245, 158, 11, 0.3)',
                      color: '#fbbf24',
                      fontSize: 13,
                      fontWeight: 700,
                    }}
                  >
                    WAITING FOR HOST TO START MATCH...
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* ==================== CREATE TABLE MODAL ==================== */}
      <AnimatePresence>
        {isCreateModalOpen && (
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              width: '100vw',
              height: '100vh',
              backgroundColor: 'rgba(0, 0, 0, 0.75)',
              backdropFilter: 'blur(6px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 100,
              padding: 16,
            }}
            onClick={() => setIsCreateModalOpen(false)}
          >
            <motion.div
              className="glass-panel"
              style={{
                width: '100%',
                maxWidth: 440,
                borderRadius: 20,
                padding: '26px 28px',
                display: 'flex',
                flexDirection: 'column',
                gap: 18,
                background: 'rgba(15, 23, 42, 0.96)',
                border: '1px solid rgba(245, 158, 11, 0.4)',
                boxShadow: '0 20px 50px rgba(0, 0, 0, 0.8)',
              }}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="gold-gradient-text" style={{ margin: 0, fontSize: 20, fontFamily: 'var(--font-serif)' }}>
                CREATE MULTIPLAYER TABLE
              </h3>

              <form onSubmit={handleCreateTableSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#e2e8f0', marginBottom: 6 }}>
                    Table Name
                  </label>
                  <input
                    type="text"
                    required
                    value={newTableName}
                    onChange={(e) => setNewTableName(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: 10,
                      background: 'rgba(255, 255, 255, 0.08)',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      color: '#ffffff',
                      fontSize: 14,
                      outline: 'none',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#e2e8f0', marginBottom: 8 }}>
                    Ante Stakes (Chips per round)
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 8 }}>
                    {[2, 5, 10, 25, 50].map((ante) => (
                      <button
                        type="button"
                        key={ante}
                        onClick={() => {
                          soundManager.playButtonClick();
                          setNewAnte(ante);
                        }}
                        style={{
                          padding: '8px 0',
                          borderRadius: 8,
                          border: newAnte === ante ? '1px solid #fbbf24' : '1px solid rgba(255, 255, 255, 0.12)',
                          background: newAnte === ante ? 'rgba(245, 158, 11, 0.3)' : 'rgba(255, 255, 255, 0.05)',
                          color: newAnte === ante ? '#fbbf24' : '#ffffff',
                          fontWeight: 800,
                          fontSize: 13,
                          cursor: 'pointer',
                        }}
                      >
                        {ante}
                      </button>
                    ))}
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '4px 0' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Lock size={16} color="#fbbf24" />
                    <span style={{ fontSize: 13, color: '#f3f4f6', fontWeight: 600 }}>Private Match with Room Code</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={isPrivateRoom}
                    onChange={(e) => setIsPrivateRoom(e.target.checked)}
                    style={{ width: 18, height: 18, accentColor: '#f59e0b', cursor: 'pointer' }}
                  />
                </div>

                <div style={{ display: 'flex', gap: 10, marginTop: 8, justifyContent: 'flex-end' }}>
                  <button
                    type="button"
                    className="action-btn secondary"
                    onClick={() => setIsCreateModalOpen(false)}
                    style={{ padding: '10px 18px', fontSize: 13 }}
                  >
                    CANCEL
                  </button>
                  <button
                    type="submit"
                    className="action-btn primary"
                    style={{ padding: '10px 22px', fontSize: 13, fontWeight: 800 }}
                  >
                    CREATE & ENTER
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ==================== QUICK MATCH RADAR MODAL ==================== */}
      <AnimatePresence>
        {isQuickMatchModalOpen && (
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              width: '100vw',
              height: '100vh',
              backgroundColor: 'rgba(0, 0, 0, 0.8)',
              backdropFilter: 'blur(8px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 110,
              padding: 16,
            }}
          >
            <motion.div
              className="glass-panel"
              style={{
                width: '100%',
                maxWidth: 400,
                borderRadius: 24,
                padding: '36px 28px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 20,
                background: 'rgba(15, 23, 42, 0.96)',
                border: '1px solid rgba(245, 158, 11, 0.5)',
                boxShadow: '0 25px 60px rgba(0, 0, 0, 0.8)',
                textAlign: 'center',
              }}
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.85, opacity: 0 }}
            >
              <div style={{ position: 'relative', width: 90, height: 90, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <motion.div
                  style={{
                    position: 'absolute',
                    width: '100%',
                    height: '100%',
                    borderRadius: '50%',
                    border: '2px solid #fbbf24',
                  }}
                  animate={{ scale: [1, 1.8], opacity: [0.8, 0] }}
                  transition={{ duration: 1.4, repeat: Infinity, ease: 'easeOut' }}
                />
                <div
                  style={{
                    width: 70,
                    height: 70,
                    borderRadius: '50%',
                    background: 'radial-gradient(circle, #f59e0b 0%, #b45309 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 0 30px rgba(245, 158, 11, 0.6)',
                  }}
                >
                  <Zap size={32} fill="#05110d" />
                </div>
              </div>

              <div>
                <h3 className="gold-gradient-text" style={{ margin: 0, fontSize: 20, fontFamily: 'var(--font-serif)' }}>
                  {quickMatchStatus === 'SEARCHING' ? 'SEARCHING FOR TABLE...' : 'MATCH FOUND!'}
                </h3>
                <p style={{ fontSize: 13, color: 'rgba(255, 255, 255, 0.7)', marginTop: 6, margin: 0 }}>
                  {quickMatchStatus === 'SEARCHING'
                    ? 'Connecting to live tables on the server...'
                    : 'Joining active room with matched opponents!'}
                </p>
              </div>

              <button
                className="action-btn secondary"
                onClick={() => setIsQuickMatchModalOpen(false)}
                style={{ padding: '8px 20px', fontSize: 12 }}
              >
                CANCEL MATCHMAKING
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
