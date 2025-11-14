import React, { useRef, useState, useEffect } from "react";
import "./App.css";

export default function DrawYourWeekendImagination() {
  const canvasRef = useRef(null);
  const ctxRef = useRef(null);

  const [isDrawing, setIsDrawing] = useState(false);
  const [brushColor, setBrushColor] = useState("#ff6ec7");
  const [brushSize, setBrushSize] = useState(6);
  const [mode, setMode] = useState("draw");
  const [history, setHistory] = useState([]);
  const [redoStack, setRedoStack] = useState([]);
  const [stickerSelected, setStickerSelected] = useState("");

  const stickers = ["⭐", "❤️", "🎈", "🌈", "✨"];

  const initCanvas = () => {
    const canvas = canvasRef.current;
    canvas.width = Math.min(window.innerWidth * 0.9, 500);
    canvas.height = 450;

    const ctx = canvas.getContext("2d");
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctxRef.current = ctx;
  };

  useEffect(() => {
    initCanvas();
  }, []);

  const startDrawing = ({ nativeEvent }) => {
    if (mode === "sticker") return;

    const { offsetX, offsetY } = nativeEvent;
    ctxRef.current.beginPath();
    ctxRef.current.moveTo(offsetX, offsetY);
    setIsDrawing(true);
    saveState();
  };

  const draw = ({ nativeEvent }) => {
    if (!isDrawing || mode === "sticker") return;

    const { offsetX, offsetY } = nativeEvent;
    const ctx = ctxRef.current;

    if (mode === "magic") {
      ctx.shadowBlur = 15;
      ctx.shadowColor = brushColor;
    } else if (mode === "glitter") {
      ctx.shadowBlur = 0;
      for (let i = 0; i < 6; i++) {
        ctx.fillStyle = brushColor + Math.floor(Math.random() * 99);
        ctx.fillRect(
          offsetX + Math.random() * 20 - 10,
          offsetY + Math.random() * 20 - 10,
          2,
          2
        );
      }
    } else {
      ctx.shadowBlur = 0;
    }

    ctx.strokeStyle = brushColor;
    ctx.lineWidth = brushSize;
    ctx.lineTo(offsetX, offsetY);
    ctx.stroke();
  };

  const endDrawing = () => setIsDrawing(false);

  const saveState = () => {
    const data = canvasRef.current.toDataURL();
    setHistory((prev) => [...prev, data]);
  };

  const undo = () => {
    if (history.length === 0) return;
    const last = history[history.length - 1];
    setRedoStack([...redoStack, last]);

    const newHistory = history.slice(0, -1);
    setHistory(newHistory);

    const img = new Image();
    img.src = newHistory[newHistory.length - 1] || "";
    img.onload = () => ctxRef.current.drawImage(img, 0, 0);
  };

  const redo = () => {
    if (redoStack.length === 0) return;

    const last = redoStack[redoStack.length - 1];
    setRedoStack(redoStack.slice(0, -1));
    setHistory([...history, last]);

    const img = new Image();
    img.src = last;
    img.onload = () => ctxRef.current.drawImage(img, 0, 0);
  };

  const placeSticker = (e) => {
    if (mode !== "sticker" || !stickerSelected) return;

    saveState();

    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const ctx = ctxRef.current;
    ctx.font = "40px serif";
    ctx.fillText(stickerSelected, x, y);
  };

  const saveImage = () => {
    const link = document.createElement("a");
    link.download = "my_drawing.png";
    link.href = canvasRef.current.toDataURL();
    link.click();
  };

  return (
    <div className="draw-container">
      <h1 className="title">🎨 Draw Your Weekend Imagination 🌈</h1>

      <div className="toolbar">
        <input
          type="color"
          className="color-picker"
          value={brushColor}
          onChange={(e) => setBrushColor(e.target.value)}
        />

        <input
          type="range"
          min="2"
          max="25"
          value={brushSize}
          className="slider"
          onChange={(e) => setBrushSize(e.target.value)}
        />

        <button className={mode === "draw" ? "active" : ""} onClick={() => setMode("draw")}>
          🖌 Brush
        </button>

        <button className={mode === "magic" ? "active" : ""} onClick={() => setMode("magic")}>
          ✨ Magic
        </button>

        <button className={mode === "glitter" ? "active" : ""} onClick={() => setMode("glitter")}>
          🌟 Glitter
        </button>

        <button className={mode === "sticker" ? "active" : ""} onClick={() => setMode("sticker")}>
          🎀 Stickers
        </button>

        <button onClick={undo}>↩ Undo</button>
        <button onClick={redo}>↪ Redo</button>
      </div>

      {mode === "sticker" && (
        <div className="sticker-panel">
          {stickers.map((s) => (
            <span
              key={s}
              className={`sticker ${stickerSelected === s ? "selected" : ""}`}
              onClick={() => setStickerSelected(s)}
            >
              {s}
            </span>
          ))}
        </div>
      )}

      <canvas
        ref={canvasRef}
        className="canvas"
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={endDrawing}
        onClick={placeSticker}
      />

      <div className="bottom-buttons">
        <button
          className="reset-btn"
          onClick={() => {
            const ctx = ctxRef.current;
            ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
          }}
        >
          Clear Canvas
        </button>

        <button className="save-btn" onClick={saveImage}>
          💾 Save Drawing
        </button>
      </div>
    </div>
  );
}
