/**
 * Reads the structure out of a product description so the product page can
 * show it properly instead of as one run-on paragraph.
 *
 * Descriptions are whatever the admin pastes into a rich-text box. In practice
 * that is often a spec sheet copied from a quick-commerce listing — a heading
 * such as "Highlights", then label/value pairs written as <h3>label</h3> and a
 * <span> or <p> value (brand, product type, weight, ingredients, FSSAI licence,
 * nutrition…), wrapped in tens of kilobytes of inline styles. Flattening that
 * to plain text produced "Highlights brand Fresh Eggs product type White Egg
 * dietary preference Non Veg weight 300 g…", cut off after six lines.
 *
 * There is no DOM in React Native, so this walks the tags directly and keeps
 * only what a shopper reads:
 *
 * - h1/h2        → a heading
 * - h3–h6        → a row label; following text up to the next heading is its value
 * - li           → a bullet
 * - other text   → a paragraph
 *
 * Plain descriptions with no headings come out as paragraphs, so nothing an
 * admin types is lost.
 */

export type DetailBlock =
  | { type: 'heading'; text: string }
  | { type: 'row'; label: string; value: string }
  | { type: 'bullet'; text: string }
  | { type: 'paragraph'; text: string };

const VOID = new Set(['br', 'img', 'hr', 'input', 'meta', 'link', 'source', 'wbr']);
const BLOCK = new Set([
  'p', 'div', 'li', 'ul', 'ol', 'br', 'tr', 'td', 'th', 'table', 'section',
  'article', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote',
]);

/** Section titles that only restate "here are the details". */
const GENERIC_HEADINGS = new Set([
  'highlights', 'product details', 'details', 'description', 'information',
  'product information', 'about this product', 'specifications',
]);

const ACRONYMS: Record<string, string> = { fssai: 'FSSAI', mrp: 'MRP', gst: 'GST', ean: 'EAN', spf: 'SPF' };

const NAMED_ENTITIES: Record<string, string> = {
  amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ', rsquo: '’',
  lsquo: '‘', rdquo: '”', ldquo: '“', ndash: '–', mdash: '—', hellip: '…',
  deg: '°', times: '×', reg: '®', copy: '©', trade: '™', middot: '·', bull: '•',
  eacute: 'é', egrave: 'è', ecirc: 'ê', aacute: 'á', agrave: 'à', acirc: 'â',
  iacute: 'í', oacute: 'ó', ouml: 'ö', uuml: 'ü', auml: 'ä', ntilde: 'ñ',
  ccedil: 'ç', szlig: 'ß',
};

function decodeEntities(s: string): string {
  return s.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (match, entity: string) => {
    if (entity[0] === '#') {
      const code =
        entity[1].toLowerCase() === 'x' ? parseInt(entity.slice(2), 16) : parseInt(entity.slice(1), 10);
      return Number.isFinite(code) && code > 0 ? String.fromCodePoint(code) : match;
    }
    return NAMED_ENTITIES[entity.toLowerCase()] ?? match;
  });
}

const tidy = (s: string) => decodeEntities(s).replace(/\s+/g, ' ').trim();

/** "product type" → "Product type"; "fssai license" → "FSSAI license". */
export function formatLabel(raw: string): string {
  const label = raw.replace(/\s*:\s*$/, '').trim();
  if (!label) return label;
  if (label === label.toUpperCase()) return label;
  const words = label.split(' ').map((w) => ACRONYMS[w.toLowerCase()] ?? w);
  const first = words[0];
  words[0] = first === first.toUpperCase() ? first : first.charAt(0).toUpperCase() + first.slice(1);
  return words.join(' ');
}

interface Unit {
  text: string;
  heading: number; // 0 when not inside a heading, else 1–6
  inList: boolean;
}

/** Splits HTML into text runs, each tagged with the heading or list it sits in. */
function toUnits(html: string): Unit[] {
  const cleaned = html
    .replace(/<(style|script)\b[\s\S]*?<\/\1>/gi, '')
    .replace(/<!--[\s\S]*?-->/g, '');

  const stack: string[] = [];
  const units: Unit[] = [];
  let buffer = '';

  const context = () => {
    let heading = 0;
    let inList = false;
    for (const tag of stack) {
      const m = /^h([1-6])$/.exec(tag);
      if (m) heading = Number(m[1]);
      if (tag === 'li') inList = true;
    }
    return { heading, inList };
  };

  const flush = () => {
    const text = tidy(buffer);
    buffer = '';
    if (text) units.push({ text, ...context() });
  };

  for (const token of cleaned.split(/(<[^>]*>)/)) {
    if (!token) continue;
    if (token[0] !== '<') {
      buffer += token;
      continue;
    }
    const closing = token[1] === '/';
    const name = (/^<\/?\s*([a-z0-9]+)/i.exec(token)?.[1] ?? '').toLowerCase();
    if (!name) continue;

    if (BLOCK.has(name)) flush();

    if (closing) {
      const at = stack.lastIndexOf(name);
      if (at !== -1) stack.length = at;
    } else if (!VOID.has(name) && !token.endsWith('/>')) {
      stack.push(name);
    }
  }
  flush();
  return units;
}

export function parseProductDetails(html?: string | null): DetailBlock[] {
  if (!html) return [];
  const blocks: DetailBlock[] = [];
  let row: { label: string; parts: string[] } | null = null;

  const closeRow = () => {
    if (!row) return;
    const value = row.parts.join('\n').trim();
    // A label with nothing after it is just a heading the admin styled small.
    blocks.push(value ? { type: 'row', label: row.label, value } : { type: 'heading', text: row.label });
    row = null;
  };

  for (const unit of toUnits(html)) {
    if (unit.heading === 1 || unit.heading === 2) {
      closeRow();
      if (!GENERIC_HEADINGS.has(unit.text.toLowerCase())) blocks.push({ type: 'heading', text: unit.text });
    } else if (unit.heading >= 3) {
      closeRow();
      row = { label: formatLabel(unit.text), parts: [] };
    } else if (row) {
      row.parts.push(unit.text);
    } else if (unit.inList) {
      blocks.push({ type: 'bullet', text: unit.text });
    } else {
      blocks.push({ type: 'paragraph', text: unit.text });
    }
  }
  closeRow();
  return blocks;
}

/** First row whose label matches one of `names`, compared case-insensitively. */
export function findDetail(blocks: DetailBlock[], ...names: string[]): string | undefined {
  const wanted = names.map((n) => n.toLowerCase());
  for (const name of wanted) {
    const hit = blocks.find((b) => b.type === 'row' && b.label.toLowerCase() === name);
    if (hit && hit.type === 'row') return hit.value;
  }
  return undefined;
}

export type Diet = 'veg' | 'nonveg';

/** Maps a "dietary preference" value to the Indian veg / non-veg mark. */
export function dietFrom(value?: string): Diet | undefined {
  if (!value) return undefined;
  if (/non[\s-]*veg|egg|meat|chicken|fish/i.test(value)) return 'nonveg';
  if (/\bveg|vegan|vegetarian/i.test(value)) return 'veg';
  return undefined;
}
