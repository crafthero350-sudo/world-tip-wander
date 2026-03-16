import { useState, useRef, useCallback, useEffect } from "react";
import { Home, Plus, User } from "lucide-react";
import InsightCard from "@/components/InsightCard";
import Minimap from "@/components/Minimap";
import AddCardModal from "@/components/AddCardModal";
import MyCollection from "@/components/MyCollection";
import { cards as initialCards } from "@/data/cards";
import type { InsightCardData } from "@/components/InsightCard";
import { playNavSound } from "@/lib/sounds";

const WORLD_WIDTH = 2400;
const WORLD_HEIGHT = 3200;

const SHAPES: InsightCardData["shape"][] = ["circle", "chevron", "ring", "slash", "wave", "triangle"];

// Generate random positions spread across the world
function generateRandomPositions(count: number): { x: number; y: number }[] {
  const cols = 2;
  const result: { x: number; y: number }[] = [];
  for (let i = 0; i < count; i++) {
    const col = i % cols;
    const row = Math.floor(i / cols);
    result.push({
      x: 30 + col * 200 + Math.floor(Math.random() * 60),
      y: 500 + row * 420 + Math.floor(Math.random() * 80),
    });
  }
  return result;
}

const cardPositions = generateRandomPositions(8);

type View = "world" | "collection";

const Index = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [view, setView] = useState<View>("world");
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const [animating, setAnimating] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const offsetStart = useRef({ x: 0, y: 0 });
  const velocity = useRef({ x: 0, y: 0 });
  const lastPointer = useRef({ x: 0, y: 0, t: 0 });
  const animFrame = useRef<number>(0);
  const [containerSize, setContainerSize] = useState({ w: 390, h: 800 });
  const [cards, setCards] = useState<InsightCardData[]>(initialCards);
  const [positions, setPositions] = useState(cardPositions);
  const [showAddCard, setShowAddCard] = useState(false);
  const [savedCardIds, setSavedCardIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const update = () => setContainerSize({ w: el.clientWidth, h: el.clientHeight });
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  const clamp = useCallback(
    (x: number, y: number) => {
      const minX = -(WORLD_WIDTH - containerSize.w);
      const minY = -(WORLD_HEIGHT - containerSize.h);
      return {
        x: Math.max(minX, Math.min(0, x)),
        y: Math.max(minY, Math.min(0, y)),
      };
    },
    [containerSize]
  );

  const startInertia = useCallback(() => {
    const friction = 0.94;
    const step = () => {
      velocity.current.x *= friction;
      velocity.current.y *= friction;
      if (Math.abs(velocity.current.x) < 0.5 && Math.abs(velocity.current.y) < 0.5) {
        setAnimating(false);
        return;
      }
      setOffset((prev) => clamp(prev.x + velocity.current.x, prev.y + velocity.current.y));
      animFrame.current = requestAnimationFrame(step);
    };
    setAnimating(true);
    animFrame.current = requestAnimationFrame(step);
  }, [clamp]);

  const handlePointerDown = (e: React.PointerEvent) => {
    if ((e.target as HTMLElement).closest("[data-card]")) return;
    cancelAnimationFrame(animFrame.current);
    setAnimating(false);
    setDragging(true);
    dragStart.current = { x: e.clientX, y: e.clientY };
    offsetStart.current = { ...offset };
    lastPointer.current = { x: e.clientX, y: e.clientY, t: Date.now() };
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!dragging) return;
    const dx = e.clientX - dragStart.current.x;
    const dy = e.clientY - dragStart.current.y;
    const now = Date.now();
    const dt = Math.max(1, now - lastPointer.current.t);
    velocity.current = {
      x: ((e.clientX - lastPointer.current.x) / dt) * 16,
      y: ((e.clientY - lastPointer.current.y) / dt) * 16,
    };
    lastPointer.current = { x: e.clientX, y: e.clientY, t: now };
    setOffset(clamp(offsetStart.current.x + dx, offsetStart.current.y + dy));
  };

  const handlePointerUp = () => {
    if (!dragging) return;
    setDragging(false);
    if (Math.abs(velocity.current.x) > 1 || Math.abs(velocity.current.y) > 1) {
      startInertia();
    }
  };

  const navigateTo = (x: number, y: number, smooth = true) => {
    cancelAnimationFrame(animFrame.current);
    setAnimating(false);
    if (smooth) setAnimating(true);
    setOffset(clamp(x, y));
    if (smooth) setTimeout(() => setAnimating(false), 500);
  };

  // Hero text is centered in world — compute offset to center it in viewport
  const heroTextWorldX = WORLD_WIDTH / 2 - 180;
  const heroTextWorldY = 80;

  const goHome = () => {
    // Center the hero text block (360px wide, ~300px tall) in the viewport
    const targetX = -(heroTextWorldX - (containerSize.w - 360) / 2);
    const targetY = -(heroTextWorldY - 40); // small top padding
    navigateTo(targetX, targetY);
    playNavSound();
  };

  const toggleSaveCard = (card: InsightCardData) => {
    setSavedCardIds((prev) => {
      const next = new Set(prev);
      if (next.has(card.id)) next.delete(card.id);
      else next.add(card.id);
      return next;
    });
  };

  const handleSaveCard = (data: { title: string; subtitle: string; color: string; category: string }) => {
    const newCard: InsightCardData = {
      id: String(Date.now()),
      title: data.title,
      subtitle: data.subtitle,
      author: "You",
      color: data.color,
      shape: SHAPES[Math.floor(Math.random() * SHAPES.length)],
      tips: [data.subtitle || "A new insight to explore."],
    };
    const newPos = {
      x: 40 + Math.random() * (containerSize.w - 220),
      y: Math.max(...positions.map((p) => p.y)) + 200 + Math.random() * 200,
    };
    setCards((prev) => [...prev, newCard]);
    setPositions((prev) => [...prev, newPos]);
    setSavedCardIds((prev) => new Set(prev).add(newCard.id));
  };

  const savedCards = cards.filter((c) => savedCardIds.has(c.id));

  if (view === "collection") {
    return (
      <div className="min-h-screen bg-background flex justify-center overflow-hidden">
        <div className="w-full max-w-md relative">
          <MyCollection
            savedCards={savedCards}
            onBack={() => { setView("world"); playNavSound(); }}
            onAddNew={() => setShowAddCard(true)}
            onToggleSave={toggleSaveCard}
          />
          <AddCardModal
            open={showAddCard}
            onClose={() => setShowAddCard(false)}
            onSave={handleSaveCard}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex justify-center overflow-hidden">
      <div className="w-full max-w-md relative h-screen overflow-hidden" ref={containerRef}>
        {/* Minimap */}
        <Minimap
          worldWidth={WORLD_WIDTH}
          worldHeight={WORLD_HEIGHT}
          viewportWidth={containerSize.w}
          viewportHeight={containerSize.h}
          offsetX={offset.x}
          offsetY={offset.y}
          onNavigate={(x, y) => navigateTo(x, y)}
          savedMarkers={cards
            .filter((c) => savedCardIds.has(c.id))
            .map((c, ci) => {
              const idx = cards.indexOf(c);
              const pos = positions[idx];
              return pos || { x: 0, y: 0 };
            })}
        />

        {/* Pannable world */}
        <div
          className="absolute touch-none select-none"
          style={{
            width: WORLD_WIDTH,
            height: WORLD_HEIGHT,
            transform: `translate(${offset.x}px, ${offset.y}px)`,
            transition:
              !dragging && animating
                ? "none"
                : !dragging
                ? "transform 0.4s cubic-bezier(0.25,1,0.5,1)"
                : "none",
            cursor: dragging ? "grabbing" : "grab",
          }}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
        >
          {/* Hero text centered */}
          <div
            className="absolute flex flex-col items-center text-center"
            style={{ left: heroTextWorldX, top: heroTextWorldY, width: 360 }}
          >
            <h1 className="text-5xl font-extrabold leading-[1.05] tracking-tight text-foreground">
              Exploring<br />Minds
            </h1>
            <h2 className="text-5xl font-extrabold leading-[1.05] tracking-tight text-muted-foreground mt-1">
              Inspiring<br />Change
            </h2>
          </div>

          {/* Scattered cards */}
          {cards.map((card, i) => {
            const pos = positions[i] || { x: 100, y: 600 + i * 400 };
            return (
              <div
                key={card.id}
                data-card
                className="absolute"
                style={{ left: pos.x, top: pos.y, width: 170 }}
              >
                <InsightCard
                  card={card}
                  isSaved={savedCardIds.has(card.id)}
                  onToggleSave={toggleSaveCard}
                />
              </div>
            );
          })}

          {/* Decorative dots */}
          {[
            { x: 60, y: 800, s: 8 },
            { x: 350, y: 400, s: 12 },
            { x: 200, y: 1200, s: 6 },
            { x: 380, y: 900, s: 10 },
            { x: 100, y: 2200, s: 8 },
            { x: 320, y: 1700, s: 14 },
            { x: 180, y: 2600, s: 10 },
          ].map((d, i) => (
            <div
              key={`d-${i}`}
              className="absolute rounded-full bg-muted-foreground/15"
              style={{ left: d.x, top: d.y, width: d.s, height: d.s }}
            />
          ))}
        </div>

        {/* Bottom controls */}
        <div className="absolute bottom-6 left-0 right-0 z-40 flex items-center justify-center gap-3 px-6">
          <button
            onClick={goHome}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-foreground text-primary-foreground shadow-lg active:scale-95 transition-transform"
          >
            <Home className="w-4 h-4" />
            <span className="text-sm font-semibold">Home</span>
          </button>
          <button
            onClick={() => { setView("collection"); playNavSound(); }}
            className="p-3 rounded-full bg-foreground text-primary-foreground shadow-lg active:scale-95 transition-transform"
          >
            <User className="w-4 h-4" />
          </button>
          <button
            onClick={() => setShowAddCard(true)}
            className="p-3 rounded-full bg-accent text-accent-foreground shadow-lg active:scale-95 transition-transform"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        {/* Add Card Modal */}
        <AddCardModal
          open={showAddCard}
          onClose={() => setShowAddCard(false)}
          onSave={handleSaveCard}
        />
      </div>
    </div>
  );
};

export default Index;
