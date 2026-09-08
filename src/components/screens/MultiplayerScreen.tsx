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
  MessageSquare,
  Send,
  Play,
  LogOut,
  Sparkles,
  Shield,
  Search,
} from 'lucide-react';
import { soundManager } from '../../audio/soundEffects';
import { PlayerAvatar } from '../common/PlayerAvatar';
import { AVATARS_CATALOG } from '../../game/avatars/avatarData';
import { BroadcastGameTransport } from '../../game/network/transport';

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
  opp1: { name: string; avatar: string; difficulty?: 'EASY' | 'MEDIUM' | 'HARD'; personality?: any };
  opp2: { name: string; avatar: string; difficulty?: 'EASY' | 'MEDIUM' | 'HARD'; personality?: any };
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
  }) => void;
}

const DEFAULT_ROOMS: MultiplayerTableData[] = [
  {
    id: 'room-1',
    name: 'Manila Masters (High Stakes)',
    host: 'Rafael',
    hostAvatar: 'avatar-3',
    players: 2,
    max: 3,
    ante: 10,
    ping: '22ms',
    code: 'MNL-99',
    opp1: { name: 'Rafael', avatar: 'avatar-3', difficulty: 'HARD', personality: 'AGGRESSIVE' },
    opp2: { name: 'Sofia', avatar: 'avatar-2', difficulty: 'MEDIUM', personality: 'CONSERVATIVE' },
  },
  {
    id: 'room-2',
    name: 'Cebu Casuals Table',
    host: 'Liza',
    hostAvatar: 'avatar-4',
    players: 2,
    max: 3,
    ante: 2,
    ping: '35ms',
    code: 'CEB-14',
    opp1: { name: 'Liza', avatar: 'avatar-4', difficulty: 'MEDIUM', personality: 'BALANCED' },
    opp2: { name: 'Carlos', avatar: 'avatar-5', difficulty: 'EASY', personality: 'BALANCED' },
  },
  {
    id: 'room-3',
    name: 'Baguio Pro League',
    host: 'Marco',
    hostAvatar: 'avatar-7',
    players: 2,
    max: 3,
    ante: 5,
    ping: '18ms',
    code: 'BAG-88',
    opp1: { name: 'Marco', avatar: 'avatar-7', difficulty: 'HARD', personality: 'AGGRESSIVE' },
    opp2: { name: 'Bea', avatar: 'avatar-6', difficulty: 'MEDIUM', personality: 'BALANCED' },
  },
  {
    id: 'room-4',
    name: 'Davao High Rollers VIP',
    host: 'Anton',
    hostAvatar: 'avatar-9',
    players: 2,
    max: 3,
    ante: 25,
    ping: '28ms',
    code: 'DVO-07',
    opp1: { name: 'Anton', avatar: 'avatar-9', difficulty: 'HARD', personality: 'AGGRESSIVE' },
    opp2: { name: 'Maya', avatar: 'avatar-8', difficulty: 'HARD', personality: 'CONSERVATIVE' },
  },
];

interface ChatMsg {
  sender: string;
  text: string;
  isSelf?: boolean;
}

export const MultiplayerScreen: React.FC<MultiplayerScreenProps> = ({ onBack, onJoinTable }) => {
  const [rooms, setRooms] = useState<MultiplayerTableData[]>(() => {
    try {
      const saved = sessionStorage.getItem('tongits_custom_rooms');
      if (saved) {
        const parsed = JSON.parse(saved);
        return [...parsed, ...DEFAULT_ROOMS];
      }
    } catch {
      // fallback
    }
    return DEFAULT_ROOMS;
  });

  const [activeTab, setActiveTab] = useState<'ALL' | 'CASUAL' | 'HIGH_STAKES'>('ALL');
  const [currentView, setCurrentView] = useState<'LOBBY' | 'WAITING_ROOM'>('LOBBY');
  const [activeRoom, setActiveRoom] = useState<MultiplayerTableData | null>(null);

  // Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isQuickMatchModalOpen, setIsQuickMatchModalOpen] = useState(false);
  const [quickMatchStatus, setQuickMatchStatus] = useState<'SEARCHING' | 'FOUND'>('SEARCHING');

  // Create Room Form state
  const [newTableName, setNewTableName] = useState('My Manila VIP Table');
  const [newAnte, setNewAnte] = useState(5);
  const [isPrivateRoom, setIsPrivateRoom] = useState(false);

  // Private code input in Lobby
  const [roomCodeInput, setRoomCodeInput] = useState('');
  const [codeError, setCodeError] = useState('');

  // Waiting Room state
  const [isReady, setIsReady] = useState(true);
  const [copiedCode, setCopiedCode] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMsg[]>([
    { sender: 'System', text: 'Welcome to table lobby! Tap Ready to begin.' },
  ]);
  const [chatInputText, setChatInputText] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);
  const transportRef = useRef<BroadcastGameTransport | null>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  // Cleanup transport on unmount
  useEffect(() => {
    return () => {
      transportRef.current?.disconnect();
    };
  }, []);

  // Filtered rooms
  const filteredRooms = rooms.filter((r) => {
    if (activeTab === 'CASUAL') return r.ante <= 5;
    if (activeTab === 'HIGH_STAKES') return r.ante >= 10;
    return true;
  });

  // Action: Enter Waiting Room for a table
  const handleSelectTable = (table: MultiplayerTableData) => {
    soundManager.playButtonClick();
    setActiveRoom(table);
    setIsReady(true);
    setCurrentView('WAITING_ROOM');

    // Init cross-tab transport
    transportRef.current?.disconnect();
    const transport = new BroadcastGameTransport();
    transportRef.current = transport;
    transport.connect(table.code, 'human-player');
    transport.subscribeToEvents((ev) => {
      if (ev.type === 'CHAT') {
        setChatMessages((prev) => [
          ...prev,
          { sender: ev.payload.senderName || 'Opponent', text: ev.payload.message },
        ]);
      }
    });

    setChatMessages([
      { sender: 'System', text: `Joined ${table.name}. Ante: ${table.ante} Chips.` },
      { sender: table.host, text: 'Welcome to the table! Game na! 🃏' },
    ]);
  };

  // Action: Create Table
  const handleCreateTableSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    soundManager.playButtonClick();

    const randomSuffix = Math.floor(100 + Math.random() * 900);
    const code = `VIP-${randomSuffix}`;
    const newRoom: MultiplayerTableData = {
      id: `room-custom-${Date.now()}`,
      name: newTableName.trim() || 'Custom Room',
      host: 'You',
      hostAvatar: 'avatar-1',
      players: 1,
      max: 3,
      ante: newAnte,
      ping: '16ms',
      code,
      isPrivate: isPrivateRoom,
      opp1: { name: 'Elena', avatar: 'avatar-10', difficulty: 'MEDIUM', personality: 'BALANCED' },
      opp2: { name: 'Dante', avatar: 'avatar-11', difficulty: 'HARD', personality: 'AGGRESSIVE' },
    };

    const updated = [newRoom, ...rooms];
    setRooms(updated);
    try {
      sessionStorage.setItem('tongits_custom_rooms', JSON.stringify([newRoom]));
    } catch {
      // ignore
    }

    setIsCreateModalOpen(false);
    handleSelectTable(newRoom);
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
        const randomTable = rooms[Math.floor(Math.random() * rooms.length)];
        handleSelectTable(randomTable);
      }, 900);
    }, 1200);
  };

  // Action: Join by Code
  const handleJoinByCode = (e: React.FormEvent) => {
    e.preventDefault();
    setCodeError('');
    const codeClean = roomCodeInput.trim().toUpperCase();
    if (!codeClean) return;

    const matched = rooms.find((r) => r.code.toUpperCase() === codeClean);
    if (matched) {
      handleSelectTable(matched);
      setRoomCodeInput('');
    } else {
      // Create a temporary private room with this code so friends can connect
      const customTable: MultiplayerTableData = {
        id: `room-code-${codeClean}`,
        name: `Private Table (${codeClean})`,
        host: 'Challenger',
        hostAvatar: 'avatar-14',
        players: 2,
        max: 3,
        ante: 5,
        ping: '21ms',
        code: codeClean,
        isPrivate: true,
        opp1: { name: 'Mateo', avatar: 'avatar-13', difficulty: 'MEDIUM', personality: 'BALANCED' },
        opp2: { name: 'Carmen', avatar: 'avatar-12', difficulty: 'HARD', personality: 'CONSERVATIVE' },
      };
      setRooms((prev) => [customTable, ...prev]);
      handleSelectTable(customTable);
      setRoomCodeInput('');
    }
  };

  // Action: Send Chat
  const handleSendChat = (textToSend?: string) => {
    const text = (textToSend || chatInputText).trim();
    if (!text) return;
    soundManager.playButtonClick();
    setChatMessages((prev) => [...prev, { sender: 'You', text, isSelf: true }]);
    setChatInputText('');

    transportRef.current?.sendChat(text);

    // Occasional simulated friendly bot reply
    if (Math.random() > 0.4 && activeRoom) {
      setTimeout(() => {
        const replies = ['Game na!', 'Good luck!', 'Laban lang! 🃏', 'Nice! Tara laro!'];
        const randomOpp = Math.random() > 0.5 ? activeRoom.opp1.name : activeRoom.opp2.name;
        const randomReply = replies[Math.floor(Math.random() * replies.length)];
        setChatMessages((prev) => [...prev, { sender: randomOpp, text: randomReply }]);
      }, 1200);
    }
  };

  // Action: Copy Code
  const handleCopyCode = () => {
    if (!activeRoom) return;
    navigator.clipboard.writeText(activeRoom.code);
    setCopiedCode(true);
    soundManager.playButtonClick();
    setTimeout(() => setCopiedCode(false), 2000);
  };

  // Action: Launch Match
  const handleStartMatch = () => {
    if (!activeRoom) return;
    soundManager.playMeld();
    onJoinTable({
      tableName: activeRoom.name,
      ante: activeRoom.ante,
      roomCode: activeRoom.code,
      ping: activeRoom.ping,
      playerName: 'You',
      playerAvatar: 'avatar-1',
      opponent1: activeRoom.opp1,
      opponent2: activeRoom.opp2,
    });
  };

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
          maxWidth: 820,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 14,
          zIndex: 20,
        }}
      >
        <button
          className="action-btn secondary"
          onClick={() => {
            soundManager.playButtonClick();
            if (currentView === 'WAITING_ROOM') {
              setCurrentView('LOBBY');
            } else {
              onBack();
            }
          }}
          style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', fontSize: 12 }}
        >
          <ArrowLeft size={16} />
          <span>{currentView === 'WAITING_ROOM' ? 'LEAVE TABLE' : 'BACK TO MENU'}</span>
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Globe size={20} color="#fbbf24" />
          <h2 className="gold-gradient-text" style={{ fontFamily: 'var(--font-serif)', fontSize: 22, margin: 0 }}>
            {currentView === 'WAITING_ROOM' ? 'TABLE LOBBY' : 'ONLINE MULTIPLAYER'}
          </h2>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '6px 12px',
              borderRadius: 20,
              background: 'rgba(16, 185, 129, 0.15)',
              border: '1px solid rgba(16, 185, 129, 0.4)',
              fontSize: 11,
              fontWeight: 800,
              color: '#10b981',
            }}
          >
            <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#10b981', boxShadow: '0 0 8px #10b981' }} />
            <span>ONLINE LOBBY</span>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div style={{ width: '100%', maxWidth: 820, flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
        {currentView === 'LOBBY' ? (
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
                  placeholder="Enter Code (e.g. MNL-99)"
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
                    fontSize: 12,
                    fontWeight: 700,
                    outline: 'none',
                    minHeight: 42,
                  }}
                />
                <button
                  type="submit"
                  className="action-btn secondary"
                  style={{ padding: '0 14px', height: '100%', minHeight: 42, fontSize: 12 }}
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
                {filteredRooms.length} Active Tables
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
                        Host: <strong style={{ color: '#ffffff' }}>{room.host}</strong> • Code: <code style={{ color: '#fbbf24' }}>{room.code}</code>
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
          /* ==================== WAITING ROOM / STAGING VIEW ==================== */
          activeRoom && (
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
                    {activeRoom.name}
                  </h3>
                  <div style={{ fontSize: 12, color: 'rgba(255, 255, 255, 0.6)', marginTop: 2 }}>
                    Ante: <strong style={{ color: '#ffffff' }}>{activeRoom.ante} Chips</strong> • Starting Side Pot: <strong style={{ color: '#fbbf24' }}>{activeRoom.ante * 3} Chips</strong>
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
                    <span>{copiedCode ? 'COPIED!' : `CODE: ${activeRoom.code}`}</span>
                  </button>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#10b981', fontSize: 12, fontWeight: 700 }}>
                    <Wifi size={14} />
                    <span>{activeRoom.ping}</span>
                  </div>
                </div>
              </div>

              {/* 3 Seats Podiums */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: 'clamp(6px, 1.5vw, 14px)',
                  padding: '6px 0',
                }}
              >
                {/* Seat 1: Host */}
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: 'clamp(10px, 1.8vh, 18px) clamp(4px, 1.2vw, 12px)',
                    borderRadius: 16,
                    background: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid rgba(245, 158, 11, 0.25)',
                    gap: 8,
                  }}
                >
                  <PlayerAvatar avatarId={activeRoom.hostAvatar} size="clamp(42px, 8.5vw, 60px)" name={activeRoom.host} />
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontWeight: 800, fontSize: 'clamp(11px, 2.4vw, 14px)', color: '#f3f4f6', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '100%' }}>{activeRoom.host}</div>
                    <div style={{ fontSize: 9, color: '#fbbf24', fontWeight: 800, textTransform: 'uppercase' }}>
                      HOST
                    </div>
                  </div>
                  <div
                    style={{
                      padding: '3px 8px',
                      borderRadius: 10,
                      background: 'rgba(16, 185, 129, 0.2)',
                      color: '#10b981',
                      fontSize: 10,
                      fontWeight: 800,
                    }}
                  >
                    READY ✔
                  </div>
                </div>

                {/* Seat 2: You */}
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: 'clamp(10px, 1.8vh, 18px) clamp(4px, 1.2vw, 12px)',
                    borderRadius: 16,
                    background: 'rgba(245, 158, 11, 0.08)',
                    border: '1px solid rgba(245, 158, 11, 0.5)',
                    gap: 8,
                    boxShadow: '0 0 16px rgba(245, 158, 11, 0.15)',
                  }}
                >
                  <PlayerAvatar avatarId="avatar-1" size="clamp(42px, 8.5vw, 60px)" name="You" status={isReady ? 'YOUR_TURN' : 'IDLE'} />
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontWeight: 800, fontSize: 'clamp(11px, 2.4vw, 14px)', color: '#fbbf24' }}>You</div>
                    <div style={{ fontSize: 9, color: '#9ca3af', fontWeight: 700 }}>100 Chips</div>
                  </div>
                  <button
                    onClick={() => {
                      soundManager.playButtonClick();
                      setIsReady((prev) => !prev);
                    }}
                    style={{
                      padding: '3px 10px',
                      borderRadius: 10,
                      background: isReady ? '#10b981' : 'rgba(255, 255, 255, 0.1)',
                      color: '#ffffff',
                      fontSize: 10,
                      fontWeight: 800,
                      border: 'none',
                      cursor: 'pointer',
                    }}
                  >
                    {isReady ? 'READY ✔' : 'TAP READY'}
                  </button>
                </div>

                {/* Seat 3: Opponent 2 */}
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: 'clamp(10px, 1.8vh, 18px) clamp(4px, 1.2vw, 12px)',
                    borderRadius: 16,
                    background: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    gap: 8,
                  }}
                >
                  <PlayerAvatar avatarId={activeRoom.opp2.avatar} size="clamp(42px, 8.5vw, 60px)" name={activeRoom.opp2.name} />
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontWeight: 800, fontSize: 'clamp(11px, 2.4vw, 14px)', color: '#f3f4f6', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '100%' }}>{activeRoom.opp2.name}</div>
                    <div style={{ fontSize: 9, color: '#9ca3af', fontWeight: 700 }}>Challenger</div>
                  </div>
                  <div
                    style={{
                      padding: '3px 8px',
                      borderRadius: 10,
                      background: 'rgba(16, 185, 129, 0.2)',
                      color: '#10b981',
                      fontSize: 10,
                      fontWeight: 800,
                    }}
                  >
                    READY ✔
                  </div>
                </div>
              </div>

              {/* Waiting Room Chat & Reactions */}
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

              {/* Start Match Action Button */}
              <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', alignItems: 'center' }}>
                <button
                  className="action-btn secondary"
                  onClick={() => {
                    soundManager.playButtonClick();
                    setCurrentView('LOBBY');
                  }}
                  style={{ padding: '10px 20px', fontSize: 13 }}
                >
                  LEAVE TABLE
                </button>

                <button
                  className="action-btn primary"
                  disabled={!isReady}
                  onClick={handleStartMatch}
                  style={{
                    padding: '12px 28px',
                    fontSize: 15,
                    fontWeight: 800,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    boxShadow: '0 0 24px rgba(245, 158, 11, 0.5)',
                    opacity: isReady ? 1 : 0.6,
                    cursor: isReady ? 'pointer' : 'not-allowed',
                  }}
                >
                  <Play size={16} fill="#05110d" />
                  <span>START MATCH NOW</span>
                </button>
              </div>
            </motion.div>
          )
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
                CREATE CUSTOM TABLE
              </h3>

              <form onSubmit={handleCreateTableSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {/* Table Name */}
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

                {/* Ante Stakes Selection */}
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

                {/* Private Room Toggle */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '4px 0' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Lock size={16} color="#fbbf24" />
                    <span style={{ fontSize: 13, color: '#f3f4f6', fontWeight: 600 }}>Private Match with Code</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={isPrivateRoom}
                    onChange={(e) => setIsPrivateRoom(e.target.checked)}
                    style={{ width: 18, height: 18, accentColor: '#f59e0b', cursor: 'pointer' }}
                  />
                </div>

                {/* Actions */}
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
              {/* Radar Icon / Pulse */}
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
                    ? 'Connecting to active players in the Manila & Cebu region...'
                    : 'Joining room with matched opponents!'}
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
