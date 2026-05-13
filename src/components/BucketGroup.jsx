import { dangerButton, pill } from "./uiClasses";

export function BucketGroup({
  bucket,
  bucketLoading,
  isCollapsed,
  isInEffective,
  onDeleteBucket,
  onToggleGroup,
  onToggleItem,
}) {
  return (
    <div className="overflow-hidden rounded-[14px] border border-white/10">
      <button
        type="button"
        className="flex w-full cursor-pointer items-center justify-between gap-2.5 border-0 border-b border-white/10 bg-white/[0.03] px-3 py-2.5 text-left text-[#eef2ff]"
        aria-expanded={!isCollapsed}
        onClick={() => onToggleGroup(bucket.id)}
      >
        <div className="flex flex-wrap items-center gap-2.5">
          <strong className="text-sm">{bucket.group}</strong>
          <span className={pill}>{bucket.items.length} items</span>
        </div>
        <span className={`opacity-85 transition-transform duration-150 ${isCollapsed ? "-rotate-90" : ""}`}>
          v
        </span>
      </button>

      <div
        className={`grid grid-cols-1 gap-1.5 px-3 pt-2.5 min-[540px]:grid-cols-2 ${
          isCollapsed ? "hidden" : ""
        }`}
      >
        {bucket.items.map((name) => {
          const id = `ess-${bucket.id}-${name}`.replace(/[^a-z0-9_-]/gi, "_");
          return (
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
                onChange={(event) => onToggleItem(name, bucket.group, event.currentTarget.checked)}
              />
              <span>{name}</span>
            </label>
          );
        })}
      </div>

      <div className="px-3 pb-3 pt-2.5">
        <button
          className={dangerButton}
          type="button"
          onClick={() => onDeleteBucket(bucket)}
          disabled={bucketLoading}
        >
          Delete bucket
        </button>
      </div>
    </div>
  );
}
