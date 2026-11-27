# Papyrbound — Design System & UI/UX Context

## Purpose and scope

Papyrbound is a modern desktop reader for EPUB books and CBZ comics. It should
provide a refined, intuitive, distraction-free reading experience and feel like
a thoughtfully crafted desktop product. Prioritize simplicity, readability,
responsiveness, and purposeful interactions.

This document is the current design direction for new and revised interfaces.
Earlier design and motion documents record implementation history; where their
guidance conflicts with this direction, follow this document. Existing behavior
and user preferences should be preserved as interfaces are refined.

## Core directive

Use HeroUI for visual inspiration, Uber Base for design foundations, Apple Human
Interface Guidelines for user experience, and shadcn/ui for component
implementation. These are references rather than templates. Develop
Papyrbound's own recognizable visual identity.

Prioritize usability over decoration, clarity over complexity, consistency over
novelty, and purposeful design over visual trends.

## Visual language

Adopt a modern, refined, approachable visual language inspired by HeroUI while
retaining shadcn/ui as the component architecture.

- Use soft, intentional corner radii that suit the element's function and size.
- Differentiate surfaces subtly, with minimal reliance on visible borders.
- Keep typography clean, balanced, and readable.
- Maintain consistent component proportions and compact, comfortable controls.
- Use subtle shadows and elevation where separation is necessary.
- Treat light and dark themes as equally considered versions of the interface.
- Refine hover, focus, active, selected, and disabled states consistently.
- Give component variants a semantic purpose.

Avoid excessive rounding, unnecessary gradients, heavy shadows, decorative
effects, and animation that does not improve the experience. The interface
should feel premium without becoming visually overwhelming.

## Foundations and semantic intent

Draw on Uber Base's consistency, hierarchy, and semantic approach. Components
should communicate their purpose, with prominence reflecting action importance.

| Intent | Purpose | Existing shadcn implementation |
| --- | --- | --- |
| Primary | The main action in a context | `default` button variant |
| Secondary | A supporting action | `secondary` or `outline`, according to the shared pattern |
| Tertiary | A low-emphasis contextual action | `ghost` or `link` |
| Danger | A destructive action | `destructive` |

These intent names describe design roles; preserve the existing shadcn API unless
a shared component change requires otherwise. Avoid choosing visual variants
independently for otherwise equivalent actions.

### Typography

Use a consistent scale with defined sizes, weights, line heights, and roles for
page titles, section headings, body text, control labels, and metadata. Typography
should establish hierarchy without excessive color or decoration. Keep headings
appropriate to a desktop workspace rather than oversized dashboard displays.

Reading typography is independently configurable. Respect and preserve choices
for font, text size, line spacing, margins, themes, and other reading preferences.

### Spacing, layout, and tokens

Use a consistent spacing system with intentional alignment, predictable padding,
and sufficient whitespace. Avoid arbitrary values and inconsistent dimensions.
Prefer shared patterns over isolated adjustments for individual screens.

Centralize reusable decisions for:

- Semantic colors and light/dark surface roles.
- Typography and hierarchy.
- Spacing and component dimensions.
- Border radii.
- Elevation.
- Motion.
- Component interaction states.

The existing semantic CSS/Tailwind tokens live in
[src/app/globals.css](../src/app/globals.css). Shared component styles belong in
[src/shared/ui](../src/shared/ui). Extend these foundations when a reusable role
is missing instead of scattering hardcoded values through feature components.

## Desktop experience

Draw on Apple Human Interface Guidelines for clarity, simplicity, familiarity,
predictability, user control, and accessible desktop interactions.

- Give navigation, actions, and content an immediately recognizable purpose.
- Reduce cognitive load by removing unnecessary elements and distractions.
- Keep books, comics, and reading content as the primary focus.
- Use familiar sidebars, toolbars, context menus, keyboard shortcuts, search,
  resizable panels, preference dialogs, and native-feeling window layouts.
- Make interaction outcomes predictable.
- Expose essential functionality immediately and disclose advanced controls
  progressively without cluttering the interface.
- Provide clear, timely feedback for loading, importing, saving, navigation,
  updating content, and recoverable failures.
- Preserve personalization and preferences across sessions.

The reading interface deserves particular attention: controls should support a
comfortable, immersive environment and recede when the reader focuses on content.

## Component architecture

Use shadcn/ui as the primary foundation, customized intentionally for Papyrbound.
Use HeroUI as a visual reference rather than introducing its component library.
Do not accept the default shadcn appearance without considering its fit.

Components must be reusable, composable, accessible, type-safe, consistent,
maintainable, and extensible. Reuse the components in `src/shared/ui`; add missing
shadcn components before creating custom primitives. Keep component behavior,
visual styling, and application logic clearly separated.

Retain the project's technical foundation: Tauri, Rust, Next.js, TypeScript,
Tailwind CSS, Motion/CSS transitions, semantic tokens, and reusable components.
Frontend architecture and interactions must remain compatible with the desktop
environment and packaged application.

Use publicly available references. Do not copy proprietary premium component
source code or assets.

## Motion and interaction

Motion should explain relationships, provide feedback, and improve perceived
responsiveness. Use restrained transitions for sidebars, dialogs, menus, hover
and selection states, navigation, loading, and reading controls when useful.

Avoid excessive bouncing, distracting effects, decorative motion, or transitions
that delay an action. Interaction should remain available immediately. Reuse
shared motion patterns rather than setting unrelated timings across screens.

Respect both the system's reduced-motion setting and the application's reduced
animation preference. Motion must not be required to understand state changes.

## Accessibility and states

Support keyboard navigation, predictable focus movement, visible focus
indicators, screen-reader labels and status feedback, sufficient contrast, and
reduced motion from the beginning. Make selection and active states understandable
without relying on color alone. Keep controls usable at compact window sizes and
with user-selected text sizes.

Similar elements should look and behave similarly in both themes. Loading,
empty, error, success, disabled, hover, focus, and selection states are part of
the component design rather than afterthoughts.

## Papyrbound's identity

The application should feel minimal, sophisticated, calm, modern, cohesive,
content-focused, intuitive, premium, and native to the desktop.

Avoid generic dashboard aesthetics, excessive card-based layouts, unnecessary
badges, oversized headings, heavy shadows, and visual clutter. Introduce visual
elements for a recognizable purpose rather than decoration alone.

## Decision framework

Before designing or implementing an interface, consider:

1. Does this improve the user experience?
2. Is the purpose immediately understandable?
3. Is it consistent with the existing design system?
4. Can the interaction be simplified?
5. Does it respect accessibility?
6. Does it feel appropriate for a desktop application?
7. Does it support the content rather than distract from it?
8. Is the visual treatment intentional?
