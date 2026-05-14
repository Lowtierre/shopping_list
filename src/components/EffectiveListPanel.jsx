import { Trash2 } from "lucide-react";
import { card, dangerButton, errorText, input, pill, primaryButton } from "./uiClasses";

export function EffectiveListPanel({
  customItem,
  effectiveItems,
  listError,
  onAddCustomItem,
  onChangeCustomItem,
  onClear,
  onDownload,
  onRemoveItem,
}) {
  return (
    <section className={card}>
      <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
        <h2 className="m-0 mt-0.5 text-lg font-bold">Lista della spesa</h2>
        <div className="flex flex-wrap items-center justify-end gap-2.5">
          <button id="downloadBtn" className={primaryButton} type="button" onClick={onDownload}>
            Scarica .txt
          </button>
          <button id="clearBtn" className={dangerButton} type="button" onClick={onClear}>
            Svuota
          </button>
        </div>
      </div>

      <form className="mt-1.5 mb-4 flex flex-wrap gap-2.5" autoComplete="off" onSubmit={onAddCustomItem}>
        <input
          className={`${input} min-w-0 flex-1`}
          type="text"
          placeholder="Aggiungi un elemento (es. caffe)"
          aria-label="Aggiungi un elemento"
          maxLength={60}
          value={customItem}
          onChange={(event) => onChangeCustomItem(event.target.value)}
        />
        <button className={primaryButton} type="submit">
          Aggiungi
        </button>
      </form>

      <ul className="grid gap-2 p-0 m-0 list-none" aria-label="Lista della spesa">
        {effectiveItems.map((item) => (
          <li
            className="flex items-center justify-between gap-2.5 rounded-[14px] border border-white/10 bg-white/[0.03] px-3 py-2.5"
            key={item.id}
          >
            <div className="flex min-w-0 max-w-full items-center gap-2.5 overflow-hidden">
              <span className="whitespace-nowrap rounded-full border border-white/10 bg-white/[0.03] px-2 py-[3px] text-[11px] text-[#eef2ff]/70">
                {item.source === "essential" ? item.group || "Base" : "Personalizzato"}
              </span>
              <span className="overflow-hidden text-ellipsis whitespace-nowrap">{item.name}</span>
            </div>
            <button
              className="cursor-pointer rounded-xl border border-white/10 bg-white/[0.03] px-2.5 py-2 text-[#eef2ff] hover:bg-white/[0.05]"
              type="button"
              onClick={() => onRemoveItem(item.id)}
            >
                <Trash2 aria-hidden="true" size={17} strokeWidth={2.2} />
            </button>
          </li>
        ))}
      </ul>

      {effectiveItems.length === 0 ? (
        <p className="m-0 mt-3 rounded-[14px] border border-dashed border-white/10 bg-white/[0.02] p-3 text-[#b7c0d8]">
          La lista della spesa è vuota. Aggiungi elementi dai prodotti di base o scrivili tu.
        </p>
      ) : null}

      {listError ? <p className={errorText}>{listError}</p> : null}
    </section>
  );
}
