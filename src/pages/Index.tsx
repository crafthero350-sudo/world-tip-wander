import { useState } from "react";
import { ChevronLeft } from "lucide-react";
import InsightCard from "@/components/InsightCard";
import { cards } from "@/data/cards";

const categories = [
  { label: "Top Shows", count: 993 },
  { label: "Comedy", count: 712 },
  { label: "Wellness", count: 458 },
  { label: "Culture", count: 321 },
];

type View = "hero" | "explore";

const Index = () => {
  const [view, setView] = useState<View>("hero");
  const [activeCategory, setActiveCategory] = useState(0);

  return (
    <div className="min-h-screen bg-background flex justify-center">
      <div className="w-full max-w-md relative flex flex-col min-h-screen">
        {view === "hero" ? (
          <>
            {/* Hero */}
            <div className="flex-1 flex flex-col justify-center px-6 pt-12">
              <h1 className="text-5xl font-extrabold leading-[1.05] tracking-tight text-foreground">
                Exploring<br />Minds
              </h1>
              <h2 className="text-5xl font-extrabold leading-[1.05] tracking-tight text-muted-foreground mt-0">
                Inspiring<br />Change
              </h2>
            </div>

            {/* Featured cards */}
            <div className="px-6 pb-4">
              <div className="grid grid-cols-2 gap-3">
                {cards.slice(0, 2).map((card) => (
                  <InsightCard key={card.id} card={card} />
                ))}
              </div>
            </div>

            {/* Bottom nav */}
            <div className="px-6 pb-6 flex items-center gap-4">
              <button
                onClick={() => setView("explore")}
                className="p-2 rounded-full border border-border"
              >
                <ChevronLeft className="w-4 h-4 text-foreground rotate-180" />
              </button>
              {categories.map((cat, i) => (
                <button
                  key={cat.label}
                  onClick={() => { setActiveCategory(i); setView("explore"); }}
                  className="flex items-baseline gap-1.5"
                >
                  <span className={`text-sm font-semibold ${i === activeCategory ? "text-foreground" : "text-muted-foreground"}`}>
                    {cat.label}
                  </span>
                  <span className="text-xs text-muted-foreground">{cat.count}</span>
                </button>
              ))}
            </div>
          </>
        ) : (
          <>
            {/* Explore header */}
            <div className="px-6 pt-8 pb-4 flex items-center gap-3">
              <button onClick={() => setView("hero")} className="p-2 rounded-full border border-border">
                <ChevronLeft className="w-4 h-4 text-foreground" />
              </button>
              <h1 className="text-lg font-bold text-foreground">{categories[activeCategory].label}</h1>
            </div>

            {/* Card grid */}
            <div className="px-6 pb-8 grid grid-cols-2 gap-3 flex-1">
              {cards.map((card) => (
                <InsightCard key={card.id} card={card} />
              ))}
            </div>

            {/* Category tabs */}
            <div className="px-6 pb-6 flex items-center gap-4 sticky bottom-0 bg-background pt-3">
              <button onClick={() => setView("hero")} className="p-2 rounded-full border border-border">
                <ChevronLeft className="w-4 h-4 text-foreground" />
              </button>
              {categories.map((cat, i) => (
                <button
                  key={cat.label}
                  onClick={() => setActiveCategory(i)}
                  className="flex items-baseline gap-1.5"
                >
                  <span className={`text-sm font-semibold ${i === activeCategory ? "text-foreground" : "text-muted-foreground"}`}>
                    {cat.label}
                  </span>
                  <span className="text-xs text-muted-foreground">{cat.count}</span>
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Index;
