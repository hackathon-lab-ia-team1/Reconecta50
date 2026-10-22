export function collectReadableText(element: HTMLElement): string {
  const style = getComputedStyle(element);
  if (
    element.hidden ||
    element.getAttribute('aria-hidden') === 'true' ||
    element.hasAttribute('data-read-skip') ||
    style.display === 'none' ||
    style.visibility === 'hidden'
  )
    return '';
  if (element instanceof HTMLDetailsElement && !element.open) {
    const summary = Array.from(element.children).find((child) => child.tagName === 'SUMMARY');
    return summary instanceof HTMLElement ? collectReadableText(summary) : '';
  }
  if (element.matches('input, textarea, select')) {
    return element instanceof HTMLInputElement && element.placeholder
      ? ` ${element.placeholder}. `
      : '';
  }
  if (element.matches('button, a') && element.getAttribute('aria-label'))
    return ` ${element.getAttribute('aria-label')}. `;
  const children = Array.from(element.children).filter(
    (child): child is HTMLElement => child instanceof HTMLElement,
  );
  if (children.length && element.hasAttribute('data-read-order')) {
    return children
      .sort(
        (a, b) =>
          a.getBoundingClientRect().top - b.getBoundingClientRect().top ||
          a.getBoundingClientRect().left - b.getBoundingClientRect().left,
      )
      .map(collectReadableText)
      .join('. ');
  }
  return Array.from(element.childNodes)
    .map((node) => {
      if (node.nodeType === Node.TEXT_NODE) return node.textContent ?? '';
      if (node instanceof HTMLElement) return ` ${collectReadableText(node)} `;
      return '';
    })
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim();
}
