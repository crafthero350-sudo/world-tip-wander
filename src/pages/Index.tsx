import { useState, useRef, useCallback, useEffect } from "react";
import { Home } from "lucide-react";
import InsightCard from "@/components/InsightCard";
import { cards } from "@/data/cards";

const WORLD_WIDTH = 2400;
const WORLD_HEIGHT = 3200;

// Place cards scattered around the world
const cardPositions = [
  { x: 180, y: 620 },
  { x: 580, y: 540 },
  { x: 100, y: 1050 },
  { x: 520, y: 980 },
  { x: 300, y: 1450 },
  { x: 700, y: 1400 },
  { x: 140, y: 1900 },
  { x: 560, y: 1850 },
];

const HOME_X = 0;
const HOME_Y = 0;

const Index = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [offset, setOffset] = useState({ x: HOME_X, y: HOME_Y });
  const [dragging, setDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const offsetStart = useRef({ x: 0, y: 0 });
  const [containerSize, setContainerSize] = useState({ w: 400, h: 800 });

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const update = () => setContainerSize({ w: el.clientWidth, h: el.clientHeight });
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  const clamp = useCallback((x: number, y: number) => {
    const minX = -(WORLD_WIDTH - containerSize.w);
    const minY = -(WORLD_HEIGHT - containerSize.h);
    return {
      x: Math.max(minX, Math.min(0, x)),
      y: Math.max(minY, Math.min(0, y)),
    };
  }, [containerSize]);

  const handlePointerDown = (e: React.PointerEvent) => {
    // Don't drag if interacting with a card
    if ((e.target as HTMLElement).closest("[data-card]")) return;
    setDragging(true);
    dragStart.current = { x: e.clientX, y: e.clientY };
    offsetStart.current = { ...offset };
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!dragging) return;
    const dx = e.clientX - dragStart.current.x;
    const dy = e.clientY - dragStart.current.y;
    setOffset(clamp(offsetStart.current.x + dx, offsetStart.current.y + dy));
  };

  const handlePointerUp = () => setDragging(false);

  const goHome = () => {
    setOffset(clamp(HOME_X, HOME_Y));
  };

  return (
    <div className="min-h-screen bg-background flex justify-center overflow-hidden">
      <div className="w-full max-w-md relative h-screen overflow-hidden" ref={containerRef}>
        {/* Pannable world */}
        <div
          className="absolute touch-none select-none"
          style={{
            width: WORLD_WIDTH,
            height: WORLD_HEIGHT,
            transform: `translate(${offset.x}px, ${offset.y}px)`,
            transition: dragging ? "none" : "transform 0.4s cubic-bezier(0.25,1,0.5,1)",
            cursor: dragging ? "grabbing" : "grab",
          }}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
        >
          {/* Hero text at home position */}
          <div className="absolute left-6 top-12" style={{ width: 360 }}>
            <h1 className="text-5xl font-extrabold leading-[1.05] tracking-tight text-foreground">
              Exploring<br />Minds
            </h1>
            <h2 className="text-5xl font-extrabold leading-[1.05] tracking-tight text-muted-foreground mt-0">
              Inspiring<br />Change
            </h2>
          </div>

          {/* Scattered cards */}
          {cards.map((card, i) => {
            const pos = cardPositions[i] || { x: 200, y: 600 + i * 400 };
            return (
              <div
                key={card.id}
                data-card
                className="absolute"
                style={{
                  left: pos.x,
                  top: pos.y,
                  width: 180,
                }}
              >
                <InsightCard card={card} />
              </div>
            );
          })}

          {/* Decorative dots scattered in the world */}
          {[
            { x: 60, y: 800, size: 8 },
            { x: 800, y: 400, size: 12 },
            { x: 450, y: 1200, size: 6 },
            { x: 900, y: 900, size: 10 },
            { x: 200, y: 2200, size: 8 },
            { x: 750, y: 1700, size: 14 },
            { x: 350, y: 2600, size: 10 },
            { x: 950, y: 2400, size: 8 },
          ].map((dot, i) => (
            <div
              key={`dot-${i}`}
              className="absolute rounded-full bg-muted-foreground/15"
              style={{ left: dot.x, top: dot.y, width: dot.size, height: dot.size }}
            />
          ))}
        </div>

        {/* Home indicator */}
        <button
          onClick={goHome}
          className="absolute bottom-6 left-1/2 -translate-x-1/2 z-40 flex items-center gap-2 px-4 py-2.5 rounded-full bg-foreground text-primary-foreground shadow-lg active:scale-95 transition-transform"
        >
          <Home className="w-4 h-4" />
          <span className="text-sm font-semibold">Home</span>
        </button>
      </div>
    </div>
  );
};

export default Index;
