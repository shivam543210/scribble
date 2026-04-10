import React, { useRef, useEffect, useState, useCallback } from 'react';
import socketService from '../utils/socket';

// Predefined color palette
const COLOR_PALETTE = [
  '#000000', // Black
  '#FFFFFF', // White
  '#FF0000', // Red
  '#00FF00', // Green
  '#0000FF', // Blue
  '#FFFF00', // Yellow
  '#FF00FF', // Magenta
  '#00FFFF', // Cyan
  '#FFA500', // Orange
  '#800080', // Purple
  '#FFC0CB', // Pink
  '#A52A2A', // Brown
];

// Brush size presets
const BRUSH_SIZES = {
  small: 2,
  medium: 5,
  large: 10,
};

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
  const pointsRef = useRef([]);
  const [canDraw, setCanDraw] = useState(true);
  const historyRef = useRef([]);
  const historyIndexRef = useRef(-1);
  // State to force re-render when history changes (for undo/redo button disabled state)
  const [historyVersion, setHistoryVersion] = useState(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // Render initial drawing data
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

  /**
   * Renders drawing on canvas
   * @param {CanvasRenderingContext2D} ctx
   * @param {Object} drawingData - { type, points, color, lineWidth }
   */
  const renderDrawing = (ctx, drawingData) => {
    const { type, points, color, lineWidth } = drawingData;

    if (!points || points.length < 2) return;

    ctx.beginPath();
    ctx.strokeStyle = type === 'erase' ? '#FFFFFF' : color;
    ctx.lineWidth = type === 'erase' ? lineWidth * 3 : lineWidth;

    ctx.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++) {
      ctx.lineTo(points[i].x, points[i].y);
    }
    ctx.stroke();
  };

  /**
   * Saves drawing data to history for undo/redo
   */
  const saveHistory = useCallback((drawingData) => {
    // Trim any future history (if we undid, then drew something new)
    const newHistory = historyRef.current.slice(0, historyIndexRef.current + 1);
    newHistory.push(drawingData);
    historyRef.current = newHistory;
    historyIndexRef.current = newHistory.length - 1;
    setHistoryVersion(v => v + 1); // trigger re-render for button states
  }, []);

  /**
   * Redraws the entire canvas from history
   */
  const redrawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let i = 0; i <= historyIndexRef.current; i++) {
      renderDrawing(ctx, historyRef.current[i]);
    }
  }, []);

  /**
   * Clears the canvas
   */
  const clearCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }, []);

  /**
   * Downloads the current canvas as an image
   */
  const handleDownload = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Create a temporary canvas to draw the white background and the drawing
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = canvas.width;
    tempCanvas.height = canvas.height;
    const tempCtx = tempCanvas.getContext('2d');
    
    // Fill with white background
    tempCtx.fillStyle = '#FFFFFF';
    tempCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
    
    // Draw original canvas on top
    tempCtx.drawImage(canvas, 0, 0);

    const dataUrl = tempCanvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = `scribble-drawing-${Date.now()}.png`;
    link.href = dataUrl;
    link.click();
  }, []);

  /**
   * Undo last drawing action
   */
  const undo = useCallback(() => {
    if (historyIndexRef.current < 0) return;
    historyIndexRef.current -= 1;
    redrawCanvas();
    setHistoryVersion(v => v + 1);
  }, [redrawCanvas]);

  /**
   * Redo last undone action
   */
  const redo = useCallback(() => {
    if (historyIndexRef.current >= historyRef.current.length - 1) return;
    historyIndexRef.current += 1;
    redrawCanvas();
    setHistoryVersion(v => v + 1);
  }, [redrawCanvas]);

  // Keyboard shortcuts for undo/redo
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!canDraw) return;
      if (e.ctrlKey && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        undo();
      } else if (e.ctrlKey && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
        e.preventDefault();
        redo();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo, canDraw]);

  // Listen for drawing events from other users
  useEffect(() => {
    const handleDrawing = (data) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      
      const ctx = canvas.getContext('2d');
      renderDrawing(ctx, data.drawingData);
      saveHistory(data.drawingData);
    };

    const handleCanvasCleared = () => {
      clearCanvas();
      historyRef.current = [];
      historyIndexRef.current = -1;
      setHistoryVersion(v => v + 1);
    };

    socketService.onDrawing(handleDrawing);
    socketService.onCanvasCleared(handleCanvasCleared);

    return () => {
      socketService.off('drawing', handleDrawing);
      socketService.off('canvas-cleared', handleCanvasCleared);
    };
  }, [saveHistory, clearCanvas]);

  /**
   * Handles mouse down event
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
    pointsRef.current = [{ x, y }];
  };

  /**
   * Handles mouse move event
   */
  const draw = (e) => {
    if (!isDrawing || !canDraw) return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    pointsRef.current.push({ x, y });
    const ctx = canvas.getContext('2d');
    renderDrawing(ctx, {
      type: currentTool,
      points: pointsRef.current,
      color: currentColor,
      lineWidth: lineWidth
    });
  };

  /**
   * Handles mouse up event — sends drawing data to server
   */
  const stopDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);

    if (pointsRef.current.length > 1 && canDraw) {
      const drawingData = {
        type: currentTool,
        points: [...pointsRef.current], // copy so ref reset doesn't affect it
        color: currentColor,
        lineWidth: lineWidth
      };
      socketService.sendDrawing(roomId, drawingData);
      saveHistory(drawingData);
    }

    pointsRef.current = [];
  };

  /**
   * Handles touch start event
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
    pointsRef.current = [{ x, y }];
  };

  /**
   * Handles touch move event
   */
  const handleTouchMove = (e) => {
    e.preventDefault();
    if (!isDrawing || !canDraw) return;

    const touch = e.touches[0];
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;

    pointsRef.current.push({ x, y });
    const ctx = canvas.getContext('2d');
    renderDrawing(ctx, {
      type: currentTool,
      points: pointsRef.current,
      color: currentColor,
      lineWidth: lineWidth
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
   * Handles clear button click — sends clear command to server
   */
  const handleClear = () => {
    if (isGameActive && !isDrawer) {
      alert("Only the drawer can clear the canvas during game!");
      return;
    }

    clearCanvas();
    historyRef.current = [];
    historyIndexRef.current = -1;
    setHistoryVersion(v => v + 1);
    socketService.clearCanvas(roomId);
  };

  // Derived state for button disabled checks
  const canUndo = canDraw && historyIndexRef.current >= 0;
  const canRedo = canDraw && historyIndexRef.current < historyRef.current.length - 1;

  return (
    <div className="canvas-container">
      <div className="toolbar">
        <button 
          className={currentTool === 'draw' ? 'active' : ''}
          onClick={() => setCurrentTool('draw')}
          disabled={!canDraw}
          title="Draw"
        >
          ✏️ Draw
        </button>
        <button 
          className={currentTool === 'erase' ? 'active' : ''}
          onClick={() => setCurrentTool('erase')}
          disabled={!canDraw}
          title="Eraser"
        >
          🧹 Erase
        </button>

        <div className="toolbar-divider"></div>
        
        {/* Color Palette */}
        <div className="color-palette">
          {COLOR_PALETTE.map((color) => (
            <button
              key={color}
              className={`color-swatch ${currentColor === color ? 'active' : ''}`}
              style={{ backgroundColor: color, border: color === '#FFFFFF' ? '2px solid #ccc' : 'none' }}
              onClick={() => setCurrentColor(color)}
              disabled={currentTool === 'erase' || !canDraw}
              title={color}
            />
          ))}
        </div>

        <input 
          type="color" 
          value={currentColor}
          onChange={(e) => setCurrentColor(e.target.value)}
          disabled={currentTool === 'erase' || !canDraw}
          title="Custom Color"
          className="custom-color-picker"
        />

        <div className="toolbar-divider"></div>
        
        {/* Brush Size Presets */}
        <div className="brush-size-presets">
          <button
            className={`size-btn ${lineWidth === BRUSH_SIZES.small ? 'active' : ''}`}
            onClick={() => setLineWidth(BRUSH_SIZES.small)}
            disabled={!canDraw}
            title="Small Brush"
          >
            <span className="size-indicator size-small"></span>
          </button>
          <button
            className={`size-btn ${lineWidth === BRUSH_SIZES.medium ? 'active' : ''}`}
            onClick={() => setLineWidth(BRUSH_SIZES.medium)}
            disabled={!canDraw}
            title="Medium Brush"
          >
            <span className="size-indicator size-medium"></span>
          </button>
          <button
            className={`size-btn ${lineWidth === BRUSH_SIZES.large ? 'active' : ''}`}
            onClick={() => setLineWidth(BRUSH_SIZES.large)}
            disabled={!canDraw}
            title="Large Brush"
          >
            <span className="size-indicator size-large"></span>
          </button>
        </div>
        
        <label className="size-slider">
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

        <div className="toolbar-divider"></div>

        {/* Undo/Redo */}
        <button
          onClick={undo}
          disabled={!canUndo}
          className="undo-btn"
          title="Undo (Ctrl+Z)"
        >
          ↶ Undo
        </button>
        <button
          onClick={redo}
          disabled={!canRedo}
          className="redo-btn"
          title="Redo (Ctrl+Y)"
        >
          ↷ Redo
        </button>

        <button 
          onClick={handleClear} 
          className="clear-btn"
          disabled={!canDraw}
          title="Clear Canvas"
        >
          🗑️ Clear All
        </button>

        <button 
          onClick={handleDownload} 
          className="download-btn"
          title="Download Drawing"
        >
          💾 Download
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
