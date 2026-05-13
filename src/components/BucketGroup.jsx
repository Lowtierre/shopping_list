import { useState } from "react";
import { Minus, Plus, Trash2 } from "lucide-react";
import { dangerButton, input, primaryButton } from "./uiClasses";

export function BucketGroup({
  bucket,
  bucketLoading,
  isCollapsed,
  isEditMode,
  isInEffective,
  onAddBucketItem,
  onDeleteBucket,
  onRemoveBucketItem,
  onRenameBucket,
  onRenameBucketItem,
  onToggleGroup,
  onToggleItem,
}) {
  const [newItemName, setNewItemName] = useState("");
  const CollapseIcon = isCollapsed ? Plus : Minus;
  const countLabel = `${bucket.items.length} element${bucket.items.length === 1 ? "o" : "i"}`;
  const countPill =
    "inline-flex items-center rounded-full border border-[#7aa2ff]/20 bg-[#7aa2ff]/[0.08] px-2 py-1 text-[11px] font-medium leading-none text-[#d9e3ff]";

  function submitItem(event) {
    event.preventDefault();
    onAddBucketItem(bucket.id, newItemName);
    setNewItemName("");
  }

  return (
    <div className="overflow-hidden rounded-[14px] border border-white/10">
      <div className="flex w-full items-center justify-between gap-2.5 border-0 border-b border-[#7aa2ff]/20 bg-[#25304a] px-3 py-3 text-left text-[#eef2ff] shadow-[inset_0_-1px_0_rgba(255,255,255,0.04)]">
        {isEditMode ? (
          <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2.5">
            <input
              className={`${input} min-w-[160px] flex-1`}
              type="text"
              value={bucket.group}
              maxLength={60}
              aria-label={`Rinomina ${bucket.group}`}
              onChange={(event) => onRenameBucket(bucket.id, event.target.value)}
            />
            <button
              className={dangerButton}
              type="button"
              onClick={() => onDeleteBucket(bucket)}
              disabled={bucketLoading}
            >
                <Trash2 aria-hidden="true" size={17} strokeWidth={2.2} />
            </button>
            <button
              type="button"
              className="ml-auto inline-flex h-10 w-10 cursor-pointer items-center justify-center rounded-xl border border-white/15 bg-white/[0.08] text-[#eef2ff] hover:bg-white/[0.12]"
              aria-expanded={!isCollapsed}
              aria-label={`${isCollapsed ? "Apri" : "Chiudi"} ${bucket.group}`}
              onClick={() => onToggleGroup(bucket.id)}
            >
              <CollapseIcon aria-hidden="true" size={18} strokeWidth={2.2} />
            </button>
          </div>
        ) : (
          <button
            type="button"
            className="flex min-w-0 flex-1 cursor-pointer items-center justify-between gap-2.5 border-0 bg-transparent p-0 text-left text-[#eef2ff]"
            aria-expanded={!isCollapsed}
            onClick={() => onToggleGroup(bucket.id)}
          >
            <div className="flex min-w-0 flex-wrap items-center gap-2.5">
              <strong className="min-w-0 overflow-hidden text-sm text-ellipsis whitespace-nowrap">
                {bucket.group}
              </strong>
              <span className={countPill}>{countLabel}</span>
            </div>
            <CollapseIcon aria-hidden="true" size={18} strokeWidth={2.2} />
          </button>
        )}
      </div>

      <div
        className={`grid grid-cols-1 gap-1.5 px-3 pt-2.5 min-[540px]:grid-cols-2 ${
          isCollapsed ? "hidden" : ""
        }`}
      >
        {bucket.items.map((name, index) => {
          const id = `ess-${bucket.id}-${name}`.replace(/[^a-z0-9_-]/gi, "_");
          return isEditMode ? (
            <div
              className="flex items-center gap-2.5 rounded-xl border border-white/10 bg-white/[0.02] px-2.5 py-2"
              key={`${id}-${index}`}
            >
              <input
                className={`${input} min-w-0 flex-1`}
                type="text"
                value={name}
                maxLength={60}
                aria-label={`Rinomina ${name}`}
                onChange={(event) => onRenameBucketItem(bucket.id, index, event.target.value)}
              />
              <button
                className="inline-flex h-10 w-10 cursor-pointer items-center justify-center rounded-xl border border-[#ff5c7a]/55 bg-[#ff5c7a]/[0.12] text-[#eef2ff] transition active:translate-y-px hover:border-[#ff5c7a]/75 hover:bg-[#ff5c7a]/[0.16] disabled:cursor-not-allowed disabled:opacity-60"
                type="button"
                onClick={() => onRemoveBucketItem(bucket.id, index)}
                disabled={bucketLoading}
                aria-label={`Rimuovi ${name}`}
              >
                <Trash2 aria-hidden="true" size={17} strokeWidth={2.2} />
              </button>
            </div>
          ) : (
            <label
              className="flex items-center gap-2.5 rounded-xl border border-transparent bg-white/[0.02] px-2.5 py-2 hover:border-white/10 hover:bg-white/[0.03]"
              key={id}
              htmlFor={id}
            >
              <input
                className="h-[18px] w-[18px] accent-[#7aa2ff]"
                id={id}
                type="checkbox"
                checked={isInEffective(name)}
                disabled={isEditMode}
                onChange={(event) => onToggleItem(name, bucket.group, event.currentTarget.checked)}
              />
              <span>{name}</span>
            </label>
          );
        })}
      </div>

      {isEditMode ? (
        <div className="flex flex-wrap gap-2.5 px-3 pb-3 pt-2.5">
          <form className="flex min-w-[220px] flex-1 flex-wrap gap-2.5" onSubmit={submitItem}>
            <input
              className={`${input} min-w-0 flex-1`}
              type="text"
              placeholder="Nuovo oggetto"
              value={newItemName}
              maxLength={60}
              onChange={(event) => setNewItemName(event.target.value)}
            />
            <button className={primaryButton} type="submit" disabled={bucketLoading}>
              Aggiungi
            </button>
          </form>
        </div>
      ) : null}
    </div>
  );
}
