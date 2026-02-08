# Scribble 🎨

Scribble is a real-time multiplayer drawing and guessing game (Pictionary-style) built with the PERN/MERN stack concepts (currently using **React**, **Node.js**, **Express**, and **Socket.io**).

Players can create or join rooms, take turns drawing words, and guess what others are drawing in real-time to earn points.

![Scribble Demo](https://via.placeholder.com/800x400?text=Scribble+Game+Preview)

## 🚀 Features

- **Real-time Collaboration**: Instant drawing updates across all clients using Socket.io.
- **Game Rooms**: Create private rooms to play with friends.
- **Game Logic**:
  - Turn-based drawing system.
  - Word selection (3 options).
  - Scoring system based on speed and accuracy.
  - Real-time leaderboard.
- **Chat System**: Integrated chat for guessing and communication.
- **Responsive Design**: Works on desktop and tablets.

## 🛠️ Tech Stack

- **Frontend**: React.js, Socket.io-client, CSS3
- **Backend**: Node.js, Express, Socket.io
- **State Management**: In-memory (Game state managed on server)

## 📦 Installation & Setup

### Prerequisites

- [Node.js](https://nodejs.org/) (v14 or higher)
- [Git](https://git-scm.com/)

### 1. Clone the Repository

```bash
git clone https://github.com/shivam543210/scribble.git
cd scribble
```

### 2. Backend Setup

Navigate to the backend directory and install dependencies:

```bash
cd scribble-backend
npm install
```

Start the backend server:

```bash
npm start
# Server runs on http://localhost:5000 (default)
```

### 3. Frontend Setup

Open a new terminal, navigate to the frontend directory and install dependencies:

```bash
cd scribble-frontend
npm install
```

Start the React development server:

```bash
npm start
# App runs on http://localhost:3000
```

## 🎮 How to Play

1.  Open the app in your browser.
2.  Enter a username and create a room (or join an existing one).
3.  Share the Room ID with friends.
4.  Once everyone handles joined, the host can **Start Game**.
5.  **Drawer**: Choose a word and draw it on the canvas.
6.  **Guessers**: Type your guess in the chat box. Correct guesses turn green!
7.  The player with the most points after all rounds wins!

## 🤝 Contributing

Contributions are welcome! Please fork the repository and create a pull request.

## 📄 License

This project is licensed under the ISC License.
