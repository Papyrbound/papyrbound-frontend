# Papyrbound motion

Motion supports browsing and reading, with no looping decorative movement or scroll interception.

## References reviewed

- [Aardvark Book Club](https://www.aardvarkbookclub.com/): word-split headings and a playful presentation of physical books. Adapted into short heading reveals and gentle cover tilt.
- [Eduard Bodak](https://www.eduardbodak.com/): word-level typography entrances and layered navigation feedback. Adapted into staggered card entrances and responsive arrow details.
- [Untitled / Lorenzo Dossi](https://untitled.lorenzodossi.com/): expanding interaction demos and carefully eased control changes. Adapted into quick press responses and softer panel transitions.
- [Maxime Heckel](https://blog.maximeheckel.com/): interactive navigation and command controls. Adapted into a shared moving filter indicator and smoothly rearranging books.

These are interpretations of the references, not reproductions of their code or timing curves.

## Motion rules

- Headings: 500 ms word reveal, 40 ms between words. Screen readers receive the complete heading once.
- Cards: 500 ms fade and 14 px rise, 55 ms between siblings, capped at six delay steps. Each card reveals once when it enters the viewport.
- Books: layout-position springs when sorting, filtering, or resizing. Exiting books fade for 200 ms. Existing shadcn book menus stay attached to each book.
- Filters: one shared selection background moves between the existing shadcn buttons.
- Controls: approximately 180–260 ms feedback. Press compression is small; arrows move only a few pixels.
- Featured-book changes: 340 ms fade and 8 px slide. No delayed interaction or autoplay.
- Collections: entrance motion only. The collection card and pin keep their existing stationary hover behavior.

## Accessibility and implementation

`ReadingMotionProvider` combines the device motion preference with Settings → Reduce animations. Either disables transform/layout animation; CSS also removes control and panel motion. Changing the app preference takes effect immediately.

The reveal components extend the existing shadcn Card. Dialog, sheet, menu, slider, and filter controls remain the project's shadcn components. The existing Motion dependency supplies entrances, layout interpolation, and the shared filter indicator. No new package is required.
