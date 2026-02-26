# Scribble — Project Followup & Status Report

> **Last Updated:** 21 Feb 2026  
> **Project Type:** System Design based — Real-time Multiplayer Drawing & Guessing Game  
> **Target Scale:** ~1000 concurrent users  
> **Tech Stack:** React.js + Node.js + Express + Socket.io (In-Memory State)

---

## 📊 Overall Progress Summary

| Area | Status | Progress |
|------|--------|----------|
| Backend Core (Server + Socket) | ✅ Done | 100% |
| REST API Routes | ✅ Done | 100% |
| Room Management | ✅ Done | 100% |
| Game Logic (Pictionary Mode) | ✅ Done | 100% |
| Frontend Components | ✅ Done | 100% |
| UI/UX Polish (Advanced Paint) | ✅ Done | 100% |
| Database / Persistence | ❌ Not Started | 0% |
| Authentication (User Accounts) | ❌ Not Started | 0% |
| Scalability (1000+ users) | ❌ Not Started | 0% |
| Deployment (Production) | 🟡 Partial | 20% |
| Testing | ❌ Not Started | 0% |
| Custom Word Lists / Categories | ❌ Not Started | 0% |
| Leaderboard (Global) | ❌ Not Started | 0% |
| Room Browser / Lobby System | ❌ Not Started | 0% |
| Mobile Responsive | 🟡 Partial | 40% |

---

## ✅ COMPLETED — What's Done

### 1. REST API Endpoints (via Express)

| # | Method | Endpoint | Purpose | Status |
|---|--------|----------|---------|--------|
| 1 | `GET` | `/health` | Health check → `{ status, timestamp }` | ✅ Done |
| 2 | `GET` | `/api/rooms` | Get all active rooms → `{ success, rooms[] }` | ✅ Done |
| 3 | `GET` | `/api/rooms/:roomId` | Get room details → `{ success, room }` | ✅ Done |
| 4 | `GET` | `/api/rooms/:roomId/exists` | Check if room exists → `{ exists: boolean }` | ✅ Done |

### 2. Socket.io Events — Client → Server

| # | Event | Payload | Purpose | Status |
|---|-------|---------|---------|--------|
| 1 | `create-room` | `{ roomName, username }` | Create new room | ✅ Done |
| 2 | `join-room` | `{ roomId, username }` | Join existing room | ✅ Done |
| 3 | `drawing` | `{ roomId, drawingData }` | Send drawing strokes | ✅ Done |
| 4 | `clear-canvas` | `{ roomId }` | Clear canvas for all | ✅ Done |
| 5 | `chat-message` | `{ roomId, message }` | Send chat msg / guess | ✅ Done |
| 6 | `start-game` | `{ roomId, settings }` | Start Pictionary game | ✅ Done |
| 7 | `start-round` | `{ roomId }` | Begin new round | ✅ Done |
| 8 | `select-word` | `{ roomId, word }` | Drawer picks word | ✅ Done |
| 9 | `request-hint` | `{ roomId }` | Request letter hint | ✅ Done |
| 10 | `end-round` | `{ roomId }` | End current round | ✅ Done |
| 11 | `disconnect` | — | User disconnects | ✅ Done |

### 3. Socket.io Events — Server → Client

| # | Event | Payload | Purpose | Status |
|---|-------|---------|---------|--------|
| 1 | `room-created` | `{ roomId, roomName, user }` | Room created confirmation | ✅ Done |
| 2 | `room-joined` | `{ roomId, roomName, user, users[], drawingData[], gameState }` | Room join confirmation | ✅ Done |
| 3 | `user-joined` | `{ user }` | New user notification | ✅ Done |
| 4 | `user-left` | `{ user }` | User left notification | ✅ Done |
| 5 | `drawing` | `{ drawingData, userId }` | Drawing data broadcast | ✅ Done |
| 6 | `canvas-cleared` | — | Canvas clear broadcast | ✅ Done |
| 7 | `chat-message` | `{ user, message, timestamp, isGuess }` | Chat message broadcast | ✅ Done |
| 8 | `game-started` | `{ rounds, drawTime }` | Game started notification | ✅ Done |
| 9 | `round-started-drawer` | `{ drawer, wordOptions[], round, totalRounds }` | Round info for drawer | ✅ Done |
| 10 | `round-started-guesser` | `{ drawer, round, totalRounds }` | Round info for guesser | ✅ Done |
| 11 | `word-selected` | `{ word }` or `{ maskedWord, wordLength }` | Word selection broadcast | ✅ Done |
| 12 | `correct-guess` | `{ player, points, word, isFirst, guessOrder }` | Correct guess notification | ✅ Done |
| 13 | `hint-revealed` | `{ hint }` | Hint broadcast | ✅ Done |
| 14 | `round-ended` | `{ word, scores[] }` | Round end + scores | ✅ Done |
| 15 | `game-ended` | `{ winner, scores[] }` | Game over + final scores | ✅ Done |
| 16 | `error` | `{ error }` | Error notification | ✅ Done |

### 4. Backend Models

| # | Model | File | Features | Status |
|---|-------|------|----------|--------|
| 1 | `Room` | `models/Room.js` | Create/Get/Delete rooms, Add/Remove users, Drawing data storage | ✅ Done |
| 2 | `Game` | `models/Game.js` | Game lifecycle, Round management, Word selection, Scoring, Hints, Leaderboard | ✅ Done |

### 5. Frontend Components

| # | Component | File | Features | Status |
|---|-----------|------|----------|--------|
| 1 | `App` | `App.js` | Router, socket hook integration | ✅ Done |
| 2 | `Home` | `Home.js` | Create/Join room forms | ✅ Done |
| 3 | `Room` | `Room.js` | Main game layout — canvas, chat, users, game controls | ✅ Done |
| 4 | `Canvas` | `Canvas.js` | Drawing, eraser, color palette, brush sizes, undo/redo, touch support | ✅ Done |
| 5 | `Chat` | `Chat.js` | Messaging, guess highlighting, correct guess animation, @mentions, autocomplete | ✅ Done |
| 6 | `GameControls` | `GameControls.js` | Settings modal, word selection, timer, drawer/guesser views, hint button | ✅ Done |
| 7 | `UserList` | `UserList.js` | User list with colors | ✅ Done |

### 6. Utilities & Hooks

| # | File | Purpose | Status |
|---|------|---------|--------|
| 1 | `hooks/useSocket.js` | Socket connection + room state management hook | ✅ Done |
| 2 | `utils/socket.js` | SocketService class — emit/listen wrappers | ✅ Done |

### 7. Styling

| # | File | Purpose | Status |
|---|------|---------|--------|
| 1 | `styles/App.css` | Main app styles (13KB) | ✅ Done |
| 2 | `styles/game-styles.css` | Game mode specific styles (5KB) | ✅ Done |
| 3 | `styles/index.css` | Base styles | ✅ Done |

---

## ❌ NOT DONE — Pending Tasks (Prioritized)

### 🔴 Priority 1: Scalability (1000 users target)

Current state: **All state is in-memory (Node.js Map)** — this will NOT scale. Single Node.js process = single point of failure.

| # | Task | Description | Why Needed |
|---|------|-------------|------------|
| 1 | **Redis Adapter for Socket.io** | Use `@socket.io/redis-adapter` so multiple Node.js processes can share socket connections | Without this, Socket.io only works on 1 server |
| 2 | **Redis for Game/Room State** | Move `Room.rooms` and `Game.games` from in-memory `Map` to Redis | State lost on restart; can't scale horizontally |
| 3 | **Sticky Sessions / Load Balancer** | NGINX or AWS ALB with sticky sessions for WebSocket support | Required for multi-instance deployment |
| 4 | **Horizontal Scaling (PM2 Cluster / K8s)** | Run multiple backend instances behind load balancer | Single process caps at ~300-500 concurrent connections |
| 5 | **Connection Pooling & Limits** | Rate limiting, max users per room, connection throttling | Prevent server overload |
| 6 | **Drawing Data Optimization** | Compress/batch drawing events, send diffs instead of full point arrays | Reduce bandwidth per user |
| 7 | **Room Sharding** | Distribute rooms across server instances | Even load distribution |

### 🔴 Priority 2: Database & Persistence

| # | Task | Description |
|---|------|-------------|
| 8 | **PostgreSQL / MongoDB Setup** | Persistent storage for users, rooms, game history |
| 9 | **User Registration & Login** | JWT-based auth with email/username+password |
| 10 | **Game History Storage** | Save completed game results, scores, words used |
| 11 | **Global Leaderboard API** | `GET /api/leaderboard` — Top players across all games |
| 12 | **User Profile API** | `GET /api/users/:id` — Win/loss stats, games played, avg score |

### 🟡 Priority 3: Game Features

| # | Task | Description |
|---|------|-------------|
| 13 | **Custom Word Lists** | Let room creators upload word lists or choose categories |
| 14 | **Word Difficulty Levels** | Filter words by easy/medium/hard during game |
| 15 | **Private Rooms (Password)** | Password-protected rooms |
| 16 | **Public Room Lobby** | Browse and join public rooms from homepage |
| 17 | **Spectator Mode** | Join mid-game as spectator (partially done) |
| 18 | **Kick/Ban Players** | Room host can remove disruptive players |
| 19 | **Reconnection Handling** | Reconnect user to room after disconnect without losing state |
| 20 | **Anti-Cheat** | Prevent word reveal in network tab, server-side guess validation improvements |

### 🟡 Priority 4: Frontend & UX

| # | Task | Description |
|---|------|-------------|
| 21 | **Responsive Mobile Layout** | Full mobile-first redesign for phone screens |
| 22 | **Sound Effects** | Correct guess sound, timer ticking, round start/end |
| 23 | **Animations & Transitions** | Smooth round transitions, score pop-ups, winner celebration |
| 24 | **Emoji Reactions** | Quick emoji reactions to drawings |
| 25 | **Avatar System** | User avatars instead of color circles |
| 26 | **Dark/Light Theme Toggle** | Theme preference |
| 27 | **Canvas Tools — Fill, Shapes** | Fill bucket, rectangle/circle/line tools |

### 🟢 Priority 5: DevOps & Deployment

| # | Task | Description |
|---|------|-------------|
| 28 | **Docker Setup** | Dockerfile for backend + frontend |
| 29 | **Docker Compose** | Full stack with Redis + DB + Backend + Frontend |
| 30 | **CI/CD Pipeline** | GitHub Actions for auto-deploy |
| 31 | **Environment Config** | Production env variables, secrets management |
| 32 | **Monitoring & Logging** | Winston/Morgan for logs, health dashboard |
| 33 | **Error Tracking** | Sentry or similar for production error tracking |
| 34 | **Unit & Integration Tests** | Jest + Supertest for backend, React Testing Library for frontend |
| 35 | **Load Testing** | Artillery/k6 for testing 1000 concurrent users |

---

## 🏗️ Architecture: Current vs Target

### Current Architecture (Single Server)
```
┌──────────────┐     WebSocket      ┌──────────────────────┐
│   React App  │ ◄──────────────►   │  Node.js + Socket.io │
│  (Frontend)  │     HTTP REST      │     (Single Server)  │
│  Port 3000   │ ──────────────►    │      Port 5000       │
└──────────────┘                    │                      │
                                    │  In-Memory:          │
                                    │  ├── Room Map         │
                                    │  └── Game Map         │
                                    └──────────────────────┘
```

### Target Architecture (1000 Users - Scalable)
```
┌──────────────┐          ┌──────────────────┐
│   React App  │          │   NGINX / ALB    │
│   (CDN/S3)   │ ────►    │  Load Balancer   │
└──────────────┘          │  (Sticky Session)│
                          └────────┬─────────┘
                    ┌──────────────┼──────────────┐
                    ▼              ▼              ▼
            ┌────────────┐ ┌────────────┐ ┌────────────┐
            │  Node.js   │ │  Node.js   │ │  Node.js   │
            │ Instance 1 │ │ Instance 2 │ │ Instance 3 │
            └─────┬──────┘ └─────┬──────┘ └─────┬──────┘
                  └──────────────┼──────────────┘
                          ┌──────┴──────┐
                          │    Redis    │
                          │  (Pub/Sub + │
                          │   State)    │
                          └──────┬──────┘
                          ┌──────┴──────┐
                          │ PostgreSQL  │
                          │ (Persistent │
                          │   Data)     │
                          └─────────────┘
```

---

## 📋 Task Board — Phase-Wise Execution Plan

### Phase 1: Infrastructure & Scalability Foundation (Week 1-2)
- [ ] Setup Redis server (local + cloud)
- [ ] Integrate `@socket.io/redis-adapter`
- [ ] Migrate `Room` model from Map → Redis
- [ ] Migrate `Game` model from Map → Redis
- [ ] Setup PostgreSQL database
- [ ] Create DB schema (users, rooms, games, scores)
- [ ] Implement connection pooling
- [ ] Add rate limiting middleware

### Phase 2: Authentication & User System (Week 2-3)
- [ ] User registration API (`POST /api/auth/register`)
- [ ] User login API (`POST /api/auth/login`)
- [ ] JWT middleware for protected routes
- [ ] User profile API (`GET /api/users/:id`)
- [ ] Password hashing (bcrypt)
- [ ] Socket authentication with JWT

### Phase 3: Persistence & Leaderboards (Week 3-4)
- [ ] Save game results to DB after each game
- [ ] Game history API (`GET /api/games/history`)
- [ ] Global leaderboard API (`GET /api/leaderboard`)
- [ ] User stats (wins, total score, games played)
- [ ] Room history logging

### Phase 4: Advanced Game Features (Week 4-5)
- [ ] Custom word list support (API + UI)
- [ ] Word categories (Animals, Food, Tech, etc.)
- [ ] Private rooms with password
- [ ] Public room lobby / browser
- [ ] Reconnection handling
- [ ] Kick/Ban player feature
- [ ] Anti-cheat improvements
- [ ] Spectator full support

### Phase 5: Frontend Polish & Mobile (Week 5-6)
- [ ] Full mobile responsive redesign
- [ ] Sound effects system
- [ ] Smooth animations (round transitions, scores)
- [ ] Canvas tools (fill, shapes)
- [ ] Emoji reactions
- [ ] Avatar system
- [ ] Dark/Light theme

### Phase 6: DevOps & Production (Week 6-7)
- [ ] Dockerize backend & frontend
- [ ] Docker Compose (Redis + PostgreSQL + App)
- [ ] NGINX config with WebSocket support
- [ ] CI/CD pipeline (GitHub Actions)
- [ ] Production environment config
- [ ] Monitoring + Logging (Winston + Morgan)
- [ ] Sentry error tracking
- [ ] PM2 cluster mode setup

### Phase 7: Testing & Load Testing (Week 7-8)
- [ ] Unit tests — Backend models (Jest)
- [ ] Integration tests — Socket events (Jest + Socket.io-client)
- [ ] API tests (Supertest)
- [ ] Frontend tests (React Testing Library)
- [ ] Load test with 1000 concurrent connections (Artillery/k6)
- [ ] Performance benchmarking & optimization

---

## 🗂️ File Structure (Current)

```
scribble/
├── scribble-backend/
│   ├── config/
│   │   └── socket.js              ← Socket.io init + CORS
│   ├── controllers/
│   │   ├── roomController.js      ← REST room endpoints
│   │   └── socketController.js    ← All 11 socket event handlers
│   ├── middleware/
│   │   └── errorHandler.js        ← 404 + global error handler
│   ├── models/
│   │   ├── Game.js                ← Full game state (in-memory Map)
│   │   └── Room.js                ← Room + users + drawing data (in-memory Map)
│   ├── routes/
│   │   └── api.js                 ← 3 REST routes
│   ├── server.js                  ← Express + HTTP + Socket.io server
│   ├── package.json
│   └── .env
│
├── scribble-frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Canvas.js          ← Drawing canvas (500 lines, full-featured)
│   │   │   ├── Chat.js            ← Chat + guesses + autocomplete
│   │   │   ├── GameControls.js    ← Settings, word selection, timer
│   │   │   ├── Home.js            ← Landing page
│   │   │   ├── Room.js            ← Main game layout
│   │   │   └── UserList.js        ← User sidebar
│   │   ├── hooks/
│   │   │   └── useSocket.js       ← Socket connection hook
│   │   ├── utils/
│   │   │   └── socket.js          ← SocketService class
│   │   ├── styles/
│   │   │   ├── App.css            ← Main styles (13KB)
│   │   │   ├── game-styles.css    ← Game mode styles (5KB)
│   │   │   └── index.css          ← Base styles
│   │   ├── App.js                 ← Router + state management
│   │   └── index.js               ← React entry point
│   ├── package.json
│   └── .env
│
├── README.md
└── GAME_MODE_GUIDE.md             ← Detailed game feature docs
```

---

## ⚠️ Known Issues & Tech Debt

| # | Issue | Severity | Details |
|---|-------|----------|---------|
| 1 | In-memory state = data loss on restart | 🔴 Critical | All rooms/games disappear on server restart |
| 2 | Single server = no horizontal scaling | 🔴 Critical | Max ~300-500 connections on single process |
| 3 | No auth = anyone can impersonate anyone | 🟡 Medium | No user verification system |
| 4 | Drawing data grows unbounded | 🟡 Medium | `room.drawingData[]` array grows until room is deleted |
| 5 | Undo/Redo stores base64 images | 🟡 Medium | 20 canvas states as data URLs = memory heavy |
| 6 | Timer is client-side only | 🟡 Medium | Timer can be manipulated; needs server-side enforcement |
| 7 | `alert()` used for notifications | 🟢 Low | Should use toast/snackbar system |
| 8 | `window.location.reload()` for leave room | 🟢 Low | Should clean state properly without full reload |
| 9 | No input sanitization | 🟡 Medium | Chat messages and usernames not sanitized (XSS risk) |
| 10 | Deployed backend URL in `.env` | 🟢 Low | `backend-url=https://scribble-4q2e.onrender.com` in backend `.env` — should be in config |

---

## 🚀 Quick Start (Resume Development)

```bash
# Terminal 1: Backend
cd scribble-backend
npm install
npm run dev        # nodemon on port 5000

# Terminal 2: Frontend
cd scribble-frontend
npm install
npm start          # React on port 3000
```

**Next immediate step:** Start Phase 1 — Redis integration for scalability.
