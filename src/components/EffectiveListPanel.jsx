import { card, dangerButton, input, pill, primaryButton } from "./uiClasses";

export function EffectiveListPanel({
  customItem,
  effectiveItems,
  onAddCustomItem,
  onChangeCustomItem,
  onClear,
  onDownload,
  onRemoveItem,
}) {
  return (
    <section className={card}>
      <div className="mb-3 flex flex-wrap items-start justify-between gap-3">
        <h2 className="m-0 mt-0.5 text-lg font-bold">Effective List</h2>
        <div className="flex flex-wrap items-center justify-end gap-2.5">
          <button id="downloadBtn" className={primaryButton} type="button" onClick={onDownload}>
            Download .txt
          </button>
          <button id="clearBtn" className={dangerButton} type="button" onClick={onClear}>
            Clear
          </button>
        </div>
      </div>

      <form className="mt-1.5 flex flex-wrap gap-2.5" autoComplete="off" onSubmit={onAddCustomItem}>
        <input
          className={`${input} min-w-0 flex-1`}
          type="text"
          placeholder="Add an item (e.g., coffee)"
          aria-label="Add an item"
          maxLength={60}
          value={customItem}
          onChange={(event) => onChangeCustomItem(event.target.value)}
        />
        <button className={primaryButton} type="submit">
          Add
        </button>
      </form>

      <div className="my-3 mb-2 flex flex-wrap items-center justify-between gap-3">
        <span className={pill}>
          {effectiveItems.length} item{effectiveItems.length === 1 ? "" : "s"}
        </span>
        <span className="text-xs text-[#b7c0d8]/90">Tip: click an essential checkbox to add/remove it.</span>
      </div>

      <ul className="m-0 grid list-none gap-2 p-0" aria-label="Effective shopping list">
        {effectiveItems.map((item) => (
          <li
            className="flex items-center justify-between gap-2.5 rounded-[14px] border border-white/10 bg-white/[0.03] px-3 py-2.5"
            key={item.id}
          >
            <div className="flex min-w-0 max-w-full items-center gap-2.5 overflow-hidden">
              <span className="whitespace-nowrap rounded-full border border-white/10 bg-white/[0.03] px-2 py-[3px] text-[11px] text-[#eef2ff]/70">
                {item.source === "essential" ? item.group || "Essential" : "Custom"}
              </span>
              <span className="overflow-hidden text-ellipsis whitespace-nowrap">{item.name}</span>
            </div>
            <button
              className="cursor-pointer rounded-xl border border-white/10 bg-white/[0.03] px-2.5 py-2 text-[#eef2ff] hover:bg-white/[0.05]"
              type="button"
              onClick={() => onRemoveItem(item.id)}
            >
              Remove
            </button>
          </li>
        ))}
      </ul>

      {effectiveItems.length === 0 ? (
        <p className="m-0 mt-3 rounded-[14px] border border-dashed border-white/10 bg-white/[0.02] p-3 text-[#b7c0d8]">
          Your effective list is empty. Add items from essentials or type your own.
        </p>
      ) : null}
    </section>
  );
}
