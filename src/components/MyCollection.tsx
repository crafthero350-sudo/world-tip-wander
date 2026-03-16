import { useState, useRef } from "react";
import { Search, Plus, ChevronLeft, ArrowUpDown, Trash2 } from "lucide-react";
import InsightCard, { type InsightCardData } from "@/components/InsightCard";
import { playDeleteSound } from "@/lib/sounds";

interface MyCollectionProps {
  savedCards: InsightCardData[];
  onBack: () => void;
  onAddNew: () => void;
  onToggleSave: (card: InsightCardData) => void;
}

const SwipeableCard = ({
  card,
  onDelete,
  onToggleSave,
}: {
  card: InsightCardData;
  onDelete: (card: InsightCardData) => void;
  onToggleSave: (card: InsightCardData) => void;
}) => {
  const [offsetX, setOffsetX] = useState(0);
  const [swiping, setSwiping] = useState(false);
  const startX = useRef(0);
  const startY = useRef(0);
  const locked = useRef(false);

  const handleTouchStart = (e: React.TouchEvent) => {
    startX.current = e.touches[0].clientX;
    startY.current = e.touches[0].clientY;
    locked.current = false;
    setSwiping(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!swiping) return;
    const dx = e.touches[0].clientX - startX.current;
    const dy = e.touches[0].clientY - startY.current;
    // Lock direction on first significant move
    if (!locked.current && (Math.abs(dx) > 5 || Math.abs(dy) > 5)) {
      locked.current = true;
      if (Math.abs(dy) > Math.abs(dx)) {
        setSwiping(false);
        return;
      }
    }
    if (dx < 0) setOffsetX(dx);
  };

  const handleTouchEnd = () => {
    setSwiping(false);
    if (offsetX < -80) {
      setOffsetX(-120);
    } else {
      setOffsetX(0);
    }
  };

  const handleDelete = () => {
    playDeleteSound();
    onDelete(card);
  };

  return (
    <div className="relative overflow-hidden rounded-2xl">
      {/* Delete background */}
      <div className="absolute inset-0 flex items-center justify-end pr-4 bg-destructive rounded-2xl">
        <button onClick={handleDelete} className="flex flex-col items-center gap-1">
          <Trash2 className="w-5 h-5 text-destructive-foreground" />
          <span className="text-[10px] text-destructive-foreground font-medium">Delete</span>
        </button>
      </div>
      {/* Card content */}
      <div
        className="relative z-10"
        style={{
          transform: `translateX(${offsetX}px)`,
          transition: swiping ? "none" : "transform 0.3s ease-out",
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <InsightCard card={card} isSaved={true} onToggleSave={onToggleSave} />
      </div>
    </div>
  );
};

const MyCollection = ({ savedCards, onBack, onAddNew, onToggleSave }: MyCollectionProps) => {
  const [search, setSearch] = useState("");

  const filtered = savedCards.filter(
    (c) =>
      c.title.toLowerCase().includes(search.toLowerCase()) ||
      c.subtitle.toLowerCase().includes(search.toLowerCase()) ||
      c.author.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Header */}
      <div className="px-5 pt-6 pb-3 flex items-center gap-3">
        <button onClick={onBack} className="p-2 rounded-full bg-muted">
          <ChevronLeft className="w-4 h-4 text-foreground" />
        </button>
        <div className="flex-1 text-center">
          <h1 className="text-lg font-bold text-foreground">My Collection</h1>
          <p className="text-xs text-muted-foreground">
            {savedCards.length} card{savedCards.length !== 1 ? "s" : ""}
          </p>
        </div>
        <button onClick={onAddNew} className="p-2 rounded-full bg-muted">
          <Plus className="w-4 h-4 text-foreground" />
        </button>
      </div>

      {/* Search bar */}
      <div className="px-5 pb-3">
        <div className="flex items-center gap-2 bg-muted rounded-xl px-3 py-2.5">
          <Search className="w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search cards..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none flex-1"
          />
          <button className="p-1">
            <ArrowUpDown className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>
      </div>

      {/* Cards grid */}
      <div className="flex-1 overflow-y-auto px-5 pb-24">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
              <Search className="w-6 h-6 text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground text-center">
              {savedCards.length === 0
                ? "No cards yet. Save cards from the world or add new ones!"
                : "No cards match your search."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {filtered.map((card) => (
              <SwipeableCard
                key={card.id}
                card={card}
                onDelete={(c) => onToggleSave(c)}
                onToggleSave={onToggleSave}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyCollection;
