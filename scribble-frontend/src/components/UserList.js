import React from 'react';

/**
 * UserList component — Leaderboard style with ranks
 * Props: { 
 *   users: Array<{ id: string, username: string, color: string, score?: number }>,
 *   currentUser: { id: string, username: string, color: string },
 *   isGameActive: boolean,
 *   currentDrawerId: string|null
 * }
 */
const UserList = ({ users, currentUser, isGameActive = false, currentDrawerId = null }) => {
  // Sort by score (descending) if game is active
  const sortedUsers = isGameActive 
    ? [...users].sort((a, b) => (b.score || 0) - (a.score || 0))
    : users;

  return (
    <div className="user-list">
      {sortedUsers.map((user, index) => {
        const isYou = user.id === currentUser?.id;
        const isCurrentDrawer = user.id === currentDrawerId;

        return (
          <div key={user.id} className="leaderboard-item">
            <div 
              className="user-color" 
              style={{ backgroundColor: user.color }}
            />
            <div style={{ flex: 1 }}>
              <span className={`leaderboard-username ${isYou ? 'is-you' : ''}`}>
                {isYou ? `${user.username} (you)` : user.username}
                {isCurrentDrawer && <span className="drawer-icon"> ✏️</span>}
                {user.hasGuessedCorrectly && <span className="guessed-icon"> ✅</span>}
              </span>
              {isGameActive && (
                <div className="leaderboard-points">
                  {(user.score || 0).toLocaleString()} points
                </div>
              )}
            </div>
            <span className="leaderboard-rank">#{index + 1}</span>
          </div>
        );
      })}
    </div>
  );
};

export default UserList;
