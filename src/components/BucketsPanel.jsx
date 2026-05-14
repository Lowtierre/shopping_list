import { BucketGroup } from "./BucketGroup";
import { card, errorText, ghostButton, input, primaryButton } from "./uiClasses";

export function BucketsPanel({
  bucketError,
  bucketLoading,
  bucketName,
  buckets,
  canPersistBuckets,
  collapsedGroups,
  essentialSearch,
  isEditMode,
  isInEffective,
  onAddBucket,
  onAddBucketItem,
  onCancelEdit,
  onChangeBucketName,
  onChangeSearch,
  onDeleteBucket,
  onRemoveBucketItem,
  onRenameBucket,
  onRenameBucketItem,
  onSaveEdit,
  onStartEdit,
  onToggleGroup,
  onToggleItem,
}) {
  return (
    <section className={card}>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
        <div>
          <h2 className="mb-2 text-xl font-bold">Prodotti di base</h2>
          {!canPersistBuckets ? (
            <p className="m-0 mt-1 text-xs text-[#b7c0d8]/90">
              Accedi per modificare le tue categorie private.
            </p>
          ) : isEditMode ? (
            <p className="m-0 mt-1 text-xs text-[#b7c0d8]/90">
              Modalita modifica attiva: la lista della spesa resta ferma finche salvi o annulli.
            </p>
          ) : null}
        </div>
        <div className="flex flex-wrap items-center justify-end gap-2.5">
          {!isEditMode ? (
            <input
              className={input}
              type="search"
              placeholder="Cerca prodotti di base..."
              aria-label="Cerca prodotti di base"
              value={essentialSearch}
              onChange={(event) => onChangeSearch(event.target.value)}
            />
          ) : null}
          {canPersistBuckets && !isEditMode ? (
            <button className={primaryButton} type="button" onClick={onStartEdit}>
              Modifica
            </button>
          ) : null}
          {canPersistBuckets && isEditMode ? (
            <>
              <button className={primaryButton} type="button" onClick={onSaveEdit} disabled={bucketLoading}>
                Salva
              </button>
              <button className={ghostButton} type="button" onClick={onCancelEdit} disabled={bucketLoading}>
                Annulla
              </button>
            </>
          ) : null}
        </div>
      </div>

      {canPersistBuckets && isEditMode ? (
        <form className="mb-3 flex flex-wrap gap-2.5" onSubmit={onAddBucket}>
          <input
            className={`${input} min-w-[180px] flex-1`}
            type="text"
            placeholder="Nome nuova categoria"
            value={bucketName}
            onChange={(event) => onChangeBucketName(event.target.value)}
            maxLength={60}
          />
          <button className={primaryButton} type="submit" disabled={bucketLoading}>
            Aggiungi categoria
          </button>
        </form>
      ) : null}

      {bucketError ? <p className={errorText}>{bucketError}</p> : null}

      <div className="grid gap-4">
        {buckets.map((bucket) => (
          <BucketGroup
            bucket={bucket}
            bucketLoading={bucketLoading}
            isCollapsed={Boolean(collapsedGroups[bucket.id])}
            isEditMode={isEditMode}
            isInEffective={isInEffective}
            key={bucket.id}
            onAddBucketItem={onAddBucketItem}
            onDeleteBucket={onDeleteBucket}
            onRemoveBucketItem={onRemoveBucketItem}
            onRenameBucket={onRenameBucket}
            onRenameBucketItem={onRenameBucketItem}
            onToggleGroup={onToggleGroup}
            onToggleItem={onToggleItem}
          />
        ))}
      </div>
    </section>
  );
}
