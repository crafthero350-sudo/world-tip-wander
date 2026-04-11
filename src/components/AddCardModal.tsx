import { useState } from "react";
import { ChevronLeft, Link2, Share2, PenLine, Check, Settings } from "lucide-react";
import BlockEditor, { type Block } from "./BlockEditor";

const NOTE_COLORS = [
  { name: "coral", hsl: "12 76% 72%", var: "card-yellow" },
  { name: "yellow", hsl: "45 88% 80%", var: "card-yellow" },
  { name: "green", hsl: "145 42% 72%", var: "card-mint" },
  { name: "blue", hsl: "210 60% 78%", var: "card-sky" },
  { name: "purple", hsl: "275 45% 78%", var: "card-lavender" },
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
  const [selectedColor, setSelectedColor] = useState(0);
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
    setSelectedColor(0);
    setSelectedCategory(null);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
      style={{ backgroundColor: "rgba(0,0,0,0.15)" }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-[390px] rounded-t-[28px] sm:rounded-[28px] overflow-hidden animate-scale-in max-h-[92vh] flex flex-col"
        style={{ backgroundColor: "hsl(30 10% 94%)" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-2">
          <div
            className="flex items-center gap-[2px] rounded-[9px] px-[5px] py-[5px]"
            style={{ backgroundColor: "hsl(145 40% 42%)" }}
          >
            <button onClick={onClose} className="p-[3px]">
              <ChevronLeft className="w-[14px] h-[14px] text-white" strokeWidth={2.8} />
            </button>
            <div className="w-[1px] h-[13px] bg-white/30 mx-[1px]" />
            <button className="p-[3px]">
              <svg className="w-[14px] h-[14px] text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
                <line x1="4" y1="22" x2="4" y2="15" />
              </svg>
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-5">
          {/* Note card with slight tilt */}
          <div className="relative mb-5 flex justify-center">
            <div
              className="relative w-full max-w-[280px]"
              style={{ transform: "rotate(-1.5deg)" }}
            >
              <div
                className="rounded-[18px] p-5 min-h-[190px] flex flex-col gap-2"
                style={{
                  backgroundColor: `hsl(${NOTE_COLORS[selectedColor].hsl})`,
                  boxShadow: "0 2px 12px rgba(0,0,0,0.06), 0 1px 3px rgba(0,0,0,0.04)",
                }}
              >
                <div className="flex items-start gap-2">
                  <svg className="w-[13px] h-[13px] mt-[1px] flex-shrink-0" style={{ color: "hsl(0 0% 45%)", opacity: 0.4 }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                  </svg>
                  <input
                    type="text"
                    placeholder="Add text to this note"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="bg-transparent font-normal text-[12.5px] outline-none w-full"
                    style={{
                      color: "hsl(0 0% 38%)",
                    }}
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
                className="absolute bottom-0 right-0 w-[20px] h-[20px] rounded-tl-[5px]"
                style={{
                  background: "linear-gradient(135deg, transparent 50%, hsl(30 10% 94%) 50%)",
                }}
              />
            </div>
          </div>

          {/* Note color */}
          <div className="mb-4">
            <p className="text-[11px] font-medium mb-[8px]" style={{ color: "hsl(0 0% 58%)" }}>Note color</p>
            <div className="flex gap-[12px]">
              {NOTE_COLORS.map((c, i) => (
                <button
                  key={c.name}
                  onClick={() => setSelectedColor(i)}
                  className="w-[26px] h-[26px] rounded-full transition-all"
                  style={{
                    backgroundColor: `hsl(${c.hsl})`,
                    boxShadow:
                      i === selectedColor
                        ? `0 0 0 2px hsl(30 10% 94%), 0 0 0 3px hsl(${c.hsl})`
                        : "none",
                  }}
                />
              ))}
            </div>
          </div>

          {/* Category */}
          <div className="mb-4">
            <p className="text-[11px] font-medium mb-[8px]" style={{ color: "hsl(0 0% 58%)" }}>Category</p>
            <div className="flex gap-[7px] flex-wrap items-center">
              <button
                className="w-[28px] h-[28px] rounded-full flex items-center justify-center"
                style={{ backgroundColor: "hsl(0 0% 90%)" }}
              >
                <Settings className="w-[12px] h-[12px]" style={{ color: "hsl(0 0% 52%)" }} />
              </button>
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className="rounded-full text-[11px] font-medium transition-colors"
                  style={{
                    padding: "6px 13px",
                    backgroundColor: selectedCategory === cat ? "hsl(0 0% 25%)" : "hsl(0 0% 90%)",
                    color: selectedCategory === cat ? "white" : "hsl(0 0% 42%)",
                  }}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Collaboration */}
          <div className="mb-3">
            <p className="text-[11px] font-medium mb-[8px]" style={{ color: "hsl(0 0% 58%)" }}>Collaboration</p>
            <div className="flex gap-[6px] flex-wrap">
              {COLLABORATORS.map((person) => (
                <div
                  key={person.name}
                  className="flex items-center gap-[5px] rounded-full"
                  style={{
                    padding: "5px 10px",
                    backgroundColor: "hsl(0 0% 90%)",
                  }}
                >
                  <div
                    className="w-[17px] h-[17px] rounded-full flex items-center justify-center text-[7px] font-semibold text-white"
                    style={{ backgroundColor: person.color }}
                  >
                    {person.initials}
                  </div>
                  <span className="text-[10.5px] font-medium" style={{ color: "hsl(0 0% 32%)" }}>{person.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom actions */}
        <div className="px-5 pb-6 pt-2 flex items-center gap-[7px]">
          <button
            className="flex flex-col items-center gap-[3px] rounded-[13px] flex-1"
            style={{ padding: "9px 0", backgroundColor: "hsl(0 0% 90%)" }}
          >
            <Link2 className="w-[15px] h-[15px]" style={{ color: "hsl(0 0% 48%)" }} />
            <span className="text-[9px] font-medium" style={{ color: "hsl(0 0% 48%)" }}>Copy link</span>
          </button>
          <button
            className="flex flex-col items-center gap-[3px] rounded-[13px] flex-1"
            style={{ padding: "9px 0", backgroundColor: "hsl(0 0% 90%)" }}
          >
            <Share2 className="w-[15px] h-[15px]" style={{ color: "hsl(0 0% 48%)" }} />
            <span className="text-[9px] font-medium" style={{ color: "hsl(0 0% 48%)" }}>Share</span>
          </button>
          <button
            className="flex flex-col items-center gap-[3px] rounded-[13px] flex-1"
            style={{ padding: "9px 0", backgroundColor: "hsl(0 0% 90%)" }}
          >
            <PenLine className="w-[15px] h-[15px]" style={{ color: "hsl(0 0% 48%)" }} />
            <span className="text-[9px] font-medium" style={{ color: "hsl(0 0% 48%)" }}>Draw</span>
          </button>
          <button
            onClick={handleSave}
            className="flex flex-col items-center gap-[3px] rounded-[13px] flex-1"
            style={{ padding: "9px 0", backgroundColor: "hsl(0 0% 22%)" }}
          >
            <Check className="w-[15px] h-[15px] text-white" />
            <span className="text-[9px] font-semibold text-white">Save</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddCardModal;
