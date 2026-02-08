import React from 'react';
import ReactDOM from 'react-dom/client';
import './styles/index.css';
import App from './App';

/**
 * Root element reference
 * Gets: <div id="root"></div> from public/index.html
 */
const root = ReactDOM.createRoot(document.getElementById('root'));

/**
 * Renders React application
 * React.StrictMode enables additional development checks
 */
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
