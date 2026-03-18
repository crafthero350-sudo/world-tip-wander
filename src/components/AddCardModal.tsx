import { useState } from "react";
import { ChevronLeft, Settings, Link2, Share2, PenLine, Check } from "lucide-react";
import BlockEditor, { type Block } from "./BlockEditor";

const NOTE_COLORS = [
  { name: "coral", hsl: "15 80% 65%", var: "card-yellow" },
  { name: "yellow", hsl: "48 100% 76%", var: "card-yellow" },
  { name: "green", hsl: "145 50% 62%", var: "card-mint" },
  { name: "blue", hsl: "210 60% 70%", var: "card-sky" },
  { name: "purple", hsl: "270 55% 72%", var: "card-lavender" },
];

const CATEGORIES = ["Groceries", "Party Supplies", "Household Items"];

const COLLABORATORS = [
  { name: "Ethan Caldwell", color: "hsl(270 55% 72%)" },
  { name: "Liam Foster", color: "hsl(320 60% 75%)" },
  { name: "Sophie", color: "hsl(145 50% 62%)" },
];

interface AddCardModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: {
    title: string;
    subtitle: string;
    color: string;
    category: string;
    blocks?: Block[];
  }) => void;
}

const AddCardModal = ({ open, onClose, onSave }: AddCardModalProps) => {
  const [title, setTitle] = useState("");
  const [selectedColor, setSelectedColor] = useState(1); // yellow default
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [blocks, setBlocks] = useState<Block[]>([
    { id: "initial", type: "text", content: "" },
  ]);

  if (!open) return null;

  const handleSave = () => {
    if (!title.trim()) return;
    const subtitle = blocks.map((b) => b.content).filter(Boolean).join(" ") || "New Note";
    onSave({
      title: title.trim(),
      subtitle: subtitle.slice(0, 60),
      color: NOTE_COLORS[selectedColor].var,
      category: selectedCategory || "Groceries",
      blocks,
    });
    setTitle("");
    setBlocks([{ id: String(Date.now()), type: "text", content: "" }]);
    setSelectedColor(1);
    setSelectedCategory(null);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/30 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm rounded-3xl bg-background shadow-2xl overflow-hidden animate-scale-in max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 pt-4 pb-2">
          <div className="flex items-center gap-1 bg-[hsl(145_50%_62%)] rounded-lg px-2 py-1.5">
            <button onClick={onClose} className="p-0.5">
              <ChevronLeft className="w-4 h-4 text-white" />
            </button>
            <div className="w-px h-4 bg-white/30" />
            <button className="p-0.5">
              <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 3l14 9-14 9V3z" />
              </svg>
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {/* Note area with block editor */}
          <div className="px-6 pb-4">
            <div
              className="rounded-2xl p-5 min-h-[220px] flex flex-col gap-2 shadow-sm"
              style={{
                backgroundColor: `hsl(${NOTE_COLORS[selectedColor].hsl})`,
              }}
            >
              <input
                type="text"
                placeholder="Add text to this note"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="bg-transparent text-card-foreground/70 font-medium text-sm placeholder:text-card-foreground/40 outline-none w-full"
              />
              <BlockEditor
                blocks={blocks}
                onChange={setBlocks}
                accentColor={NOTE_COLORS[selectedColor].hsl}
              />
            </div>
          </div>

          {/* Note color */}
          <div className="px-6 pb-4">
            <p className="text-xs text-muted-foreground mb-2">Note color</p>
            <div className="flex gap-3">
              {NOTE_COLORS.map((c, i) => (
                <button
                  key={c.name}
                  onClick={() => setSelectedColor(i)}
                  className="w-7 h-7 rounded-full transition-all flex items-center justify-center"
                  style={{
                    backgroundColor: `hsl(${c.hsl})`,
                    boxShadow:
                      i === selectedColor
                        ? `0 0 0 2px hsl(var(--background)), 0 0 0 4px hsl(${c.hsl})`
                        : "none",
                  }}
                />
              ))}
            </div>
          </div>

          {/* Category */}
          <div className="px-6 pb-4">
            <p className="text-xs text-muted-foreground mb-2">Category</p>
            <div className="flex gap-2 flex-wrap items-center">
              <button className="w-7 h-7 rounded-full bg-muted flex items-center justify-center">
                <Settings className="w-3.5 h-3.5 text-muted-foreground" />
              </button>
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

          {/* Collaboration */}
          <div className="px-6 pb-4">
            <p className="text-xs text-muted-foreground mb-2">Collaboration</p>
            <div className="flex gap-2 flex-wrap">
              {COLLABORATORS.map((person) => (
                <div
                  key={person.name}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted border border-border"
                >
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: person.color }}
                  />
                  <span className="text-xs font-medium text-foreground">{person.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom actions */}
        <div className="px-6 pb-5 pt-2 flex items-center justify-between gap-2 border-t border-border">
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
