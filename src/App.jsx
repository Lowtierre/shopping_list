import { useEffect, useMemo, useState } from "react";
import { AppFooter } from "./components/AppFooter";
import { AppHeader } from "./components/AppHeader";
import { AuthPrompt } from "./components/AuthPrompt";
import { BucketsPanel } from "./components/BucketsPanel";
import { EffectiveListPanel } from "./components/EffectiveListPanel";
import { LoadingOverlay } from "./components/LoadingOverlay";
import { pageWidth } from "./components/uiClasses";
import {
  createBucket,
  deleteBucket,
  getShoppingList,
  getSession,
  isSupabaseConfigured,
  listBuckets,
  login,
  logout,
  saveShoppingList,
  signUp,
  updateBucket,
} from "./api";
import { DEFAULT_BUCKETS, STORAGE_KEY } from "./constants";
import {
  buildShoppingListText,
  createId,
  DEFAULT_QUANTITY,
  DEFAULT_UNIT,
  loadStoredState,
  normalizeEffectiveItem,
  normalizeName,
  sameName,
  sortEffectiveItems,
} from "./lib/listUtils";

const EMPTY_CREDENTIALS = { email: "", password: "" };

export default function App() {
  const [state, setState] = useState(loadStoredState);
  const [session, setSession] = useState(null);
  const [authMode, setAuthMode] = useState("checking");
  const [authView, setAuthView] = useState("login");
  const [essentialSearch, setEssentialSearch] = useState("");
  const [customItem, setCustomItem] = useState("");
  const [bucketName, setBucketName] = useState("");
  const [draftBuckets, setDraftBuckets] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [credentials, setCredentials] = useState(EMPTY_CREDENTIALS);
  const [collapsedGroups, setCollapsedGroups] = useState({});
  const [authLoading, setAuthLoading] = useState(false);
  const [bucketLoading, setBucketLoading] = useState(false);
  const [authError, setAuthError] = useState("");
  const [bucketError, setBucketError] = useState("");
  const [listError, setListError] = useState("");

  const isAuthenticated = authMode === "authenticated" && session?.user;
  const canPersistBuckets = Boolean(isAuthenticated && isSupabaseConfigured);
  const activeBuckets = isEditMode && draftBuckets ? draftBuckets : state.buckets;

  useEffect(() => {
    async function bootstrapAuth() {
      if (!isSupabaseConfigured) {
        setAuthMode("guest");
        return;
      }

      try {
        const currentSession = await getSession();
        if (!currentSession?.user) {
          setAuthMode("guest");
          return;
        }

        setSession(currentSession);
        setAuthMode("authenticated");
        await loadRemoteData(currentSession.user.id);
      } catch (error) {
        setAuthError(error.message || "Impossibile ripristinare la sessione");
        setAuthMode("guest");
      }
    }

    bootstrapAuth();
  }, []);

  function persistLocal(nextState) {
    setState(nextState);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(nextState));
  }

  async function syncShoppingList(effectiveItems, userId = session?.user?.id) {
    if (!isSupabaseConfigured || !userId) return;

    setListError("");
    try {
      await saveShoppingList(effectiveItems, userId);
    } catch (error) {
      setListError(error.message || "Impossibile salvare la lista della spesa");
    }
  }

  function persistShoppingListState(nextState) {
    persistLocal(nextState);
    void syncShoppingList(nextState.effective);
  }

  async function ensureRemoteBuckets(userId) {
    const remoteBuckets = await listBuckets(userId);
    if (remoteBuckets.length > 0) {
      return remoteBuckets;
    }

    return Promise.all(
      DEFAULT_BUCKETS.map((bucket) =>
        createBucket({ name: bucket.group, items: bucket.items }, userId)
      )
    );
  }

  async function loadRemoteData(userId) {
    const [remoteBuckets, remoteShoppingList] = await Promise.all([
      ensureRemoteBuckets(userId),
      getShoppingList(userId),
    ]);
    const nextEffective = remoteShoppingList === null ? state.effective : sortEffectiveItems(remoteShoppingList);

    if (remoteShoppingList === null) {
      await saveShoppingList(nextEffective, userId);
    }

    persistLocal({ ...state, buckets: remoteBuckets, effective: nextEffective });
  }

  const filteredBuckets = useMemo(() => {
    const query = normalizeName(essentialSearch).toLowerCase();
    if (!query) return activeBuckets;

    return activeBuckets.filter(
      (bucket) =>
        bucket.group.toLowerCase().includes(query) ||
        bucket.items.some((item) => item.toLowerCase().includes(query))
    );
  }, [activeBuckets, essentialSearch]);

  function isInEffective(name) {
    return state.effective.some((item) => sameName(item.name, name));
  }

  function addToEffective({ name, source, group }) {
    const normalized = normalizeName(name);
    if (!normalized || isInEffective(normalized)) return;

    const nextEffective = sortEffectiveItems([
      ...state.effective,
      {
        id: createId(),
        name: normalized,
        source,
        group: group || undefined,
        quantity: DEFAULT_QUANTITY,
        unit: DEFAULT_UNIT,
        createdAt: Date.now(),
      },
    ]);

    persistShoppingListState({ ...state, effective: nextEffective });
  }

  function updateEffectiveItem(id, patch) {
    const nextEffective = state.effective.map((item) =>
      item.id === id ? normalizeEffectiveItem({ ...item, ...patch }) : item
    );
    persistShoppingListState({ ...state, effective: nextEffective });
  }

  function removeFromEffectiveByName(name) {
    persistShoppingListState({
      ...state,
      effective: state.effective.filter((item) => !sameName(item.name, name)),
    });
  }

  function removeFromEffectiveById(id) {
    persistShoppingListState({
      ...state,
      effective: state.effective.filter((item) => item.id !== id),
    });
  }

  function clearEffective() {
    persistShoppingListState({ ...state, effective: [] });
  }

  function onEssentialToggle(itemName, itemGroup, checked) {
    if (isEditMode) return;

    if (checked) {
      addToEffective({ name: itemName, source: "essential", group: itemGroup });
      return;
    }

    removeFromEffectiveByName(itemName);
  }

  function downloadTxt() {
    const blob = new Blob([buildShoppingListText(state.effective)], {
      type: "text/plain;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "lista-della-spesa.txt";
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  }

  function toggleGroup(groupId) {
    setCollapsedGroups((prev) => ({ ...prev, [groupId]: !prev[groupId] }));
  }

  function updateCredential(field, value) {
    setCredentials((prev) => ({ ...prev, [field]: value }));
  }

  async function handleAuthSubmit(event, mode) {
    event.preventDefault();
    setAuthError("");
    setAuthLoading(true);

    try {
      const nextSession = mode === "signup" ? await signUp(credentials) : await login(credentials);
      if (!nextSession?.user) {
        setAuthError("Controlla la tua email per confermare l'account, poi accedi.");
        return;
      }

      setSession(nextSession);
      setAuthMode("authenticated");
      await loadRemoteData(nextSession.user.id);
    } catch (error) {
      setAuthError(error.message || "Errore di autenticazione");
    } finally {
      setAuthLoading(false);
    }
  }

  async function handleLogout() {
    setAuthError("");

    try {
      await logout();
    } catch (error) {
      setAuthError(error.message || "Errore durante l'uscita");
    } finally {
      setSession(null);
      setAuthMode("guest");
      setAuthView("login");
      setDraftBuckets(null);
      setIsEditMode(false);
      persistLocal({ ...state, buckets: DEFAULT_BUCKETS });
    }
  }

  function openAuthPrompt(nextView = "login") {
    setAuthError("");
    setAuthView(nextView);
    setAuthMode("prompt");
  }

  function closeAuthPrompt() {
    setAuthError("");
    setAuthMode(session?.user ? "authenticated" : "guest");
  }

  async function handleAddBucket(event) {
    event.preventDefault();
    if (!canPersistBuckets || !isEditMode) return;

    const normalized = normalizeName(bucketName);
    if (!normalized) return;

    setBucketError("");
    setDraftBuckets((current) => [
      ...(current || []),
      {
        id: `draft-${createId()}`,
        group: normalized,
        items: [],
      },
    ]);
    setBucketName("");
  }

  function handleStartEdit() {
    if (!canPersistBuckets) return;

    setBucketError("");
    setBucketName("");
    setDraftBuckets(state.buckets.map((bucket) => ({ ...bucket, items: [...bucket.items] })));
    setIsEditMode(true);
  }

  function handleCancelEdit() {
    setBucketError("");
    setBucketName("");
    setDraftBuckets(null);
    setIsEditMode(false);
  }

  function renameDraftBucket(bucketId, nextName) {
    setDraftBuckets((current) =>
      (current || []).map((bucket) => (bucket.id === bucketId ? { ...bucket, group: nextName } : bucket))
    );
  }

  function addDraftBucketItem(bucketId, name) {
    const normalized = normalizeName(name);
    if (!normalized) return;

    setDraftBuckets((current) =>
      (current || []).map((bucket) => {
        if (bucket.id !== bucketId || bucket.items.some((item) => sameName(item, normalized))) {
          return bucket;
        }

        return { ...bucket, items: [...bucket.items, normalized] };
      })
    );
  }

  function renameDraftBucketItem(bucketId, index, nextName) {
    setDraftBuckets((current) =>
      (current || []).map((bucket) => {
        if (bucket.id !== bucketId) return bucket;

        return {
          ...bucket,
          items: bucket.items.map((item, itemIndex) => (itemIndex === index ? nextName : item)),
        };
      })
    );
  }

  function removeDraftBucketItem(bucketId, index) {
    setDraftBuckets((current) =>
      (current || []).map((bucket) =>
        bucket.id === bucketId
          ? { ...bucket, items: bucket.items.filter((_, itemIndex) => itemIndex !== index) }
          : bucket
      )
    );
  }

  function handleDeleteBucket(bucket) {
    if (!isEditMode) return;

    const confirmed = window.confirm(`Eliminare il bucket "${bucket.group}" dalla bozza?`);
    if (!confirmed) return;

    setDraftBuckets((current) => (current || []).filter((item) => item.id !== bucket.id));
  }

  function reconcileEffectiveItems(nextBuckets) {
    const previousBucketsById = new Map(state.buckets.map((bucket) => [bucket.id, bucket]));
    const nextBucketsById = new Map(nextBuckets.filter((bucket) => !bucket.id.startsWith("draft-")).map((bucket) => [bucket.id, bucket]));
    const nameChanges = new Map();
    const removedItems = [];
    const renamedGroups = new Map();

    state.buckets.forEach((previousBucket) => {
      const nextBucket = nextBucketsById.get(previousBucket.id);
      if (!nextBucket) {
        previousBucket.items.forEach((item) => removedItems.push({ name: item, group: previousBucket.group }));
        return;
      }

      if (!sameName(previousBucket.group, nextBucket.group)) {
        renamedGroups.set(previousBucket.group, nextBucket.group);
      }

      previousBucket.items.forEach((previousItem, index) => {
        if (nextBucket.items.some((nextItem) => sameName(nextItem, previousItem))) return;

        const nextItemAtSameIndex = nextBucket.items[index];
        const looksLikeRename =
          nextItemAtSameIndex &&
          !previousBucket.items.some((item) => sameName(item, nextItemAtSameIndex));

        if (looksLikeRename) {
          nameChanges.set(`${previousBucket.id}:${normalizeName(previousItem).toLowerCase()}`, {
            from: previousItem,
            to: normalizeName(nextItemAtSameIndex),
            group: nextBucket.group,
          });
          return;
        }

        removedItems.push({ name: previousItem, group: previousBucket.group });
      });
    });

    const affected = [];
    const nextEffective = state.effective
      .map((item) => {
        if (item.source !== "essential") return item;

        const previousBucket = [...previousBucketsById.values()].find((bucket) => sameName(bucket.group, item.group || ""));
        const changeKey = previousBucket
          ? `${previousBucket.id}:${normalizeName(item.name).toLowerCase()}`
          : null;
        const itemChange = changeKey ? nameChanges.get(changeKey) : null;

        if (itemChange) {
          affected.push(`${item.name} -> ${itemChange.to}`);
          return { ...item, name: itemChange.to, group: itemChange.group };
        }

        const removed = removedItems.some((removedItem) => sameName(removedItem.name, item.name) && sameName(removedItem.group, item.group || ""));
        if (removed) {
          affected.push(`${item.name} rimosso dalla lista`);
          return null;
        }

        const renamedGroup = item.group ? renamedGroups.get(item.group) : null;
        return renamedGroup ? { ...item, group: renamedGroup } : item;
      })
      .filter(Boolean);

    return { affected, nextEffective: sortEffectiveItems(nextEffective) };
  }

  async function handleSaveEdit() {
    if (!canPersistBuckets || !isEditMode || !draftBuckets) return;

    const cleanedBuckets = draftBuckets
      .map((bucket) => ({
        ...bucket,
        group: normalizeName(bucket.group),
        items: bucket.items.map(normalizeName).filter(Boolean),
      }))
      .filter((bucket) => bucket.group);

    const { affected, nextEffective } = reconcileEffectiveItems(cleanedBuckets);
    if (affected.length > 0) {
      const preview = affected.slice(0, 8).join("\n- ");
      const suffix = affected.length > 8 ? `\n...e altre ${affected.length - 8} modifiche` : "";
      const confirmed = window.confirm(
        `Alcuni oggetti gia presenti nella lista della spesa cambieranno:\n- ${preview}${suffix}\n\nVuoi applicare queste modifiche anche alla lista?`
      );
      if (!confirmed) return;
    }

    setBucketError("");
    setBucketLoading(true);

    try {
      const deletedBuckets = state.buckets.filter(
        (bucket) => !cleanedBuckets.some((nextBucket) => nextBucket.id === bucket.id)
      );
      await Promise.all(deletedBuckets.map((bucket) => deleteBucket(bucket.id, session.user.id)));

      const savedBuckets = await Promise.all(
        cleanedBuckets.map((bucket) => {
          const payload = { name: bucket.group, items: bucket.items };
          if (bucket.id.startsWith("draft-")) {
            return createBucket(payload, session.user.id);
          }

          return updateBucket(bucket.id, payload, session.user.id);
        })
      );

      persistLocal({ ...state, buckets: savedBuckets, effective: nextEffective });
      void syncShoppingList(nextEffective, session.user.id);
      setDraftBuckets(null);
      setIsEditMode(false);
      setBucketName("");
    } catch (error) {
      setBucketError(error.message || "Impossibile salvare le modifiche ai bucket");
    } finally {
      setBucketLoading(false);
    }
  }

  function handleAddCustomItem(event) {
    event.preventDefault();
    const normalized = normalizeName(customItem);
    if (!normalized) return;

    addToEffective({ name: normalized, source: "custom" });
    setCustomItem("");
  }

  return (
    <>
      {authMode === "checking" ? <LoadingOverlay /> : null}

      {authMode === "prompt" ? (
        <AuthPrompt
          authView={authView}
          authError={authError}
          authLoading={authLoading}
          credentials={credentials}
          isSupabaseConfigured={isSupabaseConfigured}
          onChangeAuthView={(nextView) => {
            setAuthError("");
            setCredentials(EMPTY_CREDENTIALS);
            setAuthView(nextView);
          }}
          onChangeCredentials={updateCredential}
          onClose={closeAuthPrompt}
          onSubmit={handleAuthSubmit}
        />
      ) : null}

      <AppHeader
        canPersistBuckets={canPersistBuckets}
        isAuthenticated={isAuthenticated}
        onLogin={() => openAuthPrompt("login")}
        onLogout={handleLogout}
        onSignup={() => openAuthPrompt("signup")}
        userEmail={session?.user?.email}
      />

      <main className={`${pageWidth} grid grid-cols-1 gap-4 py-[18px] pb-[26px] min-[920px]:grid-cols-[1.05fr_0.95fr]`}>
        <BucketsPanel
          bucketError={bucketError}
          bucketLoading={bucketLoading}
          bucketName={bucketName}
          buckets={filteredBuckets}
          canPersistBuckets={canPersistBuckets}
          collapsedGroups={collapsedGroups}
          essentialSearch={essentialSearch}
          isEditMode={isEditMode}
          isInEffective={isInEffective}
          onAddBucket={handleAddBucket}
          onAddBucketItem={addDraftBucketItem}
          onCancelEdit={handleCancelEdit}
          onChangeBucketName={setBucketName}
          onChangeSearch={setEssentialSearch}
          onDeleteBucket={handleDeleteBucket}
          onRemoveBucketItem={removeDraftBucketItem}
          onRenameBucket={renameDraftBucket}
          onRenameBucketItem={renameDraftBucketItem}
          onSaveEdit={handleSaveEdit}
          onStartEdit={handleStartEdit}
          onToggleGroup={toggleGroup}
          onToggleItem={onEssentialToggle}
        />

        <EffectiveListPanel
          customItem={customItem}
          effectiveItems={state.effective}
          listError={listError}
          onAddCustomItem={handleAddCustomItem}
          onChangeCustomItem={setCustomItem}
          onClear={clearEffective}
          onDownload={downloadTxt}
          onRemoveItem={removeFromEffectiveById}
          onUpdateItem={updateEffectiveItem}
        />
      </main>

      <AppFooter />
    </>
  );
}
