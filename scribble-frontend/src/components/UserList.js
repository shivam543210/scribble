import React from 'react';

/**
 * UserList component displays all users in the room
 * Props: { 
 *   users: Array<{ id: string, username: string, color: string }>,
 *   currentUser: { id: string, username: string, color: string }
 * }
 */
const UserList = ({ users, currentUser }) => {
  return (
    <div className="user-list">
      <h3>Users ({users.length})</h3>
      <div className="users">
        {users.map((user) => (
          <div key={user.id} className="user-item">
            <div 
              className="user-color" 
              style={{ backgroundColor: user.color }}
            />
            <span className="user-name">
              {user.username}
              {user.id === currentUser?.id && ' (You)'}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UserList;
