import React, { useState, useEffect, useRef } from 'react';
import socketService from '../utils/socket';

/**
 * Chat component for room messaging (Updated with game mode)
 * Props: { 
 *   roomId: string,
 *   currentUser: { id: string, username: string, color: string },
 *   isGameActive: boolean
 * }
 */
const Chat = ({ roomId, currentUser, isGameActive = false, users = [] }) => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [showAutocomplete, setShowAutocomplete] = useState(false);
  const [autocompleteOptions, setAutocompleteOptions] = useState([]);
  const [selectedAutocompleteIndex, setSelectedAutocompleteIndex] = useState(0);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    // Listen for chat messages
    // Receives: { user: { id: string, username: string, color: string }, message: string, timestamp: number, isGuess: boolean }
    const handleChatMessage = (data) => {
      setMessages(prev => [...prev, data]);
    };

    // Listen for correct guesses
    // Receives: { player: Object, points: number, word: string|null, isFirst: boolean, guessOrder: number }
    const handleCorrectGuess = (data) => {
      const guessMessage = {
        user: { ...data.player, color: '#4CAF50' },
        message: data.word 
          ? `You guessed correctly! +${data.points} points ${data.isFirst ? '🥇 First!' : ''}(Word: ${data.word})`
          : `${data.player.username} guessed correctly! +${data.points} points ${data.isFirst ? '🥇 First!' : ''}`,
        timestamp: Date.now(),
        isSystemMessage: true,
        isCorrectGuess: true,
        isFirst: data.isFirst || false
      };
      setMessages(prev => [...prev, guessMessage]);
    };

    // Listen for round ended
    // Receives: { word: string, scores: Array }
    const handleRoundEnded = (data) => {
      const roundEndMessage = {
        user: { username: 'System', color: '#2196F3' },
        message: `Round ended! The word was: "${data.word}"`,
        timestamp: Date.now(),
        isSystemMessage: true
      };
      setMessages(prev => [...prev, roundEndMessage]);
    };

    // Listen for game ended
    // Receives: { winner: Object, scores: Array }
    const handleGameEnded = (data) => {
      const gameEndMessage = {
        user: { username: 'System', color: '#2196F3' },
        message: `🎉 Game Over! Winner: ${data.winner.username} with ${data.winner.score} points!`,
        timestamp: Date.now(),
        isSystemMessage: true
      };
      setMessages(prev => [...prev, gameEndMessage]);
    };

    socketService.onChatMessage(handleChatMessage);
    socketService.socket.on('correct-guess', handleCorrectGuess);
    socketService.socket.on('round-ended', handleRoundEnded);
    socketService.socket.on('game-ended', handleGameEnded);

    return () => {
      socketService.off('chat-message', handleChatMessage);
      socketService.socket.off('correct-guess', handleCorrectGuess);
      socketService.socket.off('round-ended', handleRoundEnded);
      socketService.socket.off('game-ended', handleGameEnded);
    };
  }, []);

  useEffect(() => {
    // Auto scroll to bottom when new message arrives
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  /**
   * Handles input change and autocomplete
   */
  const handleInputChange = (e) => {
    const value = e.target.value;
    setInputMessage(value);

    // Check for @ mention
    const lastAtIndex = value.lastIndexOf('@');
    if (lastAtIndex !== -1) {
      const searchTerm = value.slice(lastAtIndex + 1).toLowerCase();
      const filteredUsers = users.filter(user => 
        user.username.toLowerCase().startsWith(searchTerm) && user.id !== currentUser?.id
      );
      
      if (filteredUsers.length > 0 && searchTerm.length > 0) {
        setAutocompleteOptions(filteredUsers);
        setShowAutocomplete(true);
        setSelectedAutocompleteIndex(0);
      } else {
        setShowAutocomplete(false);
      }
    } else {
      setShowAutocomplete(false);
    }
  };

  /**
   * Handles autocomplete selection
   */
  const selectAutocomplete = (username) => {
    const lastAtIndex = inputMessage.lastIndexOf('@');
    const newMessage = inputMessage.slice(0, lastAtIndex) + '@' + username + ' ';
    setInputMessage(newMessage);
    setShowAutocomplete(false);
    inputRef.current?.focus();
  };

  /**
   * Handles keyboard navigation in autocomplete
   */
  const handleKeyDown = (e) => {
    if (!showAutocomplete) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedAutocompleteIndex(prev => 
        prev < autocompleteOptions.length - 1 ? prev + 1 : prev
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedAutocompleteIndex(prev => prev > 0 ? prev - 1 : 0);
    } else if (e.key === 'Enter' && showAutocomplete) {
      e.preventDefault();
      selectAutocomplete(autocompleteOptions[selectedAutocompleteIndex].username);
    } else if (e.key === 'Escape') {
      setShowAutocomplete(false);
    }
  };

  /**
   * Handles form submit
   * @param {Event} e - Form submit event with method preventDefault()
   */
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!inputMessage.trim()) return;

    // Send message to server (will be treated as guess if game is active)
    // Emits: 'chat-message' with { roomId: string, message: string }
    socketService.sendChatMessage(roomId, inputMessage);
    setInputMessage('');
    setShowAutocomplete(false);
  };

  /**
   * Formats timestamp to readable time
   * @param {number} timestamp - Unix timestamp
   * @returns {string} Formatted time
   */
  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <div className="chat">
      <h3>{isGameActive ? 'Chat & Guesses' : 'Chat'}</h3>
      <div className="chat-messages">
        {messages.map((msg, index) => (
          <div 
            key={index} 
            className={`message ${msg.user.id === currentUser?.id ? 'own-message' : ''} ${msg.isSystemMessage ? 'system-message' : ''} ${msg.isCorrectGuess ? 'correct-guess-message' : ''} ${msg.isGuess ? 'guess-message' : ''}`}
          >
            <div className="message-header">
              <span 
                className="message-username" 
                style={{ color: msg.user.color }}
              >
                {msg.user.username}
                {msg.isGuess && !msg.isSystemMessage && ' 🤔'}
                {msg.isCorrectGuess && ' ✅'}
              </span>
              <span className="message-time">
                {formatTime(msg.timestamp)}
              </span>
            </div>
            <div className="message-text">{msg.message}</div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      
      <form onSubmit={handleSubmit} className="chat-input-form">
        {showAutocomplete && (
          <div className="autocomplete-dropdown">
            {autocompleteOptions.map((user, index) => (
              <div
                key={user.id}
                className={`autocomplete-item ${index === selectedAutocompleteIndex ? 'selected' : ''}`}
                onClick={() => selectAutocomplete(user.username)}
              >
                <span className="autocomplete-username">{user.username}</span>
              </div>
            ))}
          </div>
        )}
        <input
          ref={inputRef}
          type="text"
          value={inputMessage}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder={isGameActive ? "Type your guess or @mention..." : "Type a message or @mention..."}
          className="chat-input"
        />
        <button type="submit" className="chat-send-btn">
          {isGameActive ? '🎯 Guess' : 'Send'}
        </button>
      </form>
    </div>
  );
};

export default Chat;
