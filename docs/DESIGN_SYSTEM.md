# Nexora CodeLab & InterviewAI — Design System

> **Status:** Phase 1 — Architecture & Planning  
> **Last Updated:** 2026-10-16

---

## 1. Design Philosophy

This design system serves a **developer-facing product** built by Nexora Techno. Every visual decision prioritizes:

- **Technical credibility** — Clean, structured layouts that developers trust
- **Deliberate restraint** — No gratuitous gradients, glows, glassmorphism, floating blobs, or decorative animations
- **Information density** — Efficient use of space for code, data, and feedback
- **Accessibility** — WCAG 2.1 AA compliance for text contrast and interactive elements
- **Consistency** — Every component draws from the same token set

### What This Design System Avoids

- ❌ Generic AI-generated landing page layouts
- ❌ Excessive gradients or glowing effects
- ❌ Glassmorphism or frosted-glass overlays
- ❌ Floating blob animations or particle effects
- ❌ Decorative fake code windows or terminal aesthetics for visual flair
- ❌ Overly rounded, soft, or "friendly" UI patterns that undermine technical credibility

---

## 2. Color System

### 2.1 Core Palette

All colors are specified as CSS custom properties. The palette is dark-first with a single restrained blue accent.

```css
:root {
  /* ── Backgrounds ── */
  --color-bg-primary:      #090909;   /* Main application background */
  --color-bg-secondary:    #111111;   /* Cards, panels, elevated surfaces */
  --color-bg-tertiary:     #171717;   /* Nested surfaces, code blocks, inputs */
  --color-bg-hover:        #1C1C1C;   /* Hover state for interactive surfaces */
  --color-bg-active:       #212121;   /* Active/pressed state */
  
  /* ── Borders ── */
  --color-border-default:  #292929;   /* Standard borders */
  --color-border-subtle:   #1F1F1F;   /* De-emphasized borders */
  --color-border-strong:   #3A3A3A;   /* Emphasized borders, focus rings */
  
  /* ── Text ── */
  --color-text-primary:    #F5F5F5;   /* Primary content text */
  --color-text-secondary:  #A1A1AA;   /* Secondary text, labels, captions */
  --color-text-tertiary:   #71717A;   /* Disabled text, placeholders */
  --color-text-inverse:    #090909;   /* Text on light/accent backgrounds */
  
  /* ── Accent (Blue) ── */
  --color-accent:          #3B82F6;   /* Primary actions, links, focus states */
  --color-accent-hover:    #2563EB;   /* Accent hover */
  --color-accent-active:   #1D4ED8;   /* Accent pressed */
  --color-accent-subtle:   rgba(59, 130, 246, 0.10);  /* Accent background tint */
  --color-accent-border:   rgba(59, 130, 246, 0.30);  /* Accent border tint */
  
  /* ── Semantic Colors ── */
  --color-success:         #22C55E;   /* Accepted, passed, correct */
  --color-success-subtle:  rgba(34, 197, 94, 0.10);
  --color-error:           #EF4444;   /* Failed, error, rejected */
  --color-error-subtle:    rgba(239, 68, 68, 0.10);
  --color-warning:         #F59E0B;   /* Warnings, time limits */
  --color-warning-subtle:  rgba(245, 158, 11, 0.10);
  --color-info:            #3B82F6;   /* Informational (same as accent) */
  --color-info-subtle:     rgba(59, 130, 246, 0.10);
}
```

### 2.2 Color Usage Rules

| Use Case | Token | Example |
|---|---|---|
| Page background | `--color-bg-primary` | `<body>`, `<main>` |
| Card / panel | `--color-bg-secondary` | Problem cards, sidebar panels |
| Input field background | `--color-bg-tertiary` | Text inputs, dropdowns, code blocks |
| Standard border | `--color-border-default` | Card borders, dividers |
| Body text | `--color-text-primary` | Paragraphs, headings |
| Labels, captions | `--color-text-secondary` | Form labels, metadata |
| Primary button | `--color-accent` bg + `--color-text-inverse` text | Submit, Start Interview |
| Accepted verdict | `--color-success` | Submission passed |
| Failed verdict | `--color-error` | Submission failed |
| Focus ring | `--color-accent` with 2px outline offset | All focusable elements |

### 2.3 Contrast Ratios

| Combination | Ratio | WCAG Level |
|---|---|---|
| `--color-text-primary` on `--color-bg-primary` (#F5F5F5 on #090909) | 19.2:1 | AAA |
| `--color-text-secondary` on `--color-bg-primary` (#A1A1AA on #090909) | 7.9:1 | AAA |
| `--color-text-tertiary` on `--color-bg-primary` (#71717A on #090909) | 4.8:1 | AA |
| `--color-accent` on `--color-bg-primary` (#3B82F6 on #090909) | 5.5:1 | AA |
| `--color-text-inverse` on `--color-accent` (#090909 on #3B82F6) | 5.5:1 | AA |

---

## 3. Typography

### 3.1 Font Stack

```css
:root {
  /* ── Typography ── */
  --font-sans:   "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  --font-mono:   "JetBrains Mono", "Fira Code", "SF Mono", "Cascadia Code", monospace;
  
  /* Base size */
  --font-size-base: 16px;       /* 1rem */
}
```

**Google Fonts imports:**
```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet">
```

### 3.2 Type Scale

Based on a 1.25 ratio (Major Third) with `1rem = 16px`:

```css
:root {
  --text-xs:     0.75rem;    /* 12px — Badges, fine print */
  --text-sm:     0.875rem;   /* 14px — Captions, secondary text */
  --text-base:   1rem;       /* 16px — Body text */
  --text-lg:     1.125rem;   /* 18px — Emphasized body, card titles */
  --text-xl:     1.25rem;    /* 20px — Section headings */
  --text-2xl:    1.5rem;     /* 24px — Page sub-headings */
  --text-3xl:    1.875rem;   /* 30px — Page headings */
  --text-4xl:    2.25rem;    /* 36px — Hero headings (sparingly) */
  
  /* Line heights */
  --leading-tight:   1.25;
  --leading-normal:  1.5;
  --leading-relaxed: 1.625;
  
  /* Font weights */
  --weight-regular:  400;
  --weight-medium:   500;
  --weight-semibold: 600;
  --weight-bold:     700;
  
  /* Letter spacing */
  --tracking-tight:  -0.025em;
  --tracking-normal: 0;
  --tracking-wide:   0.025em;
}
```

### 3.3 Typography Usage

| Element | Size | Weight | Color | Font |
|---|---|---|---|---|
| Page heading (h1) | `--text-3xl` | `--weight-bold` | `--color-text-primary` | `--font-sans` |
| Section heading (h2) | `--text-2xl` | `--weight-semibold` | `--color-text-primary` | `--font-sans` |
| Card title (h3) | `--text-lg` | `--weight-semibold` | `--color-text-primary` | `--font-sans` |
| Body text | `--text-base` | `--weight-regular` | `--color-text-primary` | `--font-sans` |
| Label | `--text-sm` | `--weight-medium` | `--color-text-secondary` | `--font-sans` |
| Caption | `--text-xs` | `--weight-regular` | `--color-text-secondary` | `--font-sans` |
| Code / editor | `--text-sm` | `--weight-regular` | `--color-text-primary` | `--font-mono` |
| Badge text | `--text-xs` | `--weight-semibold` | varies | `--font-sans` |

---

## 4. Spacing System

An 8px base grid with 4px half-step for fine adjustments:

```css
:root {
  --space-0:   0;
  --space-0.5: 0.125rem;   /* 2px */
  --space-1:   0.25rem;    /* 4px */
  --space-2:   0.5rem;     /* 8px */
  --space-3:   0.75rem;    /* 12px */
  --space-4:   1rem;       /* 16px */
  --space-5:   1.25rem;    /* 20px */
  --space-6:   1.5rem;     /* 24px */
  --space-8:   2rem;       /* 32px */
  --space-10:  2.5rem;     /* 40px */
  --space-12:  3rem;       /* 48px */
  --space-16:  4rem;       /* 64px */
  --space-20:  5rem;       /* 80px */
  --space-24:  6rem;       /* 96px */
}
```

### Usage Guidelines

| Context | Spacing |
|---|---|
| Padding inside cards | `--space-5` (20px) |
| Padding inside inputs | `--space-3` horizontal, `--space-2` vertical |
| Gap between card elements | `--space-3` (12px) |
| Gap between sections | `--space-8` to `--space-12` |
| Page horizontal padding | `--space-6` mobile, `--space-8` desktop |
| Navbar height | `--space-16` (64px) |
| Sidebar width | 260px (fixed) |

---

## 5. Border and Shape

```css
:root {
  /* Border radius */
  --radius-sm:   4px;      /* Small elements: badges, chips */
  --radius-md:   6px;      /* Inputs, buttons, cards */
  --radius-lg:   8px;      /* Modals, larger cards */
  --radius-xl:   12px;     /* Feature cards, panels */
  --radius-full: 9999px;   /* Pills, avatar circles */
  
  /* Border width */
  --border-width: 1px;
}
```

All interactive surfaces use `--radius-md` (6px). Avoid excessive rounding — this is a developer tool, not a consumer app.

---

## 6. Shadows and Elevation

Minimal shadows on a dark background. Elevation is communicated primarily through border and background differences:

```css
:root {
  --shadow-sm:   0 1px 2px rgba(0, 0, 0, 0.3);
  --shadow-md:   0 2px 8px rgba(0, 0, 0, 0.4);
  --shadow-lg:   0 4px 16px rgba(0, 0, 0, 0.5);
  --shadow-xl:   0 8px 32px rgba(0, 0, 0, 0.6);  /* Modals, dropdowns */
}
```

| Surface Level | Background | Border | Shadow |
|---|---|---|---|
| Base (page) | `--color-bg-primary` | none | none |
| Card / panel | `--color-bg-secondary` | `--color-border-default` | `--shadow-sm` or none |
| Elevated (dropdown, modal) | `--color-bg-secondary` | `--color-border-strong` | `--shadow-xl` |
| Input field | `--color-bg-tertiary` | `--color-border-default` | none |

---

## 7. Component Specifications

### 7.1 Button

```css
/* Primary button */
.btn-primary {
  background: var(--color-accent);
  color: var(--color-text-inverse);
  font-family: var(--font-sans);
  font-size: var(--text-sm);
  font-weight: var(--weight-semibold);
  padding: var(--space-2) var(--space-5);    /* 8px 20px */
  border: none;
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: background 150ms ease;
  height: 36px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
}

.btn-primary:hover {
  background: var(--color-accent-hover);
}

.btn-primary:active {
  background: var(--color-accent-active);
}

.btn-primary:focus-visible {
  outline: 2px solid var(--color-accent);
  outline-offset: 2px;
}

.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Secondary button (ghost) */
.btn-secondary {
  background: transparent;
  color: var(--color-text-primary);
  border: var(--border-width) solid var(--color-border-default);
  /* Same sizing as primary */
}

.btn-secondary:hover {
  background: var(--color-bg-hover);
  border-color: var(--color-border-strong);
}

/* Danger button */
.btn-danger {
  background: var(--color-error);
  color: var(--color-text-primary);
  /* Same sizing as primary */
}
```

**Button sizes:**

| Size | Height | Font Size | Padding |
|---|---|---|---|
| Small | 28px | `--text-xs` | `4px 12px` |
| Default | 36px | `--text-sm` | `8px 20px` |
| Large | 44px | `--text-base` | `12px 24px` |

### 7.2 Input

```css
.input {
  background: var(--color-bg-tertiary);
  color: var(--color-text-primary);
  font-family: var(--font-sans);
  font-size: var(--text-sm);
  padding: var(--space-2) var(--space-3);    /* 8px 12px */
  border: var(--border-width) solid var(--color-border-default);
  border-radius: var(--radius-md);
  height: 36px;
  width: 100%;
  transition: border-color 150ms ease;
}

.input::placeholder {
  color: var(--color-text-tertiary);
}

.input:hover {
  border-color: var(--color-border-strong);
}

.input:focus {
  outline: none;
  border-color: var(--color-accent);
  box-shadow: 0 0 0 1px var(--color-accent);
}

.input:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.input--error {
  border-color: var(--color-error);
}
```

### 7.3 Card

```css
.card {
  background: var(--color-bg-secondary);
  border: var(--border-width) solid var(--color-border-default);
  border-radius: var(--radius-lg);
  padding: var(--space-5);                   /* 20px */
}

.card--interactive {
  cursor: pointer;
  transition: border-color 150ms ease, background 150ms ease;
}

.card--interactive:hover {
  border-color: var(--color-border-strong);
  background: var(--color-bg-hover);
}

.card--selected {
  border-color: var(--color-accent);
  background: var(--color-accent-subtle);
}
```

### 7.4 Badge

```css
.badge {
  display: inline-flex;
  align-items: center;
  padding: var(--space-0.5) var(--space-2);  /* 2px 8px */
  font-size: var(--text-xs);
  font-weight: var(--weight-semibold);
  border-radius: var(--radius-sm);
  text-transform: uppercase;
  letter-spacing: var(--tracking-wide);
}

/* Difficulty badges */
.badge--absolute-beginner { background: #1e293b; color: #94a3b8; }
.badge--beginner          { background: var(--color-success-subtle); color: var(--color-success); }
.badge--intermediate      { background: var(--color-info-subtle); color: var(--color-info); }
.badge--advanced          { background: var(--color-warning-subtle); color: var(--color-warning); }
.badge--expert            { background: var(--color-error-subtle); color: var(--color-error); }

/* Verdict badges */
.badge--accepted          { background: var(--color-success-subtle); color: var(--color-success); }
.badge--wrong-answer      { background: var(--color-error-subtle); color: var(--color-error); }
.badge--pending           { background: var(--color-warning-subtle); color: var(--color-warning); }
```

### 7.5 Modal

```css
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 50;
}

.modal {
  background: var(--color-bg-secondary);
  border: var(--border-width) solid var(--color-border-strong);
  border-radius: var(--radius-xl);
  padding: var(--space-6);
  max-width: 480px;
  width: 90%;
  box-shadow: var(--shadow-xl);
}

.modal__title {
  font-size: var(--text-xl);
  font-weight: var(--weight-semibold);
  color: var(--color-text-primary);
  margin-bottom: var(--space-4);
}
```

### 7.6 Navigation Bar

```css
.navbar {
  position: sticky;
  top: 0;
  z-index: 40;
  height: 64px;
  background: var(--color-bg-primary);
  border-bottom: var(--border-width) solid var(--color-border-default);
  display: flex;
  align-items: center;
  padding: 0 var(--space-6);
}

.navbar__logo {
  font-size: var(--text-lg);
  font-weight: var(--weight-bold);
  color: var(--color-text-primary);
  letter-spacing: var(--tracking-tight);
}

.navbar__link {
  font-size: var(--text-sm);
  font-weight: var(--weight-medium);
  color: var(--color-text-secondary);
  padding: var(--space-2) var(--space-3);
  border-radius: var(--radius-md);
  transition: color 150ms ease, background 150ms ease;
  text-decoration: none;
}

.navbar__link:hover {
  color: var(--color-text-primary);
  background: var(--color-bg-hover);
}

.navbar__link--active {
  color: var(--color-accent);
}
```

### 7.7 Sidebar

```css
.sidebar {
  width: 260px;
  height: calc(100vh - 64px);    /* Below navbar */
  background: var(--color-bg-primary);
  border-right: var(--border-width) solid var(--color-border-default);
  padding: var(--space-4);
  overflow-y: auto;
  flex-shrink: 0;
}

.sidebar__item {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-2) var(--space-3);
  border-radius: var(--radius-md);
  font-size: var(--text-sm);
  color: var(--color-text-secondary);
  text-decoration: none;
  transition: color 150ms ease, background 150ms ease;
}

.sidebar__item:hover {
  color: var(--color-text-primary);
  background: var(--color-bg-hover);
}

.sidebar__item--active {
  color: var(--color-accent);
  background: var(--color-accent-subtle);
}
```

### 7.8 Table

```css
.table {
  width: 100%;
  border-collapse: collapse;
  font-size: var(--text-sm);
}

.table th {
  text-align: left;
  padding: var(--space-3) var(--space-4);
  font-weight: var(--weight-medium);
  color: var(--color-text-secondary);
  border-bottom: var(--border-width) solid var(--color-border-default);
  font-size: var(--text-xs);
  text-transform: uppercase;
  letter-spacing: var(--tracking-wide);
}

.table td {
  padding: var(--space-3) var(--space-4);
  color: var(--color-text-primary);
  border-bottom: var(--border-width) solid var(--color-border-subtle);
}

.table tr:hover td {
  background: var(--color-bg-hover);
}
```

---

## 8. Layout System

### 8.1 Breakpoints

```css
:root {
  --breakpoint-sm:   640px;
  --breakpoint-md:   768px;
  --breakpoint-lg:   1024px;
  --breakpoint-xl:   1280px;
  --breakpoint-2xl:  1536px;
}
```

### 8.2 Page Layouts

**Standard page layout (sidebar + content):**
```css
.app-layout {
  display: flex;
  min-height: calc(100vh - 64px);
}

.app-layout__content {
  flex: 1;
  padding: var(--space-6) var(--space-8);
  max-width: 1200px;
  overflow-y: auto;
}
```

**Problem workspace layout (split pane):**
```css
.workspace-layout {
  display: flex;
  height: calc(100vh - 64px);
}

.workspace-layout__description {
  width: 45%;
  overflow-y: auto;
  padding: var(--space-5);
  border-right: var(--border-width) solid var(--color-border-default);
}

.workspace-layout__editor {
  width: 55%;
  display: flex;
  flex-direction: column;
}
```

### 8.3 Responsive Behavior

| Breakpoint | Behavior |
|---|---|
| `< 768px` | Sidebar collapses to hamburger menu; single-column layout; workspace stacks vertically |
| `768px – 1024px` | Sidebar visible; content area adjusts |
| `> 1024px` | Full layout with sidebar, content area, and split panes |

---

## 9. Transitions and Motion

Minimal, purposeful transitions only:

```css
:root {
  --transition-fast:    150ms ease;
  --transition-normal:  200ms ease;
  --transition-slow:    300ms ease;
}
```

| Element | Property | Duration | When |
|---|---|---|---|
| Buttons | `background`, `border-color` | `--transition-fast` | Hover, active |
| Links | `color` | `--transition-fast` | Hover |
| Cards | `border-color`, `background` | `--transition-fast` | Hover |
| Inputs | `border-color`, `box-shadow` | `--transition-fast` | Focus |
| Sidebar items | `color`, `background` | `--transition-fast` | Hover |
| Modals | `opacity`, `transform` | `--transition-normal` | Open/close |
| Page transitions | `opacity` | `--transition-normal` | Route change |
| Tooltips | `opacity` | `--transition-fast` | Show/hide |

**No animations for:**
- Background elements
- Decorative motion
- Loading spinners (use a simple CSS keyframe, no libraries)
- Scroll effects or parallax

---

## 10. Iconography

Use **Lucide React** (`lucide-react`) for icons:
- Consistent, clean line icons
- Proper alignment with text
- Size: 16px inline with text, 20px in buttons, 24px standalone

```css
.icon {
  display: inline-flex;
  align-items: center;
  flex-shrink: 0;
}

.icon--sm { width: 16px; height: 16px; }
.icon--md { width: 20px; height: 20px; }
.icon--lg { width: 24px; height: 24px; }
```

---

## 11. Monaco Editor Theming

The Monaco Editor must match the design system:

```typescript
const nexoraEditorTheme: monaco.editor.IStandaloneThemeData = {
  base: "vs-dark",
  inherit: true,
  rules: [
    { token: "", foreground: "F5F5F5", background: "111111" },
    { token: "comment", foreground: "71717A", fontStyle: "italic" },
    { token: "keyword", foreground: "3B82F6" },
    { token: "string", foreground: "22C55E" },
    { token: "number", foreground: "F59E0B" },
    { token: "type", foreground: "38BDF8" },
    { token: "function", foreground: "A78BFA" },
    { token: "variable", foreground: "F5F5F5" },
    { token: "operator", foreground: "A1A1AA" },
  ],
  colors: {
    "editor.background": "#111111",
    "editor.foreground": "#F5F5F5",
    "editor.lineHighlightBackground": "#1C1C1C",
    "editor.selectionBackground": "#3B82F633",
    "editorCursor.foreground": "#3B82F6",
    "editorLineNumber.foreground": "#71717A",
    "editorLineNumber.activeForeground": "#A1A1AA",
    "editor.inactiveSelectionBackground": "#3B82F61A",
    "editorWidget.background": "#171717",
    "editorWidget.border": "#292929",
    "editorSuggestWidget.background": "#171717",
    "editorSuggestWidget.border": "#292929",
    "editorSuggestWidget.selectedBackground": "#1C1C1C",
    "input.background": "#171717",
    "input.border": "#292929",
    "input.foreground": "#F5F5F5",
    "scrollbarSlider.background": "#29292980",
    "scrollbarSlider.hoverBackground": "#3A3A3A80",
  },
};
```

---

## 12. Branding

### 12.1 Logo Treatment

- Product name: **Nexora CodeLab** / **Nexora InterviewAI**
- Parent brand: **Nexora Techno**
- Logo in navbar: text-only "Nexora" in `--weight-bold`, module name in `--weight-regular` or `--color-text-secondary`
- No custom logo SVG designed in Phase 1 — use typographic logo

### 12.2 Favicon

- Simple "N" letter mark on `--color-bg-primary` background with `--color-accent` text
- Provide as SVG favicon with PNG fallbacks (16x16, 32x32, 180x180 apple-touch-icon)

---

## 13. Accessibility Requirements

| Requirement | Implementation |
|---|---|
| **Color contrast** | All text meets WCAG 2.1 AA (4.5:1 for normal text, 3:1 for large text) |
| **Focus indicators** | All interactive elements have visible `:focus-visible` outlines |
| **Keyboard navigation** | All actions reachable via keyboard (Tab, Enter, Escape, Arrow keys) |
| **Screen readers** | Semantic HTML, ARIA labels on icon-only buttons, live regions for status updates |
| **Reduced motion** | Respect `prefers-reduced-motion: reduce` — disable all transitions |
| **Text scaling** | Layout works up to 200% zoom |

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```
