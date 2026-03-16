import { useState, useRef, useCallback, useEffect, useMemo } from "react";
import { Home, Plus, User } from "lucide-react";
import InsightCard from "@/components/InsightCard";
import Minimap from "@/components/Minimap";
import AddCardModal from "@/components/AddCardModal";
import MyCollection from "@/components/MyCollection";
import { cards as initialCards } from "@/data/cards";
import type { InsightCardData } from "@/components/InsightCard";
import { playNavSound } from "@/lib/sounds";

const BASE_WORLD_WIDTH = 2400;
const BASE_WORLD_HEIGHT = 2000;
const CARDS_PER_EXPANSION = 4;
const EXPANSION_HEIGHT = 600;

const SHAPES: InsightCardData["shape"][] = ["circle", "chevron", "ring", "slash", "wave", "triangle"];

const HERO_WIDTH = 360;
const HERO_Y = 80;
const HERO_HEIGHT = 280;
const MIN_CARD_DISTANCE = 200; // minimum distance between cards
const CARD_WIDTH = 170;
const CARD_HEIGHT = 210;

// Generate positions randomly around hero with minimum spacing
function generatePositionsAroundHero(
  count: number,
  worldWidth: number,
  existingPositions: { x: number; y: number }[] = []
): { x: number; y: number }[] {
  const heroCenterX = worldWidth / 2;
  const heroCenterY = HERO_Y + HERO_HEIGHT / 2;
  const result: { x: number; y: number }[] = [...existingPositions];

  for (let i = existingPositions.length; i < count; i++) {
    let bestPos = { x: 0, y: 0 };
    let placed = false;

    for (let attempt = 0; attempt < 80; attempt++) {
      // Random angle around hero center
      const angle = Math.random() * Math.PI * 2;
      // Random distance — closer cards, radius 250-700
      const radius = 250 + Math.random() * 450;

      const x = heroCenterX + Math.cos(angle) * radius - CARD_WIDTH / 2;
      const y = heroCenterY + Math.sin(angle) * radius;

      // Keep within world bounds
      if (x < 20 || x > worldWidth - CARD_WIDTH - 20 || y < 20) continue;

      // Check minimum distance to all existing cards
      let tooClose = false;
      for (const pos of result) {
        const dx = x - pos.x;
        const dy = y - pos.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < MIN_CARD_DISTANCE) {
          tooClose = true;
          break;
        }
      }

      if (!tooClose) {
        bestPos = { x: Math.round(x), y: Math.round(y) };
        placed = true;
        break;
      }
    }

    if (!placed) {
      // Fallback: place further out
      const angle = (i / count) * Math.PI * 2;
      const radius = 400 + i * 60;
      bestPos = {
        x: Math.round(Math.max(20, Math.min(worldWidth - CARD_WIDTH - 20, heroCenterX + Math.cos(angle) * radius - CARD_WIDTH / 2))),
        y: Math.round(Math.max(HERO_Y + HERO_HEIGHT + 50, heroCenterY + Math.sin(angle) * radius)),
      };
    }

    result.push(bestPos);
  }

  return result;
}

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
  const [positions, setPositions] = useState(() =>
    generatePositionsAroundHero(initialCards.length, BASE_WORLD_WIDTH)
  );
  const [showAddCard, setShowAddCard] = useState(false);
  const [savedCardIds, setSavedCardIds] = useState<Set<string>>(new Set());

  // Dynamic world size
  const worldSize = useMemo(() => {
    const maxY = positions.length > 0 ? Math.max(...positions.map((p) => p.y)) : 0;
    const extraSets = Math.max(0, Math.floor((cards.length - 8) / CARDS_PER_EXPANSION));
    return {
      w: BASE_WORLD_WIDTH,
      h: Math.max(BASE_WORLD_HEIGHT, maxY + CARD_HEIGHT + 400 + extraSets * EXPANSION_HEIGHT),
    };
  }, [cards.length, positions]);

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
      const minX = -(worldSize.w - containerSize.w);
      const minY = -(worldSize.h - containerSize.h);
      return {
        x: Math.max(minX, Math.min(0, x)),
        y: Math.max(minY, Math.min(0, y)),
      };
    },
    [containerSize, worldSize]
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

  const heroTextWorldX = worldSize.w / 2 - HERO_WIDTH / 2;

  const goHome = () => {
    const targetX = -(heroTextWorldX - (containerSize.w - HERO_WIDTH) / 2);
    const targetY = -(HERO_Y - 40);
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
    // Generate a new position around hero, respecting spacing
    const newPositions = generatePositionsAroundHero(
      positions.length + 1,
      worldSize.w,
      positions
    );
    setCards((prev) => [...prev, newCard]);
    setPositions(newPositions);
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
        <Minimap
          worldWidth={worldSize.w}
          worldHeight={worldSize.h}
          viewportWidth={containerSize.w}
          viewportHeight={containerSize.h}
          offsetX={offset.x}
          offsetY={offset.y}
          onNavigate={(x, y) => navigateTo(x, y)}
          savedMarkers={cards
            .filter((c) => savedCardIds.has(c.id))
            .map((c) => {
              const idx = cards.indexOf(c);
              return positions[idx] || { x: 0, y: 0 };
            })}
        />

        <div
          className="absolute touch-none select-none"
          style={{
            width: worldSize.w,
            height: worldSize.h,
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
          {/* Hero text */}
          <div
            className="absolute flex flex-col items-center text-center"
            style={{ left: heroTextWorldX, top: HERO_Y, width: HERO_WIDTH }}
          >
            <h1 className="text-5xl font-extrabold leading-[1.05] tracking-tight text-foreground">
              Exploring<br />Minds
            </h1>
            <h2 className="text-5xl font-extrabold leading-[1.05] tracking-tight text-muted-foreground mt-1">
              Inspiring<br />Change
            </h2>
          </div>

          {/* Cards */}
          {cards.map((card, i) => {
            const pos = positions[i] || { x: 100, y: 600 + i * 400 };
            return (
              <div
                key={card.id}
                data-card
                className="absolute"
                style={{ left: pos.x, top: pos.y, width: CARD_WIDTH }}
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
            className="relative p-3 rounded-full bg-foreground text-primary-foreground shadow-lg active:scale-95 transition-transform"
          >
            <User className="w-4 h-4" />
            {savedCardIds.size > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] flex items-center justify-center rounded-full bg-accent text-accent-foreground text-[10px] font-bold px-1">
                {savedCardIds.size}
              </span>
            )}
          </button>
          <button
            onClick={() => setShowAddCard(true)}
            className="p-3 rounded-full bg-accent text-accent-foreground shadow-lg active:scale-95 transition-transform"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

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
