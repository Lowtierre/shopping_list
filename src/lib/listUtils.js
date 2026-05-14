import { DEFAULT_BUCKETS, STORAGE_KEY } from "../constants";

export const DEFAULT_QUANTITY = 1;
export const DEFAULT_UNIT = "unità";
export const UNIT_OPTIONS = ["unità", "g", "kg", "ml", "l"];

export function normalizeName(name) {
  return name.trim().replace(/\s+/g, " ");
}

export function sameName(a, b) {
  return normalizeName(a).toLowerCase() === normalizeName(b).toLowerCase();
}

export function createId() {
  return Math.random().toString(16).slice(2) + Date.now().toString(16);
}

export function normalizeQuantity(quantity) {
  const numericQuantity = Number.parseInt(quantity, 10);
  return Number.isFinite(numericQuantity) && numericQuantity >= 1 ? numericQuantity : DEFAULT_QUANTITY;
}

export function normalizeUnit(unit) {
  return UNIT_OPTIONS.includes(unit) ? unit : DEFAULT_UNIT;
}

export function normalizeEffectiveItem(item) {
  return {
    ...item,
    quantity: normalizeQuantity(item?.quantity),
    unit: normalizeUnit(item?.unit),
  };
}

export function normalizeEffectiveItems(items) {
  return Array.isArray(items) ? items.map(normalizeEffectiveItem) : [];
}

export function loadStoredState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return { effective: [], buckets: DEFAULT_BUCKETS };
    }

    const parsed = JSON.parse(raw);
    return {
      effective: normalizeEffectiveItems(parsed.effective),
      buckets: Array.isArray(parsed.buckets) ? parsed.buckets : DEFAULT_BUCKETS,
    };
  } catch {
    return { effective: [], buckets: DEFAULT_BUCKETS };
  }
}

export function createLocalBucket(name) {
  return {
    id: name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
    group: name,
    items: [],
  };
}

export function sortEffectiveItems(items) {
  return normalizeEffectiveItems(items).sort((a, b) => {
    const aRank = a.source === "essential" ? 0 : 1;
    const bRank = b.source === "essential" ? 0 : 1;
    if (aRank !== bRank) return aRank - bRank;
    return a.name.localeCompare(b.name);
  });
}

export function buildShoppingListLines(effectiveItems) {
  const lines = [];
  lines.push("Lista della spesa");
  lines.push("".padEnd(36, "-"));

  if (effectiveItems.length === 0) {
    lines.push("(vuota)");
    return lines.join("\n");
  }

  const essentials = effectiveItems.filter((item) => item.source === "essential");
  const custom = effectiveItems.filter((item) => item.source === "custom");
  const byGroup = new Map();

  essentials.forEach((item) => {
    const group = item.group || "Prodotti di base";
    if (!byGroup.has(group)) byGroup.set(group, []);
    byGroup.get(group).push(item);
  });

  for (const [group, items] of [...byGroup.entries()].sort((a, b) => a[0].localeCompare(b[0]))) {
    lines.push("");
    lines.push(`[${group}]`);
    items
      .sort((a, b) => a.name.localeCompare(b.name))
      .forEach((item) => lines.push(`- ${item.name} (${item.quantity} ${item.unit})`));
  }

  if (custom.length > 0) {
    lines.push("");
    lines.push("[Personalizzati]");
    custom
      .sort((a, b) => a.name.localeCompare(b.name))
      .forEach((item) => lines.push(`- ${item.name} (${item.quantity} ${item.unit})`));
  }

  return lines;
}

export function buildShoppingListText(effectiveItems) {
  return buildShoppingListLines(effectiveItems).join("\n");
}

function toPdfTextHex(text) {
  const bytes = [];
  for (const char of text) {
    const code = char.codePointAt(0);
    bytes.push(code <= 0xff ? code : 0x3f);
  }

  return bytes.map((byte) => byte.toString(16).padStart(2, "0")).join("").toUpperCase();
}

function wrapLine(line, maxLength = 82) {
  if (line.length <= maxLength) return [line];

  const words = line.split(" ");
  const wrapped = [];
  let current = "";

  words.forEach((word) => {
    const next = current ? `${current} ${word}` : word;
    if (next.length > maxLength && current) {
      wrapped.push(current);
      current = word;
      return;
    }

    current = next;
  });

  if (current) wrapped.push(current);
  return wrapped;
}

export function buildShoppingListPdfBlob(effectiveItems) {
  const wrappedLines = buildShoppingListLines(effectiveItems).flatMap((line) => wrapLine(line));
  const pages = [];
  let currentPage = [];

  wrappedLines.forEach((line, index) => {
    const isTitle = index === 0;
    const maxLines = isTitle ? 42 : 45;
    if (currentPage.length >= maxLines) {
      pages.push(currentPage);
      currentPage = [];
    }

    currentPage.push({ text: line, isTitle });
  });

  if (currentPage.length > 0) pages.push(currentPage);

  const objects = [];
  const pageObjectIds = [];
  const contentObjectIds = [];
  const fontObjectId = 3;
  let nextObjectId = 4;

  pages.forEach(() => {
    pageObjectIds.push(nextObjectId);
    contentObjectIds.push(nextObjectId + 1);
    nextObjectId += 2;
  });

  objects[1] = "<< /Type /Catalog /Pages 2 0 R >>";
  objects[2] = `<< /Type /Pages /Kids [${pageObjectIds.map((id) => `${id} 0 R`).join(" ")}] /Count ${pages.length} >>`;
  objects[fontObjectId] = "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>";

  pages.forEach((pageLines, pageIndex) => {
    const pageObjectId = pageObjectIds[pageIndex];
    const contentObjectId = contentObjectIds[pageIndex];
    const content = pageLines
      .map((line, lineIndex) => {
        const fontSize = line.isTitle ? 18 : 11;
        const y = 792 - lineIndex * 17;
        return `BT /F1 ${fontSize} Tf 50 ${y} Td <${toPdfTextHex(line.text)}> Tj ET`;
      })
      .join("\n");

    objects[pageObjectId] = `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 ${fontObjectId} 0 R >> >> /Contents ${contentObjectId} 0 R >>`;
    objects[contentObjectId] = `<< /Length ${content.length} >>\nstream\n${content}\nendstream`;
  });

  let pdf = "%PDF-1.4\n";
  const offsets = [0];
  for (let id = 1; id < objects.length; id += 1) {
    offsets[id] = pdf.length;
    pdf += `${id} 0 obj\n${objects[id]}\nendobj\n`;
  }

  const xrefOffset = pdf.length;
  pdf += `xref\n0 ${objects.length}\n0000000000 65535 f \n`;
  for (let id = 1; id < objects.length; id += 1) {
    pdf += `${String(offsets[id]).padStart(10, "0")} 00000 n \n`;
  }
  pdf += `trailer\n<< /Size ${objects.length} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;

  return new Blob([pdf], { type: "application/pdf" });
}
