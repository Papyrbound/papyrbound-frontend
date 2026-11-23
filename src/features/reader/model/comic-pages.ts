export function comicPages(index: number, total: number, spread: boolean) {
  const first = spread && index > 0 ? 1 + Math.floor((index - 1) / 2) * 2 : index;
  const pages = spread && first > 0 && first + 1 < total ? [first, first + 1] : [first];
  return { pages, previous: first > 0 ? Math.max(0, first - (spread ? 2 : 1)) : -1, next: pages.at(-1)! + 1 < total ? pages.at(-1)! + 1 : -1 };
}
