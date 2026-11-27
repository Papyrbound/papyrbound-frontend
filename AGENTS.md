<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## UI components

Use shadcn/ui components whenever they fit. Reuse the existing components in `src/shared/ui` and add missing shadcn components before building custom UI primitives.

## Design direction

Read [Papyrbound's design system and UI/UX context](docs/design-system.md) before designing or changing an interface. It is the current design direction and takes precedence over earlier design-reference and motion notes when they conflict.

Use HeroUI for visual inspiration, Uber Base for semantic foundations, Apple Human Interface Guidelines for desktop UX, and shadcn/ui for implementation. Preserve Papyrbound's own identity: calm, compact, content-focused, accessible, and consistent across light and dark themes. Centralize reusable visual decisions in semantic tokens and shared components; avoid decorative clutter and isolated styling solutions.
