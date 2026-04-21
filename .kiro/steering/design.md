# Design Principles

## Core Design Constraints

### Typography

**Don't:**
- Use Inter, Roboto, Arial, or system default fonts
- Use monospace fonts just for "developer vibes"

**Do:**
- Choose distinctive, purposeful typefaces that match the product personality
- Use monospace only when displaying actual code or technical data

### Color

**Don't:**
- Use gray text on colored backgrounds
- Use the default "AI palette" (cyan-on-dark, purple-to-blue gradients)
- Use pure black (#000000) or pure white (#ffffff)

**Do:**
- Always tint your neutrals (e.g., `#1a1a1a` instead of `#000000`)
- Use high-contrast text on colored backgrounds
- Choose a distinctive color palette that avoids generic AI aesthetics

### Layout

**Don't:**
- Wrap everything in cards
- Nest cards inside cards
- Use identical card grids repeatedly
- Center everything

**Do:**
- Prefer left-aligned text with asymmetric layouts
- Use varied layout patterns throughout the interface
- Reserve cards for when they serve a clear functional purpose
- Create visual hierarchy through spacing and typography, not just containers

### Motion

**Don't:**
- Use bounce or elastic easing
- Animate width, height, or padding

**Do:**
- Use smooth deceleration easing (ease-out, ease-in-out)
- Animate transform and opacity instead
- Keep animations subtle and purposeful

### Simplicity

**Don't:**
- Add decorative borders, shadows, and backgrounds without functional purpose

**Do:**
- Remove visual elements that don't serve strict functional hierarchy
- Let whitespace and typography create structure
- Use borders and shadows sparingly, only when they clarify relationships or hierarchy

---

## Core Domain Expertise

Apply deep expertise across these 7 pillars in all design decisions and code:

### 1. Typography

- **Type Systems**: Utilize strong type systems with thoughtful font pairing
- **Modular Scales**: Implement consistent typographic scales (e.g., 1.25, 1.5, 1.618)
- **OpenType Features**: Leverage features like ligatures, tabular numbers, and proper fractions
- **Visual Hierarchy**: Establish clear hierarchy through size, weight, and spacing
- **Line Height**: Use appropriate line-height ratios (1.5 for body, 1.2 for headings)
- **Measure**: Keep line length optimal (45-75 characters for readability)

**Example:**
```css
/* Modular scale with 1.25 ratio */
font-size: 1rem;      /* 16px - body */
font-size: 1.25rem;   /* 20px - small heading */
font-size: 1.563rem;  /* 25px - medium heading */
font-size: 1.953rem;  /* 31px - large heading */
font-size: 2.441rem;  /* 39px - xl heading */
```

### 2. Color and Contrast

- **OKLCH Color Space**: Prefer OKLCH for perceptually uniform colors
- **Accessible Contrast**: Ensure WCAG AA minimum (4.5:1 for text, 3:1 for large text)
- **Dark Modes**: Craft intentional dark modes with tinted neutrals (not pure black)
- **Tinted Neutrals**: Always add subtle color temperature to grays
- **Color Scales**: Generate consistent color scales with predictable lightness

**Example:**
```css
/* OKLCH for perceptually uniform colors */
--accent: oklch(0.65 0.25 25);        /* Orange */
--accent-dark: oklch(0.55 0.25 25);   /* Darker orange */
--neutral-100: oklch(0.98 0.01 25);   /* Warm white */
--neutral-900: oklch(0.20 0.01 25);   /* Warm black */
```

### 3. Spatial Design

- **Spacing Systems**: Implement consistent spacing scales (4px, 8px, 16px, 24px, 32px, 48px, 64px)
- **Robust Grids**: Use 12-column grids for flexible layouts
- **Negative Space**: Use whitespace intentionally to create visual hierarchy
- **Rhythm**: Maintain vertical rhythm with consistent spacing patterns
- **Proximity**: Group related elements, separate unrelated ones

**Example:**
```css
/* Spacing scale (base 4px) */
--space-1: 0.25rem;  /* 4px */
--space-2: 0.5rem;   /* 8px */
--space-3: 0.75rem;  /* 12px */
--space-4: 1rem;     /* 16px */
--space-6: 1.5rem;   /* 24px */
--space-8: 2rem;     /* 32px */
--space-12: 3rem;    /* 48px */
--space-16: 4rem;    /* 64px */
```

### 4. Motion Design

- **Subtle Staggering**: Stagger animations by 50-100ms for sequential elements
- **Refined Easing**: Use custom cubic-bezier curves for natural motion
- **Reduced Motion**: Always respect `prefers-reduced-motion` media query
- **Purposeful Motion**: Every animation must serve a functional purpose
- **Duration**: Keep animations short (150-300ms for most interactions)
- **Transform & Opacity**: Only animate transform and opacity for performance

**Example:**
```css
/* Respect user preferences */
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}

/* Refined easing curves */
--ease-out: cubic-bezier(0.33, 1, 0.68, 1);
--ease-in-out: cubic-bezier(0.65, 0, 0.35, 1);

/* Staggered animations */
.item:nth-child(1) { transition-delay: 0ms; }
.item:nth-child(2) { transition-delay: 50ms; }
.item:nth-child(3) { transition-delay: 100ms; }
```

### 5. Interaction Design

- **Clear Focus States**: Visible, high-contrast focus indicators for keyboard navigation
- **Resilient Forms**: Inline validation, helpful error messages, clear success states
- **Loading Patterns**: Use skeleton screens or subtle spinners (avoid blocking UI)
- **Hover States**: Provide clear feedback on interactive elements
- **Touch Targets**: Minimum 44x44px for mobile touch targets
- **Disabled States**: Clearly communicate when elements are disabled

**Example:**
```css
/* Clear focus states */
button:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 2px;
}

/* Touch targets */
@media (pointer: coarse) {
  button {
    min-height: 44px;
    min-width: 44px;
  }
}
```

### 6. Responsive Design

- **Mobile-First**: Always start with mobile layout, enhance for larger screens
- **Fluid Design**: Use clamp(), min(), max() for fluid typography and spacing
- **Container Queries**: Prefer container queries over media queries for component-level responsiveness
- **Breakpoints**: Use semantic breakpoints (sm: 640px, md: 768px, lg: 1024px, xl: 1280px)
- **Flexible Grids**: Use CSS Grid and Flexbox for flexible, responsive layouts
- **Viewport Units**: Use dvh (dynamic viewport height) instead of vh on mobile

**Example:**
```css
/* Fluid typography */
font-size: clamp(1rem, 0.9rem + 0.5vw, 1.25rem);

/* Container queries */
@container (min-width: 768px) {
  .card {
    grid-template-columns: 1fr 2fr;
  }
}

/* Mobile-first approach */
.grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
}

@media (min-width: 768px) {
  .grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 2rem;
  }
}
```

### 7. UX Writing

- **Concise Labels**: Use active, specific button labels ("Save changes" not "Submit")
- **Helpful Errors**: Explain what went wrong and how to fix it
- **Engaging Empty States**: Guide users on what to do next
- **Active Voice**: Use active voice for clarity ("Delete file" not "File will be deleted")
- **Scannable Text**: Use short paragraphs, bullet points, and clear headings
- **Consistent Tone**: Maintain a consistent, human tone throughout

**Examples:**

**Button Labels:**
- ❌ "Submit" → ✅ "Start interview"
- ❌ "OK" → ✅ "Got it"
- ❌ "Cancel" → ✅ "Go back"

**Error Messages:**
- ❌ "Error 400" → ✅ "Job description is required. Please paste a job description to continue."
- ❌ "Invalid input" → ✅ "Microphone access denied. Please allow microphone access in your browser settings."

**Empty States:**
- ❌ "No data" → ✅ "No interviews yet. Start your first practice session to get feedback."

---

## Current Implementation

The redesigned UI implements:
- **Typography**: Space Grotesk (headings/body) + IBM Plex Mono (technical data)
- **Color**: Orange accent (#ea580c) with tinted neutrals
- **Layout**: Asymmetric grids (7/5, 2/10, 4/8 column splits)
- **Motion**: 200ms transitions with smooth easing, transform/opacity only
- **Spacing**: Consistent 8px-based scale
- **Responsive**: Mobile-first with 12-column grid system
