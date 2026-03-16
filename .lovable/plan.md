

## Problem Analysis

The card reading popup uses `position: fixed` to center itself on screen, but it is rendered **inside the world container** which has a CSS `transform`. In CSS, a `transform` on a parent element creates a new containing block — this means `position: fixed` no longer positions relative to the viewport, but relative to the transformed parent. That is why the popup appears offset/misplaced when you have scrolled away from the origin.

## Solution

Use a **React Portal** to render the card's reading overlay outside the transformed world container, directly into `document.body`. This ensures `position: fixed` works correctly relative to the viewport regardless of the world's transform offset.

## Changes

### 1. `src/components/InsightCard.tsx`
- Import `createPortal` from `react-dom`
- Wrap the open-card overlay (the `fixed inset-0` div returned when `isOpen` is true) in `createPortal(..., document.body)`
- This is a small, surgical change — only the return statement for the open state needs wrapping

### 2. No other files need changes
The root cause is entirely in InsightCard's rendering of the modal inside a transformed parent.

## Technical Detail

```text
Current structure (broken):
  <div style="transform: translate(...)">   ← world container
    <div class="fixed inset-0">             ← card modal (fixed broken by parent transform)

Fixed structure:
  <div style="transform: translate(...)">   ← world container
    ...cards (closed state only)
  
  <!-- via portal, rendered at document.body -->
  <div class="fixed inset-0">               ← card modal (fixed works correctly)
```

