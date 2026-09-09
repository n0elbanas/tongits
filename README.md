# 🎴 Tong-Its Casino (Classic Filipino Card Game)

[![React 19](https://img.shields.io/badge/React-19.2-61dafb?logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-6.0-3178c6?logo=typescript)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-8.2-646cff?logo=vite)](https://vitejs.dev/)
[![Vitest](https://img.shields.io/badge/Tests-30%20Passing-brightgreen?logo=vitest)](https://vitest.dev/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A modern, tactile, single-page web implementation of **Tong-Its**, the beloved 3-player rummy card game from the Philippines. Built with **React 19**, **TypeScript**, and **Vite**, featuring authentic game rules, intelligent heuristic AI bots, multiplayer waiting lobbies, rich velvet felt aesthetics, custom card decks, and mobile landscape optimization.

---

## ✨ Features

### 🃏 Authentic Tong-Its Rules Engine
- **Accurate Dealing**: 13 cards dealt to the dealer, 12 cards to each of the two other players.
- **Melds (*Bahay*)**: Form valid 3+ card sets (Three-of-a-Kind, Four-of-a-Kind) and straight flushes/runs in the same suit.
- **Sapaw (Lay-Off)**: Add cards from your hand onto your own or opponents' exposed melds on the table.
- **Draw / Fight Call**: Call a Draw to challenge opponents when your deadwood point count is low. Enforces canonical rules:
  - You must have opened at least one meld.
  - You cannot call Draw if you took a discarded card on the current turn (*Sapped/Bawal*).
  - Opponents can either **Fold** or **Challenge** if their deadwood count is competitive.
- **End-Game Scoring & Showdown**:
  - **Tong-Its**: Emptying your entire hand through melds, sapaw, and final discard.
  - **Stock Out**: When the draw pile runs dry, the player with the lowest deadwood score wins the side pot.
  - **Burn Penalty (*Sunog*)**: Players who fail to expose a meld by the end of the round receive maximum penalty points.

### 🤖 Intelligent AI Opponents
- 3 Distinct bot personalities:
  - **Marco (Aggressive)**: Plays fast, exposes melds early, and calls Draw aggressively when deadwood is moderate.
  - **Sofia (Conservative)**: Conceals cards until late round, waits for high-probability runs, and minimizes risk.
  - **Leo (Balanced)**: Adaptable playstyle balancing defensive holding and timely meld exposures.
- 3 Difficulty settings: **Easy**, **Medium**, and **Hard**.
- **Player-Bot Self-Exclusion**: Guarantees your chosen character avatar never appears as a competing bot opponent.

### 🎨 Rich Casino Aesthetics & Custom Decks
- **Card Faces**: Choose between **Bicycle Classic** (traditional look) and **Premium** (luxurious ornate court faces).
- **5 Exclusive Card Backs**:
  1. **Classic Royal**: Deep midnight navy & regal gold crown with Victorian filigree.
  2. **Vintage Elegance**: Velvet crimson & 8-petal blooming floral rosette.
  3. **Modern Geometric**: Onyx charcoal & sacred diamond geometry.
  4. **Ocean Mystic**: Indigo sea waves & 8-point nautical compass star.
  5. **Phoenix Flame**: Obsidian black & fiery twin phoenix with eternal flame.
- **Table Themes**: Emerald Velvet, Royal Blue, and Crimson Felt surfaces with realistic card shadows and gold foil accents.
- **Synthesized Audio**: Procedural Web Audio API sound effects (card flicks, chip rattles, victory fanfare, and button clicks) with zero external audio latency.

### 📱 Mobile Landscape Optimization
- **Auto Orientation Prompt**: Displays an animated, semi-transparent phone rotation guide when accessed on portrait mobile screens, inviting players to rotate into landscape.
- **Widescreen Layout**: In landscape orientation, cards expand to touch-friendly sizes (`clamp(56px, 8.4vw, 76px)`) with crisp corner rank visibility.
- **No Overlap / No Cutoff**: Hand cards fan smoothly with calibrated spacing; stock and discard piles position side-by-side with table melds to maximize screen real estate.

### 🌐 Multiplayer Room Simulator
- Room creation and joining with 6-digit room codes.
- Dynamic seat podiums with ready toggles.
- Quick chat reaction wheel and simulated connection ping indicators.

---

## 📁 Project Structure

```text
TongIts/
├── index.html                  # HTML entry point with viewport-fit=cover
├── public/
│   ├── cards/
│   │   ├── classic/            # Bicycle Classic card face images (52 cards)
│   │   ├── premium/            # Premium ornate card face images (52 cards)
│   │   └── backs/              # 5 High-res 5:7 card back designs
│   └── avatars/                # Player and bot avatar portraits (25 avatars)
├── src/
│   ├── audio/
│   │   └── soundEffects.ts     # Synthesized Web Audio API sound engine
│   ├── components/
│   │   ├── actions/
│   │   │   └── ActionBar.tsx   # Player turn buttons (Draw, Meld, Sapaw, Discard, Call Draw)
│   │   ├── cards/
│   │   │   ├── CardBack.tsx    # Dynamic card back component & design gallery
│   │   │   ├── Hand.tsx        # Player card fan with elevation & gesture support
│   │   │   └── PlayingCard.tsx # Responsive card component (front & back)
│   │   ├── modals/
│   │   │   ├── DiscardHistoryModal.tsx  # Chronological & suit matrix graveyard view
│   │   │   ├── DrawModal.tsx            # Fold vs Challenge response modal
│   │   │   ├── ScoreboardModal.tsx      # Round summary & deadwood score breakdown
│   │   │   ├── SetupModal.tsx           # Solo match setup & avatar selection
│   │   │   └── VictoryModal.tsx         # Tong-Its victory banner & confetti
│   │   ├── screens/
│   │   │   ├── GameTable.tsx            # Main felt surface & game orchestrator
│   │   │   ├── HomeScreen.tsx           # Casino main menu & game mode selection
│   │   │   ├── MultiplayerScreen.tsx    # Online lobby, room browser & waiting room
│   │   │   ├── SettingsScreen.tsx       # Card face, card back, and audio settings
│   │   │   └── TutorialScreen.tsx       # Interactive guide to Tong-Its rules
│   │   ├── table/
│   │   │   ├── DiscardPile.tsx          # Interactive discard pile & dump history
│   │   │   ├── MeldArea.tsx             # Table exposed melds with Sapaw targeting
│   │   │   ├── PlayerArea.tsx           # Opponent cards, status rings & dealer button
│   │   │   └── StockPile.tsx            # Stepped physical deck illusion
│   │   └── ui/
│   │       └── OrientationPrompt.tsx    # Animated rotating phone overlay for mobile
│   ├── context/
│   │   └── DeckStyleContext.tsx         # Persistent deck styling & theme context
│   ├── game/
│   │   ├── ai/
│   │   │   ├── aiPlayer.ts              # Bot turn runner and decision dispatcher
│   │   │   ├── evaluation.ts            # Hand evaluation & discard heuristics
│   │   │   └── personalities.ts         # Bot personality archetypes & thresholds
│   │   ├── engine/
│   │   │   ├── cards.ts                 # Card deck generator, shuffler & rank values
│   │   │   ├── gameState.ts             # State transitions, phases, turn cycles
│   │   │   ├── melds.ts                 # Meld detection (Sets, Straight Flushes, Sapaw)
│   │   │   ├── rules.ts                 # Turn validations & Draw call legality
│   │   │   └── scoring.ts               # Deadwood tally, winner resolution & payouts
│   │   └── tests/                       # 30 Unit tests (melds, scoring, rules, deck)
│   └── styles/
│       ├── cards.css                    # Responsive playing card styling
│       ├── index.css                    # Design tokens, typography & CSS variables
│       └── table.css                    # Velvet felt table & layout media queries
├── package.json
└── vite.config.ts
```

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (version 18.0 or higher)
- [npm](https://www.npmjs.com/) (version 9.0 or higher)

### Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/YOUR_USERNAME/TongIts.git
   cd TongIts
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```
   Open your browser and navigate to `http://localhost:5173`.

---

## 🧪 Testing & Quality Checks

Run the automated test suite powered by [Vitest](https://vitest.dev/):

```bash
# Run all unit tests
npx vitest run

# Run tests in watch mode
npm run test
```

Build validation:
```bash
# Typecheck and build the production bundle
npm run build
```

---

## 🌐 Real-Time Multiplayer Backend & Deployment (Hostinger VPS with Caddy)

Tong-Its includes both a high-performance static frontend and an **authoritative Node.js WebSocket backend** (`server/index.ts`) supporting live 3-player rooms, 6-character room codes, anti-cheat card masking, and hybrid human/AI matchmaking.

---

### Local Development (Frontend + Backend)

To test multiplayer locally across multiple browser tabs:

1. In Terminal 1, run the WebSocket server:
   ```bash
   npm run server
   ```
   *Runs on `ws://localhost:3001/ws`.*

2. In Terminal 2, run the Vite development server:
   ```bash
   npm run dev
   ```
   *The Vite dev server automatically proxies `/ws` requests to `ws://localhost:3001`.*

3. Open `http://localhost:5173` in two different browser windows or incognito sessions to create and join rooms with real players!

---

### Production Deployment (Hostinger VPS with Caddy)

#### 1. Connect to VPS & Install Prerequisites
```bash
ssh root@YOUR_VPS_IP

# Update packages and install Caddy + Node.js LTS
apt update && apt upgrade -y
apt install -y debian-keyring debian-archive-keyring apt-transport-https curl git

# Install Caddy
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | tee /etc/apt/sources.list.d/caddy-stable.list
apt update && apt install -y caddy

# Install Node.js 22 LTS
curl -fsSL https://deb.nodesource.com/setup_22.x | bash -
apt install -y nodejs
```

#### 2. Clone Repository & Build Frontend
```bash
mkdir -p /var/www/tongits
cd /var/www/tongits
git clone https://github.com/YOUR_USERNAME/TongIts.git .
npm install
npm run build
chown -R caddy:caddy /var/www/tongits/dist
```

#### 3. Run WebSocket Backend (Choose PM2 or Systemd)

##### Option A: Using PM2 (Recommended for Easy Process Management & Logs)

1. Install PM2 globally:
   ```bash
   npm install -g pm2
   ```

2. Start the WebSocket server using the included `ecosystem.config.cjs`:
   ```bash
   cd /var/www/tongits
   pm2 start ecosystem.config.cjs
   ```
   *(Alternatively, run via npm: `pm2 start npm --name "tongits-server" -- run server`)*

3. Configure PM2 to restart automatically on server reboots:
   ```bash
   pm2 startup
   # (Copy-paste the sudo command output by the above line, then run:)
   pm2 save
   ```

4. Useful PM2 commands:
   ```bash
   pm2 status               # Check server status
   pm2 logs tongits-server  # View live real-time logs
   pm2 restart tongits-server
   pm2 stop tongits-server
   ```

---

##### Option B: Using Systemd Service

Create the systemd service file:
```bash
nano /etc/systemd/system/tongits-server.service
```

Paste the following configuration:
```ini
[Unit]
Description=Tong-Its Real-Time WebSocket Game Server
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/var/www/tongits
ExecStart=/usr/bin/npm run server
Restart=always
RestartSec=5
Environment=NODE_ENV=production
Environment=PORT=5005
Environment=HOST=127.0.0.1

[Install]
WantedBy=multi-user.target
```

Enable and start the service:
```bash
chown -R www-data:www-data /var/www/tongits
systemctl daemon-reload
systemctl enable tongits-server
systemctl start tongits-server
systemctl status tongits-server
```

#### 4. Configure `/etc/caddy/Caddyfile`
Caddy handles automatic HTTPS (SSL) and routes WebSocket traffic to port 5005 while serving frontend static files:

```caddyfile
tongits.grenoma.cloud {
    # 1. Reverse proxy WebSocket connections & health check to Node.js backend
    handle /ws* {
        reverse_proxy 127.0.0.1:5005
    }

    handle /health {
        reverse_proxy 127.0.0.1:5005
    }

    # 2. Serve static React single-page application
    handle {
        root * /opt/tongits/dist
        encode gzip zstd
        try_files {path} /index.html
        file_server
    }

    # 3. Cache static assets for high performance
    @static {
        path /assets/* /cards/* /avatars/* *.ico *.svg *.webp *.jpg *.png
    }
    header @static Cache-Control "public, max-age=2592000, immutable"

    # Security headers
    header {
        X-Content-Type-Options nosniff
        X-Frame-Options DENY
        Referrer-Policy strict-origin-when-cross-origin
    }
}
```

#### 5. Reload Caddy
```bash
systemctl restart caddy
systemctl enable caddy
```
*Caddy will automatically generate and renew Let's Encrypt SSL certificates for your domain.*

---

## 📜 How to Play Tong-Its (Quick Guide)

1. **The Objective**: Minimize the total point value of unmelded cards (*deadwood*) in your hand or empty your hand completely before the draw pile is exhausted.
2. **Card Values**:
   - **Aces**: 1 point
   - **2 to 9**: Face value (2–9 points)
   - **10, Jack, Queen, King**: 10 points each
3. **Turn Progression**:
   - **Draw**: Take the top card from the stock pile, or pick up the latest discard if it immediately completes a meld in your hand.
   - **Meld (Optional)**: Expose a valid set or straight flush on the table.
   - **Sapaw (Optional)**: Extend any exposed meld on the table with cards from your hand.
   - **Discard**: End your turn by throwing one card into the discard pile.
4. **Winning**:
   - **Tong-Its**: Expose or lay off every card in your hand with a final discard.
   - **Draw Call**: Challenge opponents when you believe your deadwood score is the lowest.
   - **Stock Out**: Lowest remaining points when the draw pile runs out wins the pot.

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
