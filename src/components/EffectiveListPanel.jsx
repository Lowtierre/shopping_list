import { useState } from "react";
import { ChevronDown, Download, Minus, Plus, Trash2 } from "lucide-react";
import { UNIT_OPTIONS } from "../lib/listUtils";
import { card, dangerButton, errorText, input, primaryButton } from "./uiClasses";

export function EffectiveListPanel({
  customItem,
  effectiveItems,
  listError,
  onAddCustomItem,
  onChangeCustomItem,
  onClear,
  onDownload,
  onRemoveItem,
  onUpdateItem,
}) {
  const [openUnitMenuId, setOpenUnitMenuId] = useState(null);

  function stepQuantity(item, direction) {
    const currentQuantity = Number.parseInt(item.quantity, 10) || 1;
    const nextQuantity = Math.max(1, currentQuantity + direction);
    onUpdateItem(item.id, { quantity: nextQuantity });
  }

  function selectUnit(item, unit) {
    onUpdateItem(item.id, { unit });
    setOpenUnitMenuId(null);
  }

  return (
    <section className={card}>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
        <h2 className="mb-2 text-xl font-bold">Lista della spesa</h2>
        <div className="flex flex-wrap items-center justify-end gap-2.5">
          <button
            id="downloadBtn"
            className="grid h-10 w-10 cursor-pointer place-items-center rounded-xl border border-[#7aa2ff]/45 bg-[#7aa2ff]/[0.18] text-[#eef2ff] transition hover:border-[#7aa2ff]/70 hover:bg-[#7aa2ff]/[0.24] active:translate-y-px"
            type="button"
            onClick={onDownload}
            aria-label="Scarica PDF"
            title="Scarica PDF"
          >
            <Download aria-hidden="true" size={18} strokeWidth={2.2} />
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
          placeholder="Aggiungi un elemento fuori categoria"
          aria-label="Aggiungi un elemento fuori categoria"
          maxLength={60}
          value={customItem}
          onChange={(event) => onChangeCustomItem(event.target.value)}
        />
        <button className={`${primaryButton} grid h-11 w-11 place-items-center px-0 py-0`} type="submit" aria-label="Aggiungi">
          <Plus aria-hidden="true" size={19} strokeWidth={2.4} />
        </button>
      </form>

      <ul className="grid gap-2 p-0 m-0 list-none" aria-label="Lista della spesa">
        {effectiveItems.map((item) => (
          <li
            className="grid gap-2.5 rounded-[14px] border border-white/10 bg-white/[0.03] px-3 py-2.5 min-[620px]:grid-cols-[minmax(0,1fr)_72px_104px_42px] min-[620px]:items-center"
            key={item.id}
          >
            <span className="overflow-hidden text-ellipsis whitespace-nowrap">{item.name}</span>
            <div className="grid h-9 grid-cols-[minmax(0,1fr)_24px] overflow-hidden rounded-xl border border-white/10 bg-white/[0.04]">
              <input
                className="quantity-input min-w-0 bg-transparent px-2.5 py-1.5 text-[#eef2ff] outline-none disabled:cursor-not-allowed disabled:opacity-60"
                type="number"
                min="1"
                value={item.quantity}
                onChange={(event) => onUpdateItem(item.id, { quantity: event.target.value })}
                aria-label={`Quantita ${item.name}`}
              />
              <div className="grid border-l border-white/10">
                <button
                  className="grid cursor-pointer place-items-center text-[#eef2ff]/80 transition hover:bg-white/[0.07] hover:text-[#eef2ff]"
                  type="button"
                  onClick={() => stepQuantity(item, 1)}
                  aria-label={`Aumenta quantita ${item.name}`}
                >
                  <Plus aria-hidden="true" size={12} strokeWidth={2.4} />
                </button>
                <button
                  className="grid cursor-pointer place-items-center border-t border-white/10 text-[#eef2ff]/80 transition hover:bg-white/[0.07] hover:text-[#eef2ff]"
                  type="button"
                  onClick={() => stepQuantity(item, -1)}
                  aria-label={`Diminuisci quantita ${item.name}`}
                >
                  <Minus aria-hidden="true" size={12} strokeWidth={2.4} />
                </button>
              </div>
            </div>
            <div
              className="relative"
              onBlur={(event) => {
                if (!event.currentTarget.contains(event.relatedTarget)) {
                  setOpenUnitMenuId(null);
                }
              }}
            >
              <button
                className={`${input} flex h-9 w-full items-center justify-between gap-2 px-2.5 pb-2 pt-1 text-left`}
                type="button"
                onClick={() => setOpenUnitMenuId((current) => (current === item.id ? null : item.id))}
                aria-haspopup="listbox"
                aria-expanded={openUnitMenuId === item.id}
                aria-label={`Unita di misura ${item.name}`}
              >
                <span className="overflow-hidden text-ellipsis whitespace-nowrap">{item.unit}</span>
                <ChevronDown
                  aria-hidden="true"
                  className={`shrink-0 transition-transform duration-150 ${
                    openUnitMenuId === item.id ? "rotate-180" : ""
                  }`}
                  size={15}
                  strokeWidth={2.2}
                />
              </button>
              {openUnitMenuId === item.id ? (
                <div
                  className="absolute right-0 z-20 mt-1 grid w-full min-w-[112px] overflow-hidden rounded-xl border border-white/10 bg-[#121620] p-1 shadow-[0_12px_28px_rgba(0,0,0,0.38)]"
                  role="listbox"
                >
                  {UNIT_OPTIONS.map((unit) => (
                    <button
                      className={`cursor-pointer rounded-lg px-2.5 py-2 text-left text-sm transition hover:bg-white/[0.07] ${
                        item.unit === unit ? "bg-[#7aa2ff]/[0.18] text-[#eef2ff]" : "text-[#b7c0d8]"
                      }`}
                      type="button"
                      role="option"
                      aria-selected={item.unit === unit}
                      onClick={() => selectUnit(item, unit)}
                      key={unit}
                    >
                      {unit}
                    </button>
                  ))}
                </div>
              ) : null}
            </div>
            <button
              className="grid h-10 w-full cursor-pointer place-items-center rounded-xl border border-white/10 bg-white/[0.03] px-2.5 py-2 text-[#eef2ff] hover:bg-white/[0.05] min-[620px]:w-10"
              type="button"
              onClick={() => onRemoveItem(item.id)}
              aria-label={`Rimuovi ${item.name}`}
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
