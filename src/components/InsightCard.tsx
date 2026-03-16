import { useState } from "react";
import { ChevronLeft, X, Bookmark, BookmarkCheck } from "lucide-react";

export interface InsightCardData {
  id: string;
  title: string;
  subtitle: string;
  author: string;
  color: string;
  shape: "circle" | "chevron" | "ring" | "slash" | "wave" | "triangle";
  tips: string[];
}

const ShapeIcon = ({ shape, color }: { shape: string; color: string }) => {
  const darker = color.replace(/\/[0-9.]+\)/, "/0.6)");
  switch (shape) {
    case "chevron":
      return (
        <svg viewBox="0 0 80 80" className="w-16 h-16">
          <path d="M20 60 L40 20 L60 60" fill="none" stroke="hsl(0 0% 45%)" strokeWidth="12" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case "ring":
      return (
        <svg viewBox="0 0 80 80" className="w-16 h-16">
          <circle cx="40" cy="40" r="24" fill="none" stroke="hsl(0 0% 40%)" strokeWidth="10" />
          <circle cx="40" cy="40" r="8" fill="hsl(0 0% 40%)" />
        </svg>
      );
    case "circle":
      return (
        <svg viewBox="0 0 80 80" className="w-16 h-16">
          <circle cx="40" cy="40" r="28" fill="hsl(0 0% 100% / 0.5)" />
        </svg>
      );
    case "slash":
      return (
        <svg viewBox="0 0 80 80" className="w-16 h-16">
          <line x1="55" y1="15" x2="25" y2="65" stroke="hsl(145 50% 35%)" strokeWidth="10" strokeLinecap="round" />
        </svg>
      );
    case "wave":
      return (
        <svg viewBox="0 0 80 80" className="w-16 h-16">
          <path d="M10 50 Q25 20 40 40 Q55 60 70 30" fill="none" stroke="hsl(245 60% 65%)" strokeWidth="6" strokeLinecap="round" />
        </svg>
      );
    case "triangle":
      return (
        <svg viewBox="0 0 80 80" className="w-16 h-16">
          <circle cx="40" cy="40" r="26" fill="hsl(280 55% 80%)" />
          <line x1="25" y1="55" x2="55" y2="55" stroke="hsl(280 40% 60%)" strokeWidth="4" />
        </svg>
      );
    default:
      return null;
  }
};

interface Props {
  card: InsightCardData;
}

const InsightCard = ({ card }: Props) => {
  const [isOpen, setIsOpen] = useState(false);
  const [saved, setSaved] = useState(false);
  const [tipIndex, setTipIndex] = useState(0);

  if (isOpen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 p-4" onClick={() => setIsOpen(false)}>
        <div
          className="w-full max-w-sm rounded-2xl p-6 relative"
          style={{ backgroundColor: `hsl(var(--${card.color}))` }}
          onClick={(e) => e.stopPropagation()}
        >
          <button onClick={() => setIsOpen(false)} className="absolute top-4 right-4 p-1 rounded-full bg-foreground/10">
            <X className="w-5 h-5 text-card-foreground" />
          </button>
          <button onClick={() => setSaved(!saved)} className="absolute top-4 right-14 p-1 rounded-full bg-foreground/10">
            {saved ? <BookmarkCheck className="w-5 h-5 text-card-foreground" /> : <Bookmark className="w-5 h-5 text-card-foreground" />}
          </button>

          <h2 className="text-xl font-bold text-card-foreground">{card.title}</h2>
          <p className="text-sm text-card-foreground/70 mb-1">{card.subtitle}</p>
          <p className="text-xs text-card-foreground/50 mb-6">{card.author}</p>

          <div className="bg-foreground/5 rounded-xl p-4 min-h-[120px] flex items-center justify-center">
            <p className="text-card-foreground text-center text-lg font-medium">{card.tips[tipIndex]}</p>
          </div>

          <div className="flex items-center justify-between mt-4">
            <button
              onClick={() => setTipIndex(Math.max(0, tipIndex - 1))}
              disabled={tipIndex === 0}
              className="px-3 py-1.5 rounded-lg bg-foreground/10 text-card-foreground text-sm disabled:opacity-30"
            >
              Previous
            </button>
            <span className="text-xs text-card-foreground/60">{tipIndex + 1} / {card.tips.length}</span>
            <button
              onClick={() => setTipIndex(Math.min(card.tips.length - 1, tipIndex + 1))}
              disabled={tipIndex === card.tips.length - 1}
              className="px-3 py-1.5 rounded-lg bg-foreground/10 text-card-foreground text-sm disabled:opacity-30"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <button
      onClick={() => { setIsOpen(true); setTipIndex(0); }}
      className="rounded-2xl p-4 text-left flex flex-col justify-between aspect-[4/5] transition-transform active:scale-95"
      style={{ backgroundColor: `hsl(var(--${card.color}))` }}
    >
      <div>
        <h3 className="text-base font-bold text-card-foreground leading-tight">{card.title}</h3>
        <p className="text-sm text-card-foreground/70">{card.subtitle}</p>
      </div>
      <div className="flex-1 flex items-center justify-center">
        <ShapeIcon shape={card.shape} color={`hsl(var(--${card.color}))`} />
      </div>
      <p className="text-xs text-card-foreground/50">{card.author}</p>
    </button>
  );
};

export default InsightCard;
