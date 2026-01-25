/* Shopping List App (client-side)
   - Essentials catalog -> checkbox to add/remove from effective list
   - Effective list -> add custom items, remove items
   - Download -> exports effective list as .txt
   - Persistence -> localStorage
*/

const STORAGE_KEY = "shopping_list_v1";

const ESSENTIALS = [
  {
    group: "Cleaning",
    items: [
      "Dish soap",
      "Sponge",
      "Trash bags",
      "Paper towels",
      "All-purpose cleaner",
      "Glass cleaner",
      "Laundry detergent",
      "Fabric softener",
      "Bleach",
      "Toilet cleaner",
      "Floor cleaner",
    ],
  },
  {
    group: "Food basics",
    items: [
      "Pasta",
      "Rice",
      "Canned tomatoes",
      "Beans",
      "Tuna",
      "Eggs",
      "Milk",
      "Butter",
      "Cheese",
      "Bread",
      "Olive oil",
      "Coffee",
      "Tea",
      "Sugar",
      "Salt",
      "Pepper",
    ],
  },
  {
    group: "Fresh",
    items: ["Fruit", "Vegetables", "Yogurt", "Chicken", "Fish"],
  },
  {
    group: "Bathroom",
    items: ["Toilet paper", "Hand soap", "Shampoo", "Toothpaste", "Deodorant"],
  },
  {
    group: "Home",
    items: ["Batteries", "Light bulbs", "Aluminum foil", "Baking paper"],
  },
];

// --- State ---
function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { effective: [] };
    const parsed = JSON.parse(raw);
    if (!parsed || !Array.isArray(parsed.effective)) return { effective: [] };
    return parsed;
  } catch {
    return { effective: [] };
  }
}

function saveState(state) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

let state = loadState();

// Effective list item shape:
// { id: string, name: string, source: "essential"|"custom", group?: string, createdAt: number }

// --- Helpers ---
const $ = (sel) => document.querySelector(sel);

function normalizeName(name) {
  return name.trim().replace(/\s+/g, " ");
}

function sameName(a, b) {
  return normalizeName(a).toLowerCase() === normalizeName(b).toLowerCase();
}

function uid() {
  return Math.random().toString(16).slice(2) + Date.now().toString(16);
}

function isInEffective(name) {
  return state.effective.some((it) => sameName(it.name, name));
}

function addToEffective({ name, source, group }) {
  const n = normalizeName(name);
  if (!n) return;

  if (isInEffective(n)) return;

  state.effective.push({
    id: uid(),
    name: n,
    source,
    group: group || undefined,
    createdAt: Date.now(),
  });

  // Sort: essentials first, then custom; within that alphabetical
  state.effective.sort((a, b) => {
    const aRank = a.source === "essential" ? 0 : 1;
    const bRank = b.source === "essential" ? 0 : 1;
    if (aRank !== bRank) return aRank - bRank;
    return a.name.localeCompare(b.name);
  });

  saveState(state);
  renderEffective();
  syncCheckboxes();
}

function removeFromEffectiveByName(name) {
  const before = state.effective.length;
  state.effective = state.effective.filter((it) => !sameName(it.name, name));
  if (state.effective.length !== before) {
    saveState(state);
    renderEffective();
    syncCheckboxes();
  }
}

function removeFromEffectiveById(id) {
  const before = state.effective.length;
  state.effective = state.effective.filter((it) => it.id !== id);
  if (state.effective.length !== before) {
    saveState(state);
    renderEffective();
    syncCheckboxes();
  }
}

function clearEffective() {
  state.effective = [];
  saveState(state);
  renderEffective();
  syncCheckboxes();
}

// --- Render Essentials ---
function renderEssentials(filterText = "") {
  const container = $("#essentialsContainer");
  container.innerHTML = "";

  const q = normalizeName(filterText).toLowerCase();

  ESSENTIALS.forEach((groupObj) => {
    const matchesGroup =
      !q ||
      groupObj.group.toLowerCase().includes(q) ||
      groupObj.items.some((item) => item.toLowerCase().includes(q));

    if (!matchesGroup) return;

    const groupEl = document.createElement("div");
    groupEl.className = "group";

    const title = document.createElement("div");
    title.className = "group-title";
    title.innerHTML = `<strong>${groupObj.group}</strong><span class="pill">${groupObj.items.length} items</span>`;

    const itemsEl = document.createElement("div");
    itemsEl.className = "group-items";

    groupObj.items.forEach((name) => {
      if (q && !name.toLowerCase().includes(q) && !groupObj.group.toLowerCase().includes(q)) return;

      const id = `ess-${groupObj.group}-${name}`.replace(/[^a-z0-9_-]/gi, "_");

      const label = document.createElement("label");
      label.className = "item";
      label.setAttribute("for", id);

      const cb = document.createElement("input");
      cb.type = "checkbox";
      cb.id = id;
      cb.dataset.name = name;
      cb.dataset.group = groupObj.group;

      cb.checked = isInEffective(name);

      cb.addEventListener("change", (e) => {
        const itemName = e.target.dataset.name;
        const itemGroup = e.target.dataset.group;
        if (e.target.checked) {
          addToEffective({ name: itemName, source: "essential", group: itemGroup });
        } else {
          removeFromEffectiveByName(itemName);
        }
      });

      const span = document.createElement("span");
      span.textContent = name;

      label.appendChild(cb);
      label.appendChild(span);
      itemsEl.appendChild(label);
    });

    groupEl.appendChild(title);
    groupEl.appendChild(itemsEl);
    container.appendChild(groupEl);
  });
}

// Keep essentials checkboxes aligned with effective list state
function syncCheckboxes() {
  const checkboxes = document.querySelectorAll('#essentialsContainer input[type="checkbox"][data-name]');
  checkboxes.forEach((cb) => {
    cb.checked = isInEffective(cb.dataset.name);
  });
}

// --- Render Effective List ---
function renderEffective() {
  const list = $("#effectiveList");
  const empty = $("#emptyState");
  const countLabel = $("#countLabel");

  list.innerHTML = "";

  const count = state.effective.length;
  countLabel.textContent = `${count} item${count === 1 ? "" : "s"}`;
  empty.hidden = count !== 0;

  state.effective.forEach((it) => {
    const li = document.createElement("li");
    li.className = "row";

    const left = document.createElement("div");
    left.className = "row-left";

    const tag = document.createElement("span");
    tag.className = "tag";
    if (it.source === "essential") {
      tag.textContent = it.group ? `Essential • ${it.group}` : "Essential";
    } else {
      tag.textContent = "Custom";
    }

    const name = document.createElement("span");
    name.className = "item-name";
    name.textContent = it.name;

    left.appendChild(tag);
    left.appendChild(name);

    const removeBtn = document.createElement("button");
    removeBtn.type = "button";
    removeBtn.className = "icon-btn";
    removeBtn.textContent = "Remove";
    removeBtn.addEventListener("click", () => removeFromEffectiveById(it.id));

    li.appendChild(left);
    li.appendChild(removeBtn);
    list.appendChild(li);
  });
}

// --- Download ---
function downloadTxt() {
  const lines = [];
  const now = new Date();
  lines.push("Shopping List");
  lines.push(now.toLocaleString());
  lines.push("".padEnd(22, "-"));

  if (state.effective.length === 0) {
    lines.push("(empty)");
  } else {
    // Group essentials by group, then custom
    const essentials = state.effective.filter((x) => x.source === "essential");
    const custom = state.effective.filter((x) => x.source === "custom");

    const byGroup = new Map();
    essentials.forEach((it) => {
      const g = it.group || "Essentials";
      if (!byGroup.has(g)) byGroup.set(g, []);
      byGroup.get(g).push(it.name);
    });

    if (byGroup.size > 0) {
      for (const [g, items] of [...byGroup.entries()].sort((a, b) => a[0].localeCompare(b[0]))) {
        lines.push("");
        lines.push(`[${g}]`);
        items.sort((a, b) => a.localeCompare(b)).forEach((name) => lines.push(`- ${name}`));
      }
    }

    if (custom.length > 0) {
      lines.push("");
      lines.push("[Custom]");
      custom.map((x) => x.name).sort((a, b) => a.localeCompare(b)).forEach((name) => lines.push(`- ${name}`));
    }
  }

  const blob = new Blob([lines.join("\n")], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "shopping-list.txt";
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

// --- Events ---
function init() {
  // Essentials
  renderEssentials("");
  $("#essentialSearch").addEventListener("input", (e) => renderEssentials(e.target.value));

  $("#resetEssentialsBtn").addEventListener("click", () => {
    $("#essentialSearch").value = "";
    renderEssentials("");
  });

  // Effective
  renderEffective();

  $("#addForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const input = $("#addInput");
    const value = normalizeName(input.value);
    if (!value) return;

    addToEffective({ name: value, source: "custom" });
    input.value = "";
    input.focus();
  });

  $("#clearBtn").addEventListener("click", () => {
    // Simple confirmation without blocking UI too much
    const ok = confirm("Clear the entire effective list?");
    if (ok) clearEffective();
  });

  $("#downloadBtn").addEventListener("click", downloadTxt);
}

init();
