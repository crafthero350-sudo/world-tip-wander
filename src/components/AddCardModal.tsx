import { useState } from "react";
import { ChevronLeft, X, Link2, Share2, PenLine, Check } from "lucide-react";

const NOTE_COLORS = [
  { name: "yellow", hsl: "52 100% 70%", var: "card-yellow" },
  { name: "mint", hsl: "160 45% 78%", var: "card-mint" },
  { name: "lavender", hsl: "245 60% 82%", var: "card-lavender" },
  { name: "pink", hsl: "320 60% 82%", var: "card-pink" },
  { name: "sky", hsl: "195 70% 78%", var: "card-sky" },
];

const CATEGORIES = ["Wellness", "Culture", "Comedy", "Top Shows"];

interface AddCardModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: {
    title: string;
    subtitle: string;
    color: string;
    category: string;
  }) => void;
}

const AddCardModal = ({ open, onClose, onSave }: AddCardModalProps) => {
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [selectedColor, setSelectedColor] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  if (!open) return null;

  const handleSave = () => {
    if (!title.trim()) return;
    onSave({
      title: title.trim(),
      subtitle: subtitle.trim() || "New Note",
      color: NOTE_COLORS[selectedColor].var,
      category: selectedCategory || "Top Shows",
    });
    setTitle("");
    setSubtitle("");
    setSelectedColor(0);
    setSelectedCategory(null);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/30 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm rounded-3xl bg-background shadow-2xl overflow-hidden animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 pt-4 pb-2">
          <button onClick={onClose} className="p-2 rounded-full bg-muted">
            <ChevronLeft className="w-4 h-4 text-foreground" />
          </button>
          <button onClick={onClose} className="p-2 rounded-full bg-muted">
            <X className="w-4 h-4 text-foreground" />
          </button>
        </div>

        {/* Note area */}
        <div className="px-6 pb-4">
          <div
            className="rounded-2xl p-5 min-h-[180px] flex flex-col gap-2 shadow-sm"
            style={{
              backgroundColor: `hsl(${NOTE_COLORS[selectedColor].hsl})`,
            }}
          >
            <input
              type="text"
              placeholder="Card title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="bg-transparent text-card-foreground font-bold text-lg placeholder:text-card-foreground/40 outline-none w-full"
            />
            <textarea
              placeholder="Add text to this note"
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
              className="bg-transparent text-card-foreground/70 text-sm placeholder:text-card-foreground/40 outline-none w-full flex-1 resize-none min-h-[80px]"
            />
          </div>
        </div>

        {/* Note color */}
        <div className="px-6 pb-3">
          <p className="text-xs text-muted-foreground mb-2">Note color</p>
          <div className="flex gap-2">
            {NOTE_COLORS.map((c, i) => (
              <button
                key={c.name}
                onClick={() => setSelectedColor(i)}
                className="w-7 h-7 rounded-full border-2 transition-all flex items-center justify-center"
                style={{
                  backgroundColor: `hsl(${c.hsl})`,
                  borderColor:
                    i === selectedColor
                      ? "hsl(var(--foreground))"
                      : "transparent",
                }}
              >
                {i === selectedColor && (
                  <Check className="w-3 h-3 text-card-foreground" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Category */}
        <div className="px-6 pb-3">
          <p className="text-xs text-muted-foreground mb-2">Category</p>
          <div className="flex gap-2 flex-wrap">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                  selectedCategory === cat
                    ? "bg-foreground text-primary-foreground border-foreground"
                    : "bg-muted text-muted-foreground border-border"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Bottom actions */}
        <div className="px-6 pb-5 pt-2 flex items-center justify-between gap-2">
          <button className="flex flex-col items-center gap-1 px-3 py-2 rounded-xl bg-muted flex-1">
            <Link2 className="w-4 h-4 text-muted-foreground" />
            <span className="text-[10px] text-muted-foreground">Copy link</span>
          </button>
          <button className="flex flex-col items-center gap-1 px-3 py-2 rounded-xl bg-muted flex-1">
            <Share2 className="w-4 h-4 text-muted-foreground" />
            <span className="text-[10px] text-muted-foreground">Share</span>
          </button>
          <button className="flex flex-col items-center gap-1 px-3 py-2 rounded-xl bg-muted flex-1">
            <PenLine className="w-4 h-4 text-muted-foreground" />
            <span className="text-[10px] text-muted-foreground">Draw</span>
          </button>
          <button
            onClick={handleSave}
            className="flex flex-col items-center gap-1 px-3 py-2 rounded-xl bg-foreground flex-1"
          >
            <Check className="w-4 h-4 text-primary-foreground" />
            <span className="text-[10px] text-primary-foreground font-semibold">Save</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddCardModal;
