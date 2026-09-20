# Agent Design Spec

## Overview:
Design a mobile-first finance dashboard UI inspired by premium dark-mode fintech apps. The interface should feel calm, tactile, minimal, and slightly futuristic without looking flashy. Prioritize soft contrast, rounded geometry, restrained color use, and dense-but-readable information layout. [file:1]

## Visual Style
- Use a nearly-black charcoal background, not pure black. Main surfaces should sit in a tight tonal range with subtle separation between page background, cards, and controls. [file:1]
- Create depth with soft inner and outer shadows rather than strong borders. Components should feel gently embossed or inset, similar to neumorphism but more refined and realistic [file:1]
- Use large rounded corners throughout. Most cards should feel pill-like or capsule-inspired, with rounded bottoms tabs and segmented controls echoing the same geometry
- Keep the interface monochromatic except for one success accent, a vivid green used for performance numbers and progress bars. Any additional category colors should appear only in tiny chart legends. [file:1]

## Color System
- Background: deep charcoal.
- Surface: slightly lighter charcoal.
- Elevated surface: one step lighter than surface.
- Stroke: ultra-low contrast gray, only when needed.
- Primary text: off-white.
- Secondary text: medium gray.
- Tertiary text: dim gray.
- Accent positive: bright green.
- Data accents: blue, yellow, pink, gray, for allocation labels only. [file:1]

Example palette:
- 'bg': '#1A1A1A'
- 'surface': '#222222'
- 'surface-2': '#2A2A2A'
- 'stroke': rgba(255,255,255,0.06)
- 'text': '#F3F3F3'
- 'text-muted': '#A1A1A1'
- 'text-faint': '#6F6F6F'
- 'green': '#22C55E'

## Typography
- Use a clean modern sans-serif such as Inter, SF Pro, Geist, or Satoshi
- Emphasize hierarchy through size and weight, not color
- Large balance numbers should be bold and prominent
- Section labels should be medium weight
- Supporting metadata should be smaller and muted
- Avoid decorative fonts, wide tracking, or oversized headlines. [file:1]

<!-- Suggested Type Scale:
- Greeting Title: '32-36px', semibold
- Account Subtitle: '14-16px', regular
- Portfolio Value: '48-56px', bold
-  -->

## Tone
- Premium
- Quiet
- Technical
- Trustworthy
- Minimal
- Tactile
- Mobile-native [file:1]

## Avoid
- Bright gradients
- Glassmorphism
- Overly colorful cards
- Hard borders
- White backgrounds
- Large illustrations
- Marketing-style hero copy
- Excessive chart clutter
- Generic SaaS dashboard spacing [file:1]

## 3. Component Construction Guidelines
* **State & Motion:** Use `framer-motion` for transitions. Micro-interactions must not exceed $200$ms duration.
* **Accessibility (a11y):** All interactive elements (buttons, modals, dropdowns) must include proper ARIA attributes, keyboard navigation (`Enter` / `Space` to activate), and `focus-visible` ring states.
* **File Structure:** Components must be collocated with their tests and styles, e.g., `components/Button/Button.tsx`, `components/Button/Button.test.tsx`, `components/Button/Button.module.css` (if not utilizing pure Tailwind classes).
* **Prop Types:** Define strict interfaces for all custom components. Use `React.ComponentPropsWithoutRef<typeof Element>` for extending standard HTML elements.

## 4. Workflows & Codex Instructions
* **Scaffolding:** Before starting a large design implementation wave, read the comprehensive requirements located in `.codex/specs/design.md`.
* **Review Protocol:** Always self-review your output against this `AGENTS.md` before finalizing code delivery. Specifically check for:
    1. ARIA compliance.
    2. Exact Tailwind color mapping.
    3. Proper mobile breakpoint inclusion.

## 5. Build & Testing
* **Linting Check:** Always run `pnpm run lint` before suggesting code to ensure CSS/JSX syntax is valid.
* **Component Tests:** If creating new UI features, include UI tests for interactivity using React Testing Library and Vitest.
