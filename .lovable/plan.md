

## Plan: Replace swipe-to-delete with iOS-style long-press context menu

### What to do

Remove the swipe-to-delete mechanism (red background + Trash2 icon) from `SwipeableCard` in `MyCollection.tsx` and replace it with a **long-press context menu** similar to iOS (as shown in the reference image).

### Changes

#### 1. `src/components/MyCollection.tsx`

- **Remove** all swipe logic from `SwipeableCard` (offsetX state, touch handlers, red delete background)
- **Add** long-press detection using `onContextMenu` (right-click / long-press on mobile) or a timer-based approach with `onPointerDown`/`onPointerUp`
- **Add** a context menu overlay (portal to `document.body`) that appears on long-press with a blurred backdrop, showing:
  - Card preview (scaled down, rounded) on the left
  - Menu options on the right in a rounded white card:
    - **Delete** (red text, trash icon) — calls `onDelete`
    - **Share** (share icon)
    - **Love** (heart icon) — toggles save
  - Tapping backdrop dismisses the menu
- Style the menu to match iOS: white rounded-2xl background, separator lines between items, icons on the right side, clean typography

#### 2. No other files need changes

### Technical approach

- Use `onContextMenu` for native long-press on mobile + right-click on desktop
- Render the menu via `createPortal` to `document.body` (same pattern as InsightCard's modal)
- Position menu items in a fixed overlay centered on screen with backdrop blur
- Add `playDeleteSound()` on delete action

