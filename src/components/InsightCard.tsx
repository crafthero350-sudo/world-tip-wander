import { useState, useRef, useEffect } from "react";
import { ChevronLeft, X, Bookmark, BookmarkCheck, ImagePlus } from "lucide-react";
import { playOpenSound, playCloseSound, playNavSound, playSaveSound } from "@/lib/sounds";

import bgOcean from "@/assets/card-bg-ocean.jpg";
import bgGolden from "@/assets/card-bg-golden.jpg";
import bgForest from "@/assets/card-bg-forest.jpg";
import bgParchment from "@/assets/card-bg-parchment.jpg";
import bgNight from "@/assets/card-bg-night.jpg";
import bgLavender from "@/assets/card-bg-lavender.jpg";

const CARD_BACKGROUNDS = [bgOcean, bgGolden, bgForest, bgParchment, bgNight, bgLavender];

export interface InsightCardData {
  id: string;
  title: string;
  subtitle: string;
  author: string;
  color: string;
  shape: "circle" | "chevron" | "ring" | "slash" | "wave" | "triangle";
  tips: string[];
  backgroundImage?: string; // custom user-uploaded background
  bgIndex?: number; // index into CARD_BACKGROUNDS
}

const ShapeIcon = ({ shape }: { shape: string }) => {
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

const useInView = (threshold = 0.3) => {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          obs.disconnect();
        }
      },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);

  return { ref, inView };
};

interface Props {
  card: InsightCardData;
  isSaved?: boolean;
  onToggleSave?: (card: InsightCardData) => void;
}

const InsightCard = ({ card, isSaved, onToggleSave }: Props) => {
  const [isOpen, setIsOpen] = useState(false);
  const saved = isSaved ?? false;
  const [tipIndex, setTipIndex] = useState(0);
  const { ref, inView } = useInView(0.2);
  const [customBg, setCustomBg] = useState<string | null>(card.backgroundImage || null);

  // Determine background image for reading view
  const bgIdx = card.bgIndex ?? (parseInt(card.id) % CARD_BACKGROUNDS.length);
  const readingBg = customBg || CARD_BACKGROUNDS[bgIdx] || bgOcean;
  const isDarkBg = !customBg && [0, 4].includes(bgIdx); // ocean and night are dark

  const handleOpen = () => {
    setIsOpen(true);
    setTipIndex(0);
    playOpenSound();
  };

  const handleClose = () => {
    setIsOpen(false);
    playCloseSound();
  };

  const handleSave = () => {
    onToggleSave?.(card);
    playSaveSound();
  };

  const handleNav = (dir: number) => {
    setTipIndex((prev) => prev + dir);
    playNavSound();
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setCustomBg(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  if (isOpen) {
    const textColor = isDarkBg && !customBg ? "text-white" : "text-card-foreground";
    const subTextColor = isDarkBg && !customBg ? "text-white/70" : "text-card-foreground/70";
    const mutedColor = isDarkBg && !customBg ? "text-white/50" : "text-card-foreground/50";

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 p-4" onClick={handleClose}>
        <div
          className="w-full max-w-sm rounded-3xl relative animate-scale-in overflow-hidden"
          style={{ minHeight: 480 }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Background image */}
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${readingBg})` }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/40" />

          {/* Content overlay */}
          <div className="relative z-10 p-6 flex flex-col min-h-[480px]">
            {/* Top actions */}
            <div className="flex items-center justify-between mb-6">
              <button onClick={handleClose} className="p-2 rounded-full bg-black/20 backdrop-blur-sm">
                <X className="w-5 h-5 text-white" />
              </button>
              <div className="flex items-center gap-2">
                <label className="p-2 rounded-full bg-black/20 backdrop-blur-sm cursor-pointer">
                  <ImagePlus className="w-5 h-5 text-white" />
                  <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                </label>
                <button onClick={handleSave} className="p-2 rounded-full bg-black/20 backdrop-blur-sm">
                  {saved ? <BookmarkCheck className="w-5 h-5 text-white" /> : <Bookmark className="w-5 h-5 text-white" />}
                </button>
              </div>
            </div>

            {/* Spacer to push text down like reference images */}
            <div className="flex-1" />

            {/* Text content - positioned like a poem/quote overlay */}
            <div className="space-y-4">
              <div>
                <h2 className="text-2xl font-bold text-white drop-shadow-lg leading-tight">{card.title}</h2>
                <p className="text-sm text-white/80 drop-shadow-md mt-1">{card.subtitle}</p>
              </div>

              <div className="space-y-1">
                <p className="text-white text-base leading-relaxed drop-shadow-md font-light">
                  {card.tips[tipIndex]}
                </p>
              </div>

              <div className="flex items-center justify-between pt-2">
                <button
                  onClick={() => handleNav(-1)}
                  disabled={tipIndex === 0}
                  className="px-4 py-1.5 rounded-full bg-white/15 backdrop-blur-sm text-white text-sm disabled:opacity-30 transition-opacity"
                >
                  Previous
                </button>
                <span className="text-xs text-white/60">{tipIndex + 1} / {card.tips.length}</span>
                <button
                  onClick={() => handleNav(1)}
                  disabled={tipIndex === card.tips.length - 1}
                  className="px-4 py-1.5 rounded-full bg-white/15 backdrop-blur-sm text-white text-sm disabled:opacity-30 transition-opacity"
                >
                  Next
                </button>
              </div>

              <p className="text-xs text-white/40 text-right">— {card.author}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={ref}
      className={`transition-all duration-500 ${inView ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-4 scale-95"}`}
    >
      <button
        onClick={handleOpen}
        className="rounded-2xl p-4 text-left flex flex-col justify-between aspect-[4/5] transition-transform active:scale-95 w-full"
        style={{ backgroundColor: `hsl(var(--${card.color}))` }}
      >
        <div>
          <h3 className="text-base font-bold text-card-foreground leading-tight">{card.title}</h3>
          <p className="text-sm text-card-foreground/70">{card.subtitle}</p>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <ShapeIcon shape={card.shape} />
        </div>
        <p className="text-xs text-card-foreground/50">{card.author}</p>
      </button>
    </div>
  );
};

export default InsightCard;
