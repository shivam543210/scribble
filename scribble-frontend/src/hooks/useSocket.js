import { useEffect, useState } from 'react';
import socketService from '../utils/socket';

/**
 * Custom hook for Socket.IO connection and room management
 * Returns: { 
 *   socket: Object, 
 *   roomId: string, 
 *   roomName: string, 
 *   currentUser: Object, 
 *   users: Array, 
 *   isConnected: boolean,
 *   createRoom: Function,
 *   joinRoom: Function
 * }
 */
const useSocket = () => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [roomId, setRoomId] = useState('');
  const [roomName, setRoomName] = useState('');
  const [currentUser, setCurrentUser] = useState(null);
  const [users, setUsers] = useState([]);

  useEffect(() => {
    // Initialize socket connection
    const newSocket = socketService.connect();
    setSocket(newSocket);

    // Connection event handler
    // Receives: No data
    newSocket.on('connect', () => {
      setIsConnected(true);
    });

    // Disconnect event handler
    // Receives: No data
    newSocket.on('disconnect', () => {
      setIsConnected(false);
    });

    // Room created event handler
    // Receives: { roomId: string, roomName: string, user: { id: string, username: string, color: string } }
    const handleRoomCreated = (data) => {
      setRoomId(data.roomId);
      setRoomName(data.roomName);
      setCurrentUser(data.user);
      setUsers([data.user]);
    };

    // Room joined event handler
    // Receives: { roomId: string, roomName: string, user: Object, users: Array, drawingData: Array }
    const handleRoomJoined = (data) => {
      setRoomId(data.roomId);
      setRoomName(data.roomName);
      setCurrentUser(data.user);
      setUsers(data.users);
    };

    // User joined event handler
    // Receives: { user: { id: string, username: string, color: string } }
    const handleUserJoined = (data) => {
      setUsers(prevUsers => [...prevUsers, data.user]);
    };

    // User left event handler
    // Receives: { user: { id: string, username: string, color: string } }
    const handleUserLeft = (data) => {
      setUsers(prevUsers => prevUsers.filter(u => u.id !== data.user.id));
    };

    // Error event handler
    // Receives: { error: string }
    const handleError = (data) => {
      console.error('Socket error:', data.error);
      alert(data.error);
    };

    // Register event listeners
    socketService.onRoomCreated(handleRoomCreated);
    socketService.onRoomJoined(handleRoomJoined);
    socketService.onUserJoined(handleUserJoined);
    socketService.onUserLeft(handleUserLeft);
    socketService.onError(handleError);

    // Cleanup on unmount
    return () => {
      socketService.off('room-created', handleRoomCreated);
      socketService.off('room-joined', handleRoomJoined);
      socketService.off('user-joined', handleUserJoined);
      socketService.off('user-left', handleUserLeft);
      socketService.off('error', handleError);
      socketService.disconnect();
    };
  }, []);

  /**
   * Creates a new room
   * @param {string} roomName - Name of the room
   * @param {string} username - Username
   */
  const createRoom = (roomName, username) => {
    socketService.createRoom(roomName, username);
  };

  /**
   * Joins an existing room
   * @param {string} roomId - Room ID
   * @param {string} username - Username
   */
  const joinRoom = (roomId, username) => {
    socketService.joinRoom(roomId, username);
  };

  return {
    socket,
    roomId,
    roomName,
    currentUser,
    users,
    isConnected,
    createRoom,
    joinRoom
  };
};

export default useSocket;
