import { useState } from "react";
import { Search, Plus, ChevronLeft, ArrowUpDown } from "lucide-react";
import InsightCard, { type InsightCardData } from "@/components/InsightCard";

interface MyCollectionProps {
  savedCards: InsightCardData[];
  onBack: () => void;
  onAddNew: () => void;
  onToggleSave: (card: InsightCardData) => void;
}

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
            placeholder="I need..."
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
              <InsightCard
                key={card.id}
                card={card}
                isSaved={true}
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
