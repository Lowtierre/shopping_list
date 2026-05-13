import { DEFAULT_BUCKETS, STORAGE_KEY } from "../constants";

export function normalizeName(name) {
  return name.trim().replace(/\s+/g, " ");
}

export function sameName(a, b) {
  return normalizeName(a).toLowerCase() === normalizeName(b).toLowerCase();
}

export function createId() {
  return Math.random().toString(16).slice(2) + Date.now().toString(16);
}

export function loadStoredState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return { effective: [], buckets: DEFAULT_BUCKETS };
    }

    const parsed = JSON.parse(raw);
    return {
      effective: Array.isArray(parsed.effective) ? parsed.effective : [],
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
  return [...items].sort((a, b) => {
    const aRank = a.source === "essential" ? 0 : 1;
    const bRank = b.source === "essential" ? 0 : 1;
    if (aRank !== bRank) return aRank - bRank;
    return a.name.localeCompare(b.name);
  });
}

export function buildShoppingListText(effectiveItems) {
  const lines = [];
  const now = new Date();
  lines.push("Shopping List");
  lines.push(now.toLocaleString());
  lines.push("".padEnd(22, "-"));

  if (effectiveItems.length === 0) {
    lines.push("(empty)");
    return lines.join("\n");
  }

  const essentials = effectiveItems.filter((item) => item.source === "essential");
  const custom = effectiveItems.filter((item) => item.source === "custom");
  const byGroup = new Map();

  essentials.forEach((item) => {
    const group = item.group || "Essentials";
    if (!byGroup.has(group)) byGroup.set(group, []);
    byGroup.get(group).push(item.name);
  });

  for (const [group, items] of [...byGroup.entries()].sort((a, b) => a[0].localeCompare(b[0]))) {
    lines.push("");
    lines.push(`[${group}]`);
    items.sort((a, b) => a.localeCompare(b)).forEach((name) => lines.push(`- ${name}`));
  }

  if (custom.length > 0) {
    lines.push("");
    lines.push("[Custom]");
    custom
      .map((item) => item.name)
      .sort((a, b) => a.localeCompare(b))
      .forEach((name) => lines.push(`- ${name}`));
  }

  return lines.join("\n");
}
