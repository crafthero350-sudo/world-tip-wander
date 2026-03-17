import { useState } from "react";
import { createPortal } from "react-dom";
import { Search, Plus, ChevronLeft, ArrowUpDown, Trash2, Share, Heart } from "lucide-react";
import InsightCard, { type InsightCardData } from "@/components/InsightCard";
import { playDeleteSound } from "@/lib/sounds";

interface MyCollectionProps {
  savedCards: InsightCardData[];
  onBack: () => void;
  onAddNew: () => void;
  onToggleSave: (card: InsightCardData) => void;
}

const LongPressCard = ({
  card,
  onDelete,
  onToggleSave,
  tall,
}: {
  card: InsightCardData;
  onDelete: (card: InsightCardData) => void;
  onToggleSave: (card: InsightCardData) => void;
  tall?: boolean;
}) => {
  const [menuOpen, setMenuOpen] = useState(false);

  const handleContextMenu = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    setMenuOpen(true);
  };

  const handleDelete = () => {
    playDeleteSound();
    onDelete(card);
    setMenuOpen(false);
  };

  return (
    <div className={`relative rounded-2xl ${tall ? "row-span-2" : ""}`}>
      <div onContextMenu={handleContextMenu}>
        <InsightCard card={card} isSaved={true} onToggleSave={onToggleSave} />
      </div>

      {menuOpen &&
        createPortal(
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
            onClick={() => setMenuOpen(false)}
          >
            <div
              className="flex flex-col items-center gap-3 w-[260px]"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Card preview */}
              <div className="w-full rounded-2xl overflow-hidden shadow-xl pointer-events-none scale-95">
                <InsightCard card={card} isSaved={true} onToggleSave={() => {}} />
              </div>

              {/* Menu options */}
              <div className="w-full rounded-2xl bg-popover overflow-hidden shadow-xl">
                <button
                  onClick={() => setMenuOpen(false)}
                  className="w-full flex items-center justify-between px-4 py-3 text-sm text-popover-foreground active:bg-muted transition-colors"
                >
                  <span>Share</span>
                  <Share className="w-4 h-4 text-muted-foreground" />
                </button>
                <div className="h-px bg-border mx-2" />
                <button
                  onClick={() => {
                    onToggleSave(card);
                    setMenuOpen(false);
                  }}
                  className="w-full flex items-center justify-between px-4 py-3 text-sm text-popover-foreground active:bg-muted transition-colors"
                >
                  <span>Love</span>
                  <Heart className="w-4 h-4 text-muted-foreground" />
                </button>
                <div className="h-px bg-border mx-2" />
                <button
                  onClick={handleDelete}
                  className="w-full flex items-center justify-between px-4 py-3 text-sm text-destructive active:bg-muted transition-colors"
                >
                  <span>Delete</span>
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}
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
      <div className="px-5 pt-6 pb-2 flex items-center gap-3">
        <button onClick={onBack} className="p-2 rounded-full bg-muted">
          <ChevronLeft className="w-4 h-4 text-foreground" />
        </button>
        <div className="flex-1 text-center">
          <h1 className="text-lg font-bold text-foreground">Insight Board</h1>
          <p className="text-[11px] text-muted-foreground">
            {savedCards.length} item{savedCards.length !== 1 ? "s" : ""}
          </p>
        </div>
        <button onClick={onAddNew} className="p-2 rounded-full bg-muted">
          <Plus className="w-4 h-4 text-foreground" />
        </button>
      </div>

      {/* Cards masonry grid */}
      <div className="flex-1 overflow-y-auto px-4 pb-24 pt-2">
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
          <div className="grid grid-cols-2 gap-3 auto-rows-auto">
            {filtered.map((card, i) => (
              <LongPressCard
                key={card.id}
                card={card}
                onDelete={(c) => onToggleSave(c)}
                onToggleSave={onToggleSave}
                tall={i % 3 === 0}
              />
            ))}
          </div>
        )}
      </div>

      {/* Bottom search bar */}
      <div className="absolute bottom-0 left-0 right-0 bg-background border-t border-border px-4 py-3 flex items-center gap-2">
        <div className="flex items-center gap-2 bg-muted rounded-xl px-3 py-2.5 flex-1">
          <Search className="w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="I need..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none flex-1"
          />
        </div>
        <button className="p-2.5 rounded-xl bg-muted">
          <ArrowUpDown className="w-4 h-4 text-muted-foreground" />
        </button>
        <button onClick={onAddNew} className="p-2.5 rounded-xl bg-muted">
          <Plus className="w-4 h-4 text-muted-foreground" />
        </button>
      </div>
    </div>
  );
};

export default MyCollection;
