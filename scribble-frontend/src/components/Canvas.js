import React, { useRef, useEffect, useState } from 'react';
import socketService from '../utils/socket';

/**
 * Canvas component for collaborative drawing (Updated with game mode)
 * Props: { 
 *   roomId: string, 
 *   currentUser: { id: string, username: string, color: string },
 *   initialDrawingData: Array,
 *   isDrawer: boolean,
 *   isGameActive: boolean
 * }
 */
const Canvas = ({ roomId, currentUser, initialDrawingData = [], isDrawer = false, isGameActive = false }) => {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentTool, setCurrentTool] = useState('draw');
  const [currentColor, setCurrentColor] = useState('#000000');
  const [lineWidth, setLineWidth] = useState(2);
  const [points, setPoints] = useState([]);
  const [canDraw, setCanDraw] = useState(true);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // Render initial drawing data
    // initialDrawingData: Array of { type: string, data: Object, userId: string, timestamp: number }
    if (initialDrawingData && initialDrawingData.length > 0) {
      initialDrawingData.forEach(event => {
        renderDrawing(ctx, event.data);
      });
    }
  }, [initialDrawingData]);

  useEffect(() => {
    // In game mode, only drawer can draw
    if (isGameActive) {
      setCanDraw(isDrawer);
    } else {
      setCanDraw(true);
    }
  }, [isGameActive, isDrawer]);

  useEffect(() => {
    // Listen for drawing events from other users
    // Receives: { drawingData: { type: string, points: Array, color: string, lineWidth: number }, userId: string }
    const handleDrawing = (data) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      
      const ctx = canvas.getContext('2d');
      renderDrawing(ctx, data.drawingData);
    };

    // Listen for canvas clear events
    // Receives: No data
    const handleCanvasCleared = () => {
      clearCanvas();
    };

    socketService.onDrawing(handleDrawing);
    socketService.onCanvasCleared(handleCanvasCleared);

    return () => {
      socketService.off('drawing', handleDrawing);
      socketService.off('canvas-cleared', handleCanvasCleared);
    };
  }, []);

  /**
   * Renders drawing on canvas
   * @param {CanvasRenderingContext2D} ctx - Canvas context with methods { beginPath, moveTo, lineTo, stroke, strokeStyle, lineWidth }
   * @param {Object} drawingData - { type: 'draw'|'erase', points: Array<{x: number, y: number}>, color: string, lineWidth: number }
   */
  const renderDrawing = (ctx, drawingData) => {
    const { type, points, color, lineWidth } = drawingData;

    if (points.length < 2) return;

    ctx.beginPath();
    ctx.strokeStyle = type === 'erase' ? '#FFFFFF' : color;
    ctx.lineWidth = type === 'erase' ? lineWidth * 3 : lineWidth;

    // points: Array of { x: number, y: number }
    ctx.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++) {
      ctx.lineTo(points[i].x, points[i].y);
    }
    ctx.stroke();
  };

  /**
   * Handles mouse down event
   * @param {MouseEvent} e - Mouse event with properties { clientX: number, clientY: number }
   */
  const startDrawing = (e) => {
    if (!canDraw) {
      if (isGameActive && !isDrawer) {
        alert("Only the current drawer can draw!");
      }
      return;
    }

    setIsDrawing(true);
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setPoints([{ x, y }]);
  };

  /**
   * Handles mouse move event
   * @param {MouseEvent} e - Mouse event with properties { clientX: number, clientY: number }
   */
  const draw = (e) => {
    if (!isDrawing || !canDraw) return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setPoints(prevPoints => {
      const newPoints = [...prevPoints, { x, y }];
      
      const ctx = canvas.getContext('2d');
      const drawingData = {
        type: currentTool,
        points: newPoints,
        color: currentColor,
        lineWidth: lineWidth
      };
      renderDrawing(ctx, drawingData);

      return newPoints;
    });
  };

  /**
   * Handles mouse up event
   * Sends drawing data to server
   */
  const stopDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);

    if (points.length > 1 && canDraw) {
      // Send drawing data to server
      // Emits: 'drawing' with { roomId: string, drawingData: Object }
      const drawingData = {
        type: currentTool,
        points: points,
        color: currentColor,
        lineWidth: lineWidth
      };
      socketService.sendDrawing(roomId, drawingData);
    }

    setPoints([]);
  };

  /**
   * Handles touch start event
   * @param {TouchEvent} e - Touch event with properties { touches: Array }
   */
  const handleTouchStart = (e) => {
    e.preventDefault();
    if (!canDraw) return;

    const touch = e.touches[0];
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;
    setIsDrawing(true);
    setPoints([{ x, y }]);
  };

  /**
   * Handles touch move event
   * @param {TouchEvent} e - Touch event with properties { touches: Array }
   */
  const handleTouchMove = (e) => {
    e.preventDefault();
    if (!isDrawing || !canDraw) return;

    const touch = e.touches[0];
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;

    setPoints(prevPoints => {
      const newPoints = [...prevPoints, { x, y }];
      
      const ctx = canvas.getContext('2d');
      const drawingData = {
        type: currentTool,
        points: newPoints,
        color: currentColor,
        lineWidth: lineWidth
      };
      renderDrawing(ctx, drawingData);

      return newPoints;
    });
  };

  /**
   * Handles touch end event
   */
  const handleTouchEnd = (e) => {
    e.preventDefault();
    stopDrawing();
  };

  /**
   * Clears the canvas
   */
  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  /**
   * Handles clear button click
   * Sends clear command to server
   */
  const handleClear = () => {
    if (isGameActive && !isDrawer) {
      alert("Only the drawer can clear the canvas during game!");
      return;
    }

    clearCanvas();
    // Emits: 'clear-canvas' with { roomId: string }
    socketService.clearCanvas(roomId);
  };

  return (
    <div className="canvas-container">
      <div className="toolbar">
        <button 
          className={currentTool === 'draw' ? 'active' : ''}
          onClick={() => setCurrentTool('draw')}
          disabled={!canDraw}
        >
          ✏️ Draw
        </button>
        <button 
          className={currentTool === 'erase' ? 'active' : ''}
          onClick={() => setCurrentTool('erase')}
          disabled={!canDraw}
        >
          🧹 Erase
        </button>
        
        <input 
          type="color" 
          value={currentColor}
          onChange={(e) => setCurrentColor(e.target.value)}
          disabled={currentTool === 'erase' || !canDraw}
        />
        
        <label>
          Size: 
          <input 
            type="range" 
            min="1" 
            max="20" 
            value={lineWidth}
            onChange={(e) => setLineWidth(Number(e.target.value))}
            disabled={!canDraw}
          />
          {lineWidth}
        </label>

        <button 
          onClick={handleClear} 
          className="clear-btn"
          disabled={!canDraw}
        >
          🗑️ Clear All
        </button>

        {isGameActive && !canDraw && (
          <div className="drawing-disabled-notice">
            🚫 Wait for your turn to draw
          </div>
        )}
      </div>

      <canvas
        ref={canvasRef}
        className={`drawing-canvas ${!canDraw ? 'disabled' : ''}`}
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseLeave={stopDrawing}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      />
    </div>
  );
};

export default Canvas;
