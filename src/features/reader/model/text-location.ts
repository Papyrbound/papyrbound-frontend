/** Text offsets stay stable across appearance changes and highlight wrappers. */
export function textNodes(body: HTMLElement) {
  const walker = body.ownerDocument.createTreeWalker(body, 4);
  const nodes: Text[] = [];
  while (walker.nextNode()) {
    const node = walker.currentNode as Text;
    if (!node.parentElement?.closest("script,style")) nodes.push(node);
  }
  return nodes;
}

export function selectionLocation(body: HTMLElement, selection: Selection | null) {
  if (!selection?.rangeCount || selection.isCollapsed) return;
  const range = selection.getRangeAt(0);
  if (!body.contains(range.commonAncestorContainer)) return;
  let total = 0, start: number | undefined, end: number | undefined;
  for (const node of textNodes(body)) {
    if (node === range.startContainer) start = total + range.startOffset;
    if (node === range.endContainer) end = total + range.endOffset;
    total += node.length;
  }
  if (start === undefined || end === undefined || end <= start) return;
  return { start, end, quote: selection.toString() };
}

export function markPassage(body: HTMLElement, start: number, end: number, color: string, id?: string) {
  let total = 0;
  let first: HTMLElement | undefined;
  for (const node of textNodes(body)) {
    const next = total + node.length;
    const from = Math.max(0, start - total), to = Math.min(node.length, end - total);
    if (to > from) {
      const range = body.ownerDocument.createRange();
      range.setStart(node, from); range.setEnd(node, to);
      const mark = body.ownerDocument.createElement("mark");
      mark.style.backgroundColor = color; mark.style.color = "#242424";
      if (id) mark.dataset.annotationId = id;
      range.surroundContents(mark); first ??= mark;
    }
    total = next;
  }
  return first;
}
