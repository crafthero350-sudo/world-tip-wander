import { useState } from "react";
import { ChevronLeft, Link2, Share2, PenLine, Check, Settings } from "lucide-react";
import BlockEditor, { type Block } from "./BlockEditor";

const NOTE_COLORS = [
  { name: "coral", hsl: "12 80% 75%", var: "card-yellow" },
  { name: "yellow", hsl: "45 90% 82%", var: "card-yellow" },
  { name: "green", hsl: "145 45% 72%", var: "card-mint" },
  { name: "blue", hsl: "220 60% 78%", var: "card-sky" },
  { name: "purple", hsl: "270 50% 78%", var: "card-lavender" },
];

const CATEGORIES = ["Groceries", "Party Supplies", "Household Items"];

const COLLABORATORS = [
  { name: "Ethan Caldwell", color: "hsl(270 50% 78%)", initials: "EC" },
  { name: "Liam Foster", color: "hsl(320 55% 78%)", initials: "LF" },
  { name: "Sophie", color: "hsl(145 45% 72%)", initials: "S" },
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
  const [selectedColor, setSelectedColor] = useState(1);
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
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/20 backdrop-blur-[2px]"
      onClick={onClose}
    >
      <div
        className="w-full max-w-[390px] rounded-t-[32px] sm:rounded-[32px] bg-[hsl(0_0%_96%)] shadow-[0_-4px_40px_rgba(0,0,0,0.08)] overflow-hidden animate-scale-in max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-3">
          <div className="flex items-center gap-[3px] bg-[hsl(152_35%_55%)] rounded-[10px] px-[6px] py-[6px]">
            <button onClick={onClose} className="p-[2px]">
              <ChevronLeft className="w-[15px] h-[15px] text-white" strokeWidth={2.5} />
            </button>
            <div className="w-[1px] h-[14px] bg-white/30 mx-[1px]" />
            <button className="p-[2px]">
              <svg className="w-[15px] h-[15px] text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
                <line x1="4" y1="22" x2="4" y2="15" />
              </svg>
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-5">
          {/* Note card */}
          <div className="relative mb-5">
            <div
              className="rounded-[20px] p-6 min-h-[200px] flex flex-col gap-2"
              style={{
                backgroundColor: `hsl(${NOTE_COLORS[selectedColor].hsl})`,
                boxShadow: "2px 3px 8px rgba(0,0,0,0.06)",
              }}
            >
              <div className="flex items-start gap-2">
                <svg className="w-[14px] h-[14px] mt-[2px] text-[hsl(0_0%_40%)] opacity-40 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                </svg>
                <input
                  type="text"
                  placeholder="Add text to this note"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="bg-transparent text-[hsl(0_0%_35%)] font-normal text-[13px] placeholder:text-[hsl(0_0%_35%)]/50 outline-none w-full"
                />
              </div>
              <BlockEditor
                blocks={blocks}
                onChange={setBlocks}
                accentColor={NOTE_COLORS[selectedColor].hsl}
              />
            </div>
            {/* Folded corner */}
            <div
              className="absolute bottom-0 right-0 w-[22px] h-[22px] rounded-tl-[6px]"
              style={{
                background: "linear-gradient(135deg, transparent 50%, hsl(0 0% 96%) 50%)",
              }}
            />
          </div>

          {/* Note color */}
          <div className="mb-5">
            <p className="text-[11px] text-[hsl(0_0%_55%)] mb-[10px] font-medium">Note color</p>
            <div className="flex gap-[14px]">
              {NOTE_COLORS.map((c, i) => (
                <button
                  key={c.name}
                  onClick={() => setSelectedColor(i)}
                  className="w-[28px] h-[28px] rounded-full transition-all"
                  style={{
                    backgroundColor: `hsl(${c.hsl})`,
                    boxShadow:
                      i === selectedColor
                        ? `0 0 0 2px hsl(0 0% 96%), 0 0 0 3.5px hsl(${c.hsl})`
                        : "none",
                  }}
                />
              ))}
            </div>
          </div>

          {/* Category */}
          <div className="mb-5">
            <p className="text-[11px] text-[hsl(0_0%_55%)] mb-[10px] font-medium">Category</p>
            <div className="flex gap-[8px] flex-wrap items-center">
              <button className="w-[30px] h-[30px] rounded-full bg-[hsl(0_0%_90%)] flex items-center justify-center">
                <Settings className="w-[13px] h-[13px] text-[hsl(0_0%_50%)]" />
              </button>
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-[14px] py-[7px] rounded-full text-[11px] font-medium transition-colors ${
                    selectedCategory === cat
                      ? "bg-[hsl(0_0%_25%)] text-white"
                      : "bg-[hsl(0_0%_90%)] text-[hsl(0_0%_40%)]"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Collaboration */}
          <div className="mb-4">
            <p className="text-[11px] text-[hsl(0_0%_55%)] mb-[10px] font-medium">Collaboration</p>
            <div className="flex gap-[8px] flex-wrap">
              {COLLABORATORS.map((person) => (
                <div
                  key={person.name}
                  className="flex items-center gap-[6px] px-[10px] py-[6px] rounded-full bg-[hsl(0_0%_90%)]"
                >
                  <div
                    className="w-[18px] h-[18px] rounded-full flex items-center justify-center text-[7px] font-semibold text-white"
                    style={{ backgroundColor: person.color }}
                  >
                    {person.initials}
                  </div>
                  <span className="text-[11px] font-medium text-[hsl(0_0%_30%)]">{person.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom actions */}
        <div className="px-5 pb-6 pt-3 flex items-center gap-[8px]">
          <button className="flex flex-col items-center gap-[4px] px-3 py-[10px] rounded-[14px] bg-[hsl(0_0%_90%)] flex-1">
            <Link2 className="w-[16px] h-[16px] text-[hsl(0_0%_45%)]" />
            <span className="text-[9px] text-[hsl(0_0%_45%)] font-medium">Copy link</span>
          </button>
          <button className="flex flex-col items-center gap-[4px] px-3 py-[10px] rounded-[14px] bg-[hsl(0_0%_90%)] flex-1">
            <Share2 className="w-[16px] h-[16px] text-[hsl(0_0%_45%)]" />
            <span className="text-[9px] text-[hsl(0_0%_45%)] font-medium">Share</span>
          </button>
          <button className="flex flex-col items-center gap-[4px] px-3 py-[10px] rounded-[14px] bg-[hsl(0_0%_90%)] flex-1">
            <PenLine className="w-[16px] h-[16px] text-[hsl(0_0%_45%)]" />
            <span className="text-[9px] text-[hsl(0_0%_45%)] font-medium">Draw</span>
          </button>
          <button
            onClick={handleSave}
            className="flex flex-col items-center gap-[4px] px-3 py-[10px] rounded-[14px] bg-[hsl(0_0%_20%)] flex-1"
          >
            <Check className="w-[16px] h-[16px] text-white" />
            <span className="text-[9px] text-white font-semibold">Save</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddCardModal;
