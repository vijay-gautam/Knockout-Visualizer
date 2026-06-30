// Thin SVG DOM helpers. The only module that touches the SVG namespace.

export const SVG_NS = 'http://www.w3.org/2000/svg';

// Create an SVG element with attributes. Values are coerced to strings.
export function el(tag, attrs = {}) {
  const node = document.createElementNS(SVG_NS, tag);
  for (const [k, v] of Object.entries(attrs)) node.setAttribute(k, v);
  return node;
}

// Remove all children of a node.
export function clear(node) {
  while (node.firstChild) node.removeChild(node.firstChild);
}
