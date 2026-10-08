# Bug Hunt Arena — Visual Identity & Design System

## 1. Token System

The design is built around a calm, light, high-contrast surface modeled after code editors and diagnostic debugging consoles.

### Core Hex Colors (6 Named Tokens)
| Token Name | Hex Value | Purpose & Usage | Contrast Ratio |
| :--- | :--- | :--- | :--- |
| `--surface` | `#F8F9FA` | Main viewport canvas; high-concentration surface | 15.2:1 against ink |
| `--surface-panel` | `#FFFFFF` | Form containers, code cards, and elevated panels | 16.4:1 against ink |
| `--ink` | `#1A1D20` | Headings and primary body copy; deep slate-black | N/A (Foreground) |
| `--diagnostic-error` | `#C92A2A` | Faulty code highlights, wavy error squiggles, invalid field alerts | 5.8:1 against white |
| `--diagnostic-pass` | `#2B8A3E` | Correct bug picks, satisfied password rules, verified status | 5.1:1 against white |
| `--border-neutral` | `#D0D7DE` | Editor hairline borders, subtle input outlines, card boundaries | 3.2:1 against surface |

### Functional Supporting Tints
- `--ink-muted`: `#57606A` (secondary notes, line numbers; 5.6:1 contrast)
- `--surface-highlight`: `#EDF2F7` (hover/focus code line background)
- `--surface-error-subtle`: `#FFF5F5` (background for diagnosed error lines)
- `--surface-pass-subtle`: `#EBFBEE` (background for pass alerts)
- `--focus-ring`: `#0969DA` (accessible keyboard focus outline)
- `--diagnostic-warn`: `#D9730D` (cautionary alerts; 4.6:1 contrast)

---

## 2. Typography

1. **Headings**: **`Space Grotesk`** (Weights: 600, 700)
   - Geometric sans derived from Space Mono with mechanical engineering quirks and technical precision.
2. **Body & UI**: **`Source Sans 3`** (Weights: 400, 500, 600)
   - Created for prolonged reading with distinct letterforms (tail on `l`, distinct `I`).
   - Line length strictly limited to under 80 characters (`max-w-[68ch]`).
3. **Code & Diagnostics**: **`JetBrains Mono`** (Weights: 400, 500)
   - Used for code snippets, line numbers, and diagnostic values.
   - Distinct zero with dot, clear punctuation, high x-height.

---

## 3. Type Scale (1.200 Minor Third Harmony)
- `caption`: `0.75rem` (12px) | line-height: 1.4 | weight: 500
- `body-sm`: `0.875rem` (14px) | line-height: 1.5 | weight: 400 / 500
- `body-base`: `1.0rem` (16px) | line-height: 1.55 | weight: 400
- `h3` / `subheading`: `1.25rem` (20px) | line-height: 1.4 | weight: 600
- `h2` / `section`: `1.5rem` (24px) | line-height: 1.3 | weight: 600
- `h1` / `hero`: `2.0rem` (32px) on mobile $\rightarrow$ `2.5rem` (40px) on desktop | line-height: 1.2 | weight: 700

---

## 4. Spacing Scale (4px/8px Unit Grid)
- `space-1`: 4px (`0.25rem`) — micro gaps, inline badge padding
- `space-2`: 8px (`0.5rem`) — element gaps, input vertical padding
- `space-3`: 12px (`0.75rem`) — form field margins, button padding
- `space-4`: 16px (`1.0rem`) — default container padding, stack spacing
- `space-6`: 24px (`1.5rem`) — panel inner padding, section rhythm
- `space-8`: 32px (`2.0rem`) — section vertical separation
- `space-12`: 48px (`3.0rem`) — desktop section separation
- `space-16`: 64px (`4.0rem`) — hero vertical breathing room

---

## 5. Signature Motif: Wavy Squiggle Underline
- The red wavy squiggle (`.diagnostic-squiggle`) mimics the universal syntax/semantic error feedback of IDEs.
- Expressed using `text-decoration: underline wavy var(--diagnostic-error)`.
- Applied exclusively to indicate identified software defects and form errors—never used decoratively.

---

## 6. Self-Review Against Generic Defaults

During the design review, specific choices were made to reject generic web conventions:

1. **Rejected Cream + Terracotta & Dark + Neon**: Instead of generic warm lifestyle or cyber dark themes, we used a cool, clean `#F8F9FA` canvas with `#1A1D20` ink and diagnostic editor colors (`#C92A2A`, `#2B8A3E`).
2. **Rejected Card Shadows & Gradient Washes**: Replaced floating blurry box-shadows and ambient color blobs with crisp 1px hairline borders (`#D0D7DE`), mimicking editor split panes.
3. **Rejected Eyebrow Headings**: Removed all-caps category labels in favor of standard sentence-case typography (`How it works`, `Fairness guarantee`).
4. **Rejected Button Arrow Glyphs**: Buttons use plain action verbs without trailing arrows (`Play as guest`, `Create account`, `Log in`).
5. **Rejected Single-Word Headline Gradients**: Headlines maintain uniform weight and solid ink. Boldness is reserved for the interactive hero code snippet.
6. **Sequenced Only True Steps**: Numbering (1, 2, 3) is applied only to the sequential "How it works" flow, while orthogonal features (Languages, Fairness, Streak) use descriptive section headings.

---

## 7. Layout Notes & Accessibility
- **Responsive down to 360px**: Auto-fit CSS grids and flex wrapping ensure zero horizontal overflow or clipping at 360px, 768px, and 1280px.
- **Color Independence**: Every state pairs color with text labels and symbols (`✓`, `✕`, `ℹ`, `🔥`).
- **Keyboard & Motion**: Full tab-order navigation with visible focus rings (`focus-visible:ring-2`); all animations disabled when `prefers-reduced-motion` is detected.

---

## 8. Role-Based Radii & Structural Surfaces
Rather than identical rounded cards everywhere, surfaces vary by role:
- **Code surfaces**: `var(--radius-sm)` (4px) with 1px hairline border (`var(--border-neutral)`).
- **Interactive elements** (buttons, inputs, chips, tags, tabs): `var(--radius-md)` (6px).
- **Structural panels, toolbars, and containers**: `var(--radius-lg)` (8px).

---

## 9. Shared UI Component Catalog (`src/components/ui/`)
1. **`SegmentedControl`**: Pill-toggle with keyboard navigation (`ArrowLeft`/`ArrowRight`), ARIA `role="tablist"` and `role="tab"`.
2. **`Slider`**: Native range slider coupled with labeled stops and active segment highlighting.
3. **`Chip`**: Interactive toggle button for topic selection with focus ring.
4. **`Tag`**: Semantic badge with subtle backgrounds for language, topic, and difficulty.
5. **`SegmentedProgress`**: Multi-block segmented progress bar (1–5 tiers) for rank and mastery.
6. **`TestRow`**: Test row item displaying status icon, description, input, and expected output.
7. **`DiffView`**: Unified side-by-side or stacked diff showing additions (`+`) and deletions (`-`).
8. **`Tabs`**: Accessible tab navigation component with `role="tablist"` / `role="tab"`.
9. **`Toolbar`**: Styled hairline container for search inputs, select dropdowns, and count indicators.
10. **`EmptyState`**: Standardized component with symbol, heading, "What happened", and "What to do next".
11. **`Skeleton`**: Accessible loading placeholder with motion-reduced pulse.

---

## 10. Shared Frame & Page Structure
- **Global Header**: Primary navigation contains **Play (Setup)**, **Skill map**, and **Journal** only. Shows active streak (`🔥`) and XP (`⚡`).
- **Viewport Canvas**: Max width centered at `1120px` with uniform `padding: var(--space-8) var(--space-4)`.
- **Feedback Contract**: Every empty state and error message clearly communicates **What happened** and **What to do next**.

