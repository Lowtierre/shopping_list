import { useState } from "react";
import { dangerButton, input, primaryButton, pill } from "./uiClasses";

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

  function submitItem(event) {
    event.preventDefault();
    onAddBucketItem(bucket.id, newItemName);
    setNewItemName("");
  }

  return (
    <div className="overflow-hidden rounded-[14px] border border-white/10">
      <div className="flex w-full items-center justify-between gap-2.5 border-0 border-b border-white/10 bg-white/[0.03] px-3 py-2.5 text-left text-[#eef2ff]">
        {isEditMode ? (
          <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2.5">
            <input
              className={`${input} min-w-[160px] flex-1`}
              type="text"
              value={bucket.group}
              maxLength={60}
              aria-label={`Rename ${bucket.group}`}
              onChange={(event) => onRenameBucket(bucket.id, event.target.value)}
            />
            <span className={pill}>{bucket.items.length} items</span>
          </div>
        ) : (
          <button
            type="button"
            className="flex min-w-0 flex-1 cursor-pointer items-center justify-between gap-2.5 border-0 bg-transparent p-0 text-left text-[#eef2ff]"
            aria-expanded={!isCollapsed}
            onClick={() => onToggleGroup(bucket.id)}
          >
            <div className="flex min-w-0 flex-wrap items-center gap-2.5">
              <strong className="min-w-0 overflow-hidden text-ellipsis whitespace-nowrap text-sm">
                {bucket.group}
              </strong>
              <span className={pill}>{bucket.items.length} items</span>
            </div>
            <span className={`opacity-85 transition-transform duration-150 ${isCollapsed ? "-rotate-90" : ""}`}>
              v
            </span>
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
                aria-label={`Rename ${name}`}
                onChange={(event) => onRenameBucketItem(bucket.id, index, event.target.value)}
              />
              <button
                className={dangerButton}
                type="button"
                onClick={() => onRemoveBucketItem(bucket.id, index)}
                disabled={bucketLoading}
              >
                Rimuovi
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
          <button
            className={dangerButton}
            type="button"
            onClick={() => onDeleteBucket(bucket)}
            disabled={bucketLoading}
          >
            Elimina bucket
          </button>
        </div>
      ) : null}
    </div>
  );
}
