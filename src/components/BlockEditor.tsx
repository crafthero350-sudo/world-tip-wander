import { useState, useRef, useCallback } from "react";
import {
  Type,
  Heading1,
  Heading2,
  List,
  Quote,
  Smile,
  Plus,
} from "lucide-react";
import data from "@emoji-mart/data";
import Picker from "@emoji-mart/react";

export type BlockType = "text" | "h1" | "h2" | "bullet" | "quote";

export interface Block {
  id: string;
  type: BlockType;
  content: string;
}

const BLOCK_MENU: { type: BlockType; icon: React.ReactNode; label: string }[] = [
  { type: "text", icon: <Type className="w-4 h-4" />, label: "Text" },
  { type: "h1", icon: <Heading1 className="w-4 h-4" />, label: "Heading 1" },
  { type: "h2", icon: <Heading2 className="w-4 h-4" />, label: "Heading 2" },
  { type: "bullet", icon: <List className="w-4 h-4" />, label: "Bullet List" },
  { type: "quote", icon: <Quote className="w-4 h-4" />, label: "Quote" },
];

interface BlockEditorProps {
  blocks: Block[];
  onChange: (blocks: Block[]) => void;
  accentColor?: string;
}

const BlockEditor = ({ blocks, onChange, accentColor }: BlockEditorProps) => {
  const [showBlockMenu, setShowBlockMenu] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [activeBlockIdx, setActiveBlockIdx] = useState(0);
  const textareaRefs = useRef<Map<string, HTMLTextAreaElement>>(new Map());

  const updateBlock = useCallback(
    (id: string, updates: Partial<Block>) => {
      onChange(blocks.map((b) => (b.id === id ? { ...b, ...updates } : b)));
    },
    [blocks, onChange]
  );

  const addBlock = useCallback(
    (type: BlockType) => {
      const newBlock: Block = { id: String(Date.now()), type, content: "" };
      onChange([...blocks, newBlock]);
      setShowBlockMenu(false);
      setTimeout(() => {
        const el = textareaRefs.current.get(newBlock.id);
        if (el) el.focus();
      }, 50);
    },
    [blocks, onChange]
  );

  const removeBlock = useCallback(
    (id: string) => {
      if (blocks.length <= 1) return;
      onChange(blocks.filter((b) => b.id !== id));
    },
    [blocks, onChange]
  );

  const handleKeyDown = (e: React.KeyboardEvent, block: Block) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      addBlock(block.type === "bullet" ? "bullet" : "text");
    }
    if (e.key === "Backspace" && block.content === "") {
      e.preventDefault();
      removeBlock(block.id);
    }
  };

  const insertEmoji = (emoji: any) => {
    const targetBlock = blocks[activeBlockIdx] || blocks[blocks.length - 1];
    if (targetBlock) {
      updateBlock(targetBlock.id, { content: targetBlock.content + emoji.native });
    }
    setShowEmojiPicker(false);
  };

  const getBlockStyles = (type: BlockType): string => {
    switch (type) {
      case "h1":
        return "text-xl font-bold";
      case "h2":
        return "text-lg font-semibold";
      case "bullet":
        return "text-sm";
      case "quote":
        return "text-sm italic border-l-2 border-card-foreground/30 pl-3";
      default:
        return "text-sm";
    }
  };

  const getPlaceholder = (type: BlockType): string => {
    switch (type) {
      case "h1": return "Heading";
      case "h2": return "Subheading";
      case "quote": return "Write a quote...";
      default: return "Type something...";
    }
  };

  const autoResize = (el: HTMLTextAreaElement) => {
    el.style.height = "auto";
    el.style.height = el.scrollHeight + "px";
  };

  return (
    <div className="flex flex-col gap-1 min-h-[100px]">
      {blocks.map((block, idx) => (
        <div key={block.id} className="group flex items-start gap-1">
          {block.type === "bullet" && (
            <span className="text-card-foreground/60 mt-1 text-sm">•</span>
          )}
          <textarea
            ref={(el) => {
              if (el) {
                textareaRefs.current.set(block.id, el);
                // Auto-resize on mount
                el.style.height = "auto";
                el.style.height = el.scrollHeight + "px";
              }
            }}
            value={block.content}
            placeholder={getPlaceholder(block.type)}
            onChange={(e) => {
              updateBlock(block.id, { content: e.target.value });
              autoResize(e.target);
            }}
            onFocus={() => setActiveBlockIdx(idx)}
            onKeyDown={(e) => handleKeyDown(e, block)}
            rows={1}
            className={`flex-1 bg-transparent outline-none text-card-foreground placeholder:text-card-foreground/30 resize-none overflow-hidden ${getBlockStyles(block.type)}`}
          />
        </div>
      ))}

      {/* Toolbar */}
      <div className="flex items-center gap-1 mt-2 pt-2 border-t border-card-foreground/10">
        <div className="relative">
          <button
            type="button"
            onClick={() => {
              setShowBlockMenu(!showBlockMenu);
              setShowEmojiPicker(false);
            }}
            className="p-1.5 rounded-lg bg-card-foreground/5 hover:bg-card-foreground/10 transition-colors"
          >
            <Plus className="w-3.5 h-3.5 text-card-foreground/60" />
          </button>

          {showBlockMenu && (
            <div className="absolute bottom-full left-0 mb-1 bg-background rounded-xl shadow-xl border border-border p-1 min-w-[140px] z-10 animate-scale-in">
              {BLOCK_MENU.map((item) => (
                <button
                  key={item.type}
                  type="button"
                  onClick={() => addBlock(item.type)}
                  className="flex items-center gap-2 w-full px-3 py-2 text-xs text-foreground hover:bg-muted rounded-lg transition-colors"
                >
                  {item.icon}
                  {item.label}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="relative">
          <button
            type="button"
            onClick={() => {
              setShowEmojiPicker(!showEmojiPicker);
              setShowBlockMenu(false);
            }}
            className="p-1.5 rounded-lg bg-card-foreground/5 hover:bg-card-foreground/10 transition-colors"
          >
            <Smile className="w-3.5 h-3.5 text-card-foreground/60" />
          </button>

          {showEmojiPicker && (
            <div className="absolute bottom-full left-0 mb-1 z-20 animate-scale-in">
              <Picker
                data={data}
                onEmojiSelect={insertEmoji}
                theme="light"
                previewPosition="none"
                skinTonePosition="none"
                perLine={7}
                maxFrequentRows={1}
              />
            </div>
          )}
        </div>

        {BLOCK_MENU.slice(0, 4).map((item) => (
          <button
            key={item.type}
            type="button"
            onClick={() => {
              const targetBlock = blocks[activeBlockIdx];
              if (targetBlock) {
                updateBlock(targetBlock.id, { type: item.type });
              }
            }}
            className="p-1.5 rounded-lg bg-card-foreground/5 hover:bg-card-foreground/10 transition-colors"
            title={item.label}
          >
            {item.icon}
          </button>
        ))}
      </div>
    </div>
  );
};

export default BlockEditor;
