import React, { useRef, useState, useEffect } from "react";
import { Pen, Eraser, Trash2, Download, Square, Circle, Milestone } from "lucide-react";

interface MindMapCanvasProps {
  initialData?: string; // base64 representation of PNG
  onSave: (base64: string) => void;
  theme: "dark" | "light";
}

export default function MindMapCanvas({ initialData, onSave, theme }: MindMapCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState(theme === "dark" ? "#3b82f6" : "#2563eb"); // default Blue
  const [brushSize, setBrushSize] = useState(3);
  const [tool, setTool] = useState<"pen" | "eraser" | "line" | "rect" | "circle">("pen");
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [history, setHistory] = useState<string[]>([]);
  const [historyStep, setHistoryStep] = useState(-1);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas dimensions
    const rect = canvas.parentElement?.getBoundingClientRect();
    canvas.width = rect?.width || 800;
    canvas.height = 450;

    // Fill background
    ctx.fillStyle = theme === "dark" ? "#18181b" : "#f4f4f5";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Grid support for a engineering blueprint feel
    drawGrid(ctx, canvas.width, canvas.height);

    // Load initial data if provided
    if (initialData) {
      const img = new Image();
      img.onload = () => {
        ctx.drawImage(img, 0, 0);
      };
      img.src = initialData;
    }

    // Capture first state in history
    saveState();
  }, [theme]);

  const drawGrid = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    ctx.strokeStyle = theme === "dark" ? "rgba(255, 255, 255, 0.04)" : "rgba(0, 0, 0, 0.04)";
    ctx.lineWidth = 1;
    const gridSize = 25;
    for (let x = 0; x < width; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = 0; y < height; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }
  };

  const getCoordinates = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();

    if ("touches" in e) {
      if (e.touches.length === 0) return { x: 0, y: 0 };
      return {
        x: e.touches[0].clientX - rect.left,
        y: e.touches[0].clientY - rect.top,
      };
    } else {
      return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
    }
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const coords = getCoordinates(e);
    setIsDrawing(true);
    setStartPos(coords);

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.beginPath();
    ctx.moveTo(coords.x, coords.y);
    ctx.strokeStyle = tool === "eraser" ? (theme === "dark" ? "#18181b" : "#f4f4f5") : color;
    ctx.lineWidth = tool === "eraser" ? brushSize * 4 : brushSize;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    if (tool === "pen" || tool === "eraser") {
      ctx.lineTo(coords.x, coords.y);
      ctx.stroke();
    }
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const coords = getCoordinates(e);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    if (tool === "pen" || tool === "eraser") {
      ctx.lineTo(coords.x, coords.y);
      ctx.stroke();
    } else {
      // For shapes (line, rect, circle), clear to the previous history state first to prevent trail
      restoreState(historyStep);
      ctx.beginPath();
      ctx.strokeStyle = color;
      ctx.lineWidth = brushSize;
      ctx.lineCap = "round";

      if (tool === "line") {
        ctx.moveTo(startPos.x, startPos.y);
        ctx.lineTo(coords.x, coords.y);
        ctx.stroke();
      } else if (tool === "rect") {
        ctx.strokeRect(startPos.x, startPos.y, coords.x - startPos.x, coords.y - startPos.y);
      } else if (tool === "circle") {
        const radius = Math.sqrt(Math.pow(coords.x - startPos.x, 2) + Math.pow(coords.y - startPos.y, 2));
        ctx.arc(startPos.x, startPos.y, radius, 0, 2 * Math.PI);
        ctx.stroke();
      }
    }
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    saveState();
    triggerSave();
  };

  const saveState = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL();
    const newHistory = history.slice(0, historyStep + 1);
    newHistory.push(dataUrl);
    setHistory(newHistory);
    setHistoryStep(newHistory.length - 1);
  };

  const restoreState = (step: number) => {
    const canvas = canvasRef.current;
    if (!canvas || step < 0 || !history[step]) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const img = new Image();
    img.onload = () => {
      ctx.fillStyle = theme === "dark" ? "#18181b" : "#f4f4f5";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
    };
    img.src = history[step];
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.fillStyle = theme === "dark" ? "#18181b" : "#f4f4f5";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    drawGrid(ctx, canvas.width, canvas.height);
    saveState();
    triggerSave();
  };

  const triggerSave = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    onSave(canvas.toDataURL());
  };

  const downloadCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement("a");
    link.download = "dyno-mindmap.png";
    link.href = canvas.toDataURL();
    link.click();
  };

  const undo = () => {
    if (historyStep > 0) {
      const prevStep = historyStep - 1;
      setHistoryStep(prevStep);
      restoreState(prevStep);
      setTimeout(() => {
        const canvas = canvasRef.current;
        if (canvas) onSave(canvas.toDataURL());
      }, 100);
    }
  };

  return (
    <div className="flex flex-col gap-3 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-sm" id="drawing-mindmap-module">
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-zinc-100 dark:border-zinc-800">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setTool("pen")}
            className={`p-2 rounded-lg transition-colors ${tool === "pen" ? "bg-blue-600 text-white" : "text-zinc-600 hover:bg-zinc-100 dark:hover:bg-zinc-800"}`}
            title="Pen"
          >
            <Pen size={18} />
          </button>
          <button
            onClick={() => setTool("eraser")}
            className={`p-2 rounded-lg transition-colors ${tool === "eraser" ? "bg-blue-600 text-white" : "text-zinc-600 hover:bg-zinc-100 dark:hover:bg-zinc-800"}`}
            title="Eraser"
          >
            <Eraser size={18} />
          </button>
          <div className="h-6 w-px bg-zinc-200 dark:bg-zinc-800 mx-1" />
          <button
            onClick={() => setTool("line")}
            className={`p-2 rounded-lg transition-colors ${tool === "line" ? "bg-blue-600 text-white" : "text-zinc-600 hover:bg-zinc-100 dark:hover:bg-zinc-800"}`}
            title="Line"
          >
            <Milestone size={18} />
          </button>
          <button
            onClick={() => setTool("rect")}
            className={`p-2 rounded-lg transition-colors ${tool === "rect" ? "bg-blue-600 text-white" : "text-zinc-600 hover:bg-zinc-100 dark:hover:bg-zinc-800"}`}
            title="Rectangle"
          >
            <Square size={18} />
          </button>
          <button
            onClick={() => setTool("circle")}
            className={`p-2 rounded-lg transition-colors ${tool === "circle" ? "bg-blue-600 text-white" : "text-zinc-600 hover:bg-zinc-100 dark:hover:bg-zinc-800"}`}
            title="Circle"
          >
            <Circle size={18} />
          </button>
        </div>

        <div className="flex items-center gap-3">
          {/* Preset Colors */}
          {tool !== "eraser" && (
            <div className="flex items-center gap-1.5 bg-zinc-50 dark:bg-zinc-900 p-1 rounded-lg">
              {["#3b82f6", "#a855f7", "#22c55e", "#ef4444", "#f97316", theme === "dark" ? "#ffffff" : "#09090b"].map((c) => (
                <button
                  key={c}
                  onClick={() => setColor(c)}
                  className={`w-5 h-5 rounded-full border transition-transform ${color === c ? "scale-125 border-zinc-500" : "border-transparent"}`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          )}

          {/* Stroke Width */}
          <div className="flex items-center gap-2 text-xs text-zinc-500">
            <span>Size</span>
            <input
              type="range"
              min="1"
              max="15"
              value={brushSize}
              onChange={(e) => setBrushSize(parseInt(e.target.value))}
              className="w-20 accent-blue-600"
            />
          </div>

          <div className="h-6 w-px bg-zinc-200 dark:bg-zinc-800 mx-1" />

          {/* Undo/Clear/Download */}
          <div className="flex items-center gap-1">
            <button
              onClick={undo}
              disabled={historyStep <= 0}
              className="p-2 text-xs font-medium rounded-lg text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-40"
            >
              Undo
            </button>
            <button
              onClick={clearCanvas}
              className="p-2 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
              title="Clear Canvas"
            >
              <Trash2 size={18} />
            </button>
            <button
              onClick={downloadCanvas}
              className="p-2 rounded-lg text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              title="Download Map"
            >
              <Download size={18} />
            </button>
          </div>
        </div>
      </div>

      <div className="relative border border-zinc-200 dark:border-zinc-800 rounded-lg overflow-hidden bg-zinc-100 dark:bg-zinc-900">
        <canvas
          ref={canvasRef}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
          className="block cursor-crosshair max-w-full"
        />
        <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded text-[10px] font-mono bg-zinc-950/80 text-zinc-400">
          Drawing Board / Mindmap
        </div>
      </div>
    </div>
  );
}
