import { BucketGroup } from "./BucketGroup";
import { card, errorText, input, primaryButton } from "./uiClasses";

export function BucketsPanel({
  bucketError,
  bucketLoading,
  bucketName,
  buckets,
  canPersistBuckets,
  collapsedGroups,
  essentialSearch,
  isInEffective,
  onAddBucket,
  onChangeBucketName,
  onChangeSearch,
  onDeleteBucket,
  onToggleGroup,
  onToggleItem,
}) {
  return (
    <section className={card}>
      <div className="mb-3 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="m-0 mt-0.5 text-lg font-bold">Home Essentials</h2>
          {!canPersistBuckets ? (
            <p className="m-0 mt-1 text-xs text-[#b7c0d8]/90">
              Le modifiche ai bucket sono disponibili solo in locale finche non fai login.
            </p>
          ) : null}
        </div>
        <div className="flex flex-wrap items-center justify-end gap-2.5">
          <input
            className={input}
            type="search"
            placeholder="Search essentials..."
            aria-label="Search essentials"
            value={essentialSearch}
            onChange={(event) => onChangeSearch(event.target.value)}
          />
        </div>
      </div>

      <form className="mb-3 flex flex-wrap gap-2.5" onSubmit={onAddBucket}>
        <input
          className={`${input} min-w-[180px] flex-1`}
          type="text"
          placeholder="New bucket name"
          value={bucketName}
          onChange={(event) => onChangeBucketName(event.target.value)}
          maxLength={60}
        />
        <button className={primaryButton} type="submit" disabled={bucketLoading}>
          Add bucket
        </button>
      </form>

      {bucketError ? <p className={errorText}>{bucketError}</p> : null}

      <div className="grid gap-2.5">
        {buckets.map((bucket) => (
          <BucketGroup
            bucket={bucket}
            bucketLoading={bucketLoading}
            isCollapsed={Boolean(collapsedGroups[bucket.id])}
            isInEffective={isInEffective}
            key={bucket.id}
            onDeleteBucket={onDeleteBucket}
            onToggleGroup={onToggleGroup}
            onToggleItem={onToggleItem}
          />
        ))}
      </div>
    </section>
  );
}
