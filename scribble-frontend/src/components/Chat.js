import React, { useState, useEffect, useRef } from 'react';
import socketService from '../utils/socket';

/**
 * Chat component for room messaging (Redesigned)
 * Props: { 
 *   roomId: string,
 *   currentUser: { id: string, username: string, color: string },
 *   isGameActive: boolean,
 *   users: Array
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
    const handleChatMessage = (data) => {
      setMessages(prev => [...prev, data]);
    };

    const handleCorrectGuess = (data) => {
      const guessMessage = {
        user: { ...data.player, color: '#22c55e' },
        message: data.word 
          ? `You guessed the word! 😎`
          : `${data.player.username} guess the word! 😎`,
        timestamp: Date.now(),
        isSystemMessage: true,
        isCorrectGuess: true,
        isFirst: data.isFirst || false
      };
      setMessages(prev => [...prev, guessMessage]);
    };

    const handleRoundEnded = (data) => {
      const roundEndMessage = {
        user: { username: 'System', color: '#2196F3' },
        message: `Round ended! The word was: "${data.word}"`,
        timestamp: Date.now(),
        isSystemMessage: true
      };
      setMessages(prev => [...prev, roundEndMessage]);
    };

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
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleInputChange = (e) => {
    const value = e.target.value;
    setInputMessage(value);

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

  const selectAutocomplete = (username) => {
    const lastAtIndex = inputMessage.lastIndexOf('@');
    const newMessage = inputMessage.slice(0, lastAtIndex) + '@' + username + ' ';
    setInputMessage(newMessage);
    setShowAutocomplete(false);
    inputRef.current?.focus();
  };

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

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;
    socketService.sendChatMessage(roomId, inputMessage);
    setInputMessage('');
    setShowAutocomplete(false);
  };

  return (
    <div className="chat">
      <div className="chat-messages">
        {messages.map((msg, index) => (
          <div 
            key={index} 
            className={`message ${msg.user.id === currentUser?.id ? 'own-message' : ''} ${msg.isSystemMessage ? 'system-message' : ''} ${msg.isCorrectGuess ? 'correct-guess-message' : ''} ${msg.isGuess ? 'guess-message' : ''}`}
          >
            <span 
              className="message-username" 
              style={{ color: msg.isCorrectGuess ? '#22c55e' : (msg.user.color || '#333') }}
            >
              {msg.isCorrectGuess ? '' : `${msg.user.username}: `}
            </span>
            <span className="message-text" style={msg.isCorrectGuess ? { color: '#22c55e' } : {}}>
              {msg.isCorrectGuess ? msg.message : msg.message}
            </span>
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
          placeholder={isGameActive ? "Type your guess here..." : "Type a message..."}
          className="chat-input"
        />
        <button type="submit" className="chat-send-btn">
          →
        </button>
      </form>
    </div>
  );
};

export default Chat;
