# Scribble - Game Mode Update

## New Feature: Drawing & Guessing Game! 🎨🎯

### Game Overview
Players take turns drawing while others guess the word. First to guess correctly gets the most points!

### How It Works

#### Game Flow
1. **Start Game**: Any player can start the game with custom settings
2. **Rounds**: Game consists of multiple rounds (default: 3)
3. **Drawing Turn**: Each round, one player becomes the drawer
4. **Word Selection**: Drawer chooses from 3 random words
5. **Drawing Phase**: Drawer draws while others guess (default: 60 seconds)
6. **Guessing**: Players type guesses in chat
7. **Scoring**: Points awarded based on guess order and speed
8. **Winner**: Player with highest score after all rounds wins!

### Scoring System

#### For Guessers:
- **1st correct guess**: 100 points + time bonus
- **2nd correct guess**: 75 points + time bonus
- **3rd correct guess**: 50 points + time bonus
- **4th+ correct guess**: 25 points + time bonus
- **Time bonus**: Up to 30 extra points for fast guesses

#### For Drawer:
- **+25 points** each time someone guesses correctly

### Game Settings

- **Rounds**: 1-10 rounds (default: 3)
- **Draw Time**: 30-180 seconds per round (default: 60)

### Features

#### Word Bank
Over 50 words across difficulty levels:
- **Easy**: apple, cat, dog, house, car, sun, moon, star
- **Medium**: elephant, guitar, mountain, rainbow, butterfly
- **Hard**: telescope, helicopter, saxophone, lighthouse

#### During Gameplay
- **Word Selection**: Drawer gets 3 random words to choose from
- **Masked Word**: Guessers see "_ _ _ _ _" format
- **Hint System**: Players can request hints to reveal letters
- **Live Leaderboard**: Real-time score updates
- **Round Timer**: Countdown showing time remaining
- **Drawing Restrictions**: Only current drawer can draw

#### Chat Features
- **Guess Highlighting**: Guesses shown differently from regular chat
- **Correct Guess Alerts**: Green notifications when someone guesses right
- **System Messages**: Round start/end and winner announcements
- **Word Reveal**: Shows correct word at round end

## Socket Events (New)

### Client → Server

#### start-game
Starts the game with settings
```javascript
socket.emit('start-game', {
  roomId: string,
  settings: {
    rounds: number,      // 1-10
    drawTime: number     // 30-180 seconds
  }
});
```

#### select-word
Drawer selects word to draw
```javascript
socket.emit('select-word', {
  roomId: string,
  word: string
});
```

#### request-hint
Requests hint to reveal letters
```javascript
socket.emit('request-hint', {
  roomId: string
});
```

#### chat-message (Updated)
Now handles both chat and guesses
```javascript
socket.emit('chat-message', {
  roomId: string,
  message: string  // Treated as guess if game active
});
```

### Server → Client

#### game-started
Game has started
```javascript
socket.on('game-started', (data) => {
  // data: { rounds: number, drawTime: number }
});
```

#### round-started-drawer
Round started for drawer
```javascript
socket.on('round-started-drawer', (data) => {
  // data: {
  //   drawer: { id: string, username: string, score: number },
  //   wordOptions: Array<string>,  // 3 words to choose from
  //   round: number,
  //   totalRounds: number
  // }
});
```

#### round-started-guesser
Round started for guessers
```javascript
socket.on('round-started-guesser', (data) => {
  // data: {
  //   drawer: { id: string, username: string },
  //   round: number,
  //   totalRounds: number
  // }
});
```

#### word-selected
Word has been selected
```javascript
socket.on('word-selected', (data) => {
  // For drawer:
  // data: { word: string }
  
  // For guessers:
  // data: { maskedWord: string, wordLength: number }
  // maskedWord example: "_ _ _ _ _"
});
```

#### correct-guess
Someone guessed correctly
```javascript
socket.on('correct-guess', (data) => {
  // data: {
  //   player: { id: string, username: string, score: number },
  //   points: number,
  //   word: string | null  // null for others, actual word for guesser
  // }
});
```

#### leaderboard-update
Leaderboard updated
```javascript
socket.on('leaderboard-update', (data) => {
  // data: {
  //   leaderboard: Array<{
  //     id: string,
  //     username: string,
  //     score: number
  //   }>
  // }
});
```

#### hint-revealed
Hint revealed (some letters shown)
```javascript
socket.on('hint-revealed', (data) => {
  // data: { hint: string }
  // Example: "a _ _ l e" for "apple"
});
```

#### round-ended
Round has ended
```javascript
socket.on('round-ended', (data) => {
  // data: {
  //   word: string,  // The correct word
  //   scores: Array<{
  //     id: string,
  //     username: string,
  //     score: number
  //   }>
  // }
});
```

#### game-ended
Game finished
```javascript
socket.on('game-ended', (data) => {
  // data: {
  //   winner: {
  //     id: string,
  //     username: string,
  //     score: number
  //   },
  //   scores: Array  // Final leaderboard
  // }
});
```

## UI Components (New)

### GameControls Component
- Game settings (rounds, draw time)
- Start game button
- Round/timer display
- Word selection modal (for drawer)
- Current word display (for drawer)
- Masked word display (for guessers)
- Hint request button
- Mini leaderboard

### Updated Components

#### Canvas
- Drawing now restricted to current drawer during game
- Disabled state with visual feedback
- Auto-clear between rounds

#### Chat
- Guess highlighting (blue background)
- Correct guess animations (green, scales up)
- System messages (round start/end, winner)
- Modified input placeholder based on game state

#### Room
- Game controls section added
- Layout adjusted for game info

## Backend Game Logic

### Game Model
Manages complete game state:
- Player scores and tracking
- Round progression
- Word selection and validation
- Guess processing with scoring
- Leaderboard generation
- Timer management

### Key Methods

```javascript
// Create game
Game.createGame(roomId, settings)

// Start game
Game.startGame(roomId)

// Start new round
Game.startRound(roomId)

// Drawer selects word
Game.selectWord(roomId, word)

// Process guess
Game.processGuess(roomId, playerId, guess)
// Returns: { correct: boolean, points: number, player: Object, allGuessed: boolean }

// End round
Game.endRound(roomId)

// End game
Game.endGame(roomId)

// Get leaderboard
Game.getLeaderboard(roomId)
```

## Testing the Game

1. Start backend and frontend
2. Create a room
3. Have at least 2 players join
4. Click "Start Game" 
5. Adjust settings if needed
6. First player becomes drawer
7. Drawer selects word from 3 options
8. Drawer draws while others guess in chat
9. Correct guesses award points
10. Round ends after time or all guess correctly
11. Next round starts automatically
12. After all rounds, winner is announced!

## Game Strategy Tips

### For Drawers:
- Start with basic shapes and outline
- Add details gradually
- Avoid writing letters or numbers
- Draw clearly and simply

### For Guessers:
- Guess quickly for more points
- Watch the drawing develop
- Use hints strategically
- Think about word length from masked word

## Customization

### Adding More Words
Edit `Game.js` in backend:
```javascript
generateWordOptions(usedWords = []) {
  const allWords = [
    // Add your words here
    'newword1', 'newword2', 'newword3'
  ];
  // ...
}
```

### Adjusting Point Values
Edit `processGuess()` in `Game.js`:
```javascript
if (guessOrder === 1) points = 100;  // Modify this
else if (guessOrder === 2) points = 75;  // And this
// ...
```

### Default Settings
Change in `GameControls.js`:
```javascript
const [settings, setSettings] = useState({
  rounds: 3,      // Change default rounds
  drawTime: 60    // Change default time
});
```

## Compatibility

Game mode is fully compatible with:
- Free drawing mode (when game not active)
- All existing features (chat, user list, etc.)
- Multiple rooms simultaneously
- Joining mid-game (joins as spectator until next round)

## Notes

- Minimum 2 players required to start
- Drawing restricted to current drawer during active rounds
- Game state persists across disconnects (for remaining players)
- Chat works as normal when game is not active
- Canvas clears automatically between rounds
