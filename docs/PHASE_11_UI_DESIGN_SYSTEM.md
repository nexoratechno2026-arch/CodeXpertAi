# Phase 11 — UI Design System & Engineering Tokens

## 1. Design Direction & Theme Standards
Nexora CodeLab + Nexora InterviewAI maintains a deliberate, developer-first dark mode visual design system. The user interface prioritizes clarity, readable monospace code typography, high contrast, and accessible touch targets over flashy generic AI landing-page templates.

### Core Color Palette
| Token | Hex Value | Semantic Purpose |
| :--- | :--- | :--- |
| `--color-bg-primary` | `#090909` | Deep application canvas background |
| `--color-bg-secondary` | `#111111` | Primary cards, panels, and navbars |
| `--color-bg-tertiary` | `#171717` | Input surfaces, toolbars, and inactive tabs |
| `--color-border-default` | `#292929` | Structural dividers, card borders, tab borders |
| `--color-border-strong` | `#3f3f46` | Hovered borders, active inputs, modal edges |
| `--color-text-primary` | `#F5F5F5` | High-contrast body text, headings, editor code |
| `--color-text-secondary` | `#A1A1AA` | Subtitles, helper text, explanations, metadata |
| `--color-accent` | `#3B82F6` | Primary CTAs, active focus states, verified badges |
| `--color-success` | `#22C55E` | Accepted test cases, passed verdicts |
| `--color-error` | `#EF4444` | Wrong answer verdicts, compile errors, auth failures |

---

## 2. Typography
- **Primary Interface Font:** Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif
- **Code & Numeric Font:** 'JetBrains Mono', Consolas, 'Fira Code', Menlo, monospace
- **Line Heights:**
  - Tight (1.2) for titles and compact headings
  - Relaxed (1.5 - 1.6) for problem statements and explanatory feedback

---

## 3. Responsive Touch & Ergonomic Guidelines
1. **Minimum Touch Targets:** Primary interactive elements (buttons, mobile switcher tabs, hamburger toggles) conform to minimum `40px` to `44px` touch bounding boxes.
2. **Keyboard Focus States:** All buttons, inputs, links, and selectable cards provide visible focus rings (`:focus-visible` with `#3b82f6`).
3. **Reduced Motion:** Interactive state transitions use `--transition-fast` (150ms) and respect `@media (prefers-reduced-motion: reduce)`.
4. **Horizontal Containment:** Explicit rules prevent fixed-width containers from breaking viewport boundaries at 320px CSS pixels.
