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
  getSession,
  isSupabaseConfigured,
  listBuckets,
  login,
  logout,
  signUp,
} from "./api";
import { DEFAULT_BUCKETS, STORAGE_KEY } from "./constants";
import {
  buildShoppingListText,
  createId,
  createLocalBucket,
  loadStoredState,
  normalizeName,
  sameName,
  sortEffectiveItems,
} from "./lib/listUtils";

export default function App() {
  const [state, setState] = useState(loadStoredState);
  const [session, setSession] = useState(null);
  const [authMode, setAuthMode] = useState("checking");
  const [essentialSearch, setEssentialSearch] = useState("");
  const [customItem, setCustomItem] = useState("");
  const [bucketName, setBucketName] = useState("");
  const [credentials, setCredentials] = useState({ email: "", password: "" });
  const [collapsedGroups, setCollapsedGroups] = useState({});
  const [authLoading, setAuthLoading] = useState(false);
  const [bucketLoading, setBucketLoading] = useState(false);
  const [authError, setAuthError] = useState("");
  const [bucketError, setBucketError] = useState("");

  const isAuthenticated = authMode === "authenticated" && session?.user;
  const canPersistBuckets = Boolean(isAuthenticated && isSupabaseConfigured);

  useEffect(() => {
    async function bootstrapAuth() {
      if (!isSupabaseConfigured) {
        setAuthMode("prompt");
        return;
      }

      try {
        const currentSession = await getSession();
        if (!currentSession?.user) {
          setAuthMode("prompt");
          return;
        }

        setSession(currentSession);
        setAuthMode("authenticated");
        await loadRemoteBuckets(currentSession.user.id);
      } catch (error) {
        setAuthError(error.message || "Cannot restore session");
        setAuthMode("prompt");
      }
    }

    bootstrapAuth();
  }, []);

  function persist(nextState) {
    setState(nextState);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(nextState));
  }

  async function loadRemoteBuckets(userId) {
    const remoteBuckets = await listBuckets(userId);
    if (remoteBuckets.length > 0) {
      persist({ ...state, buckets: remoteBuckets });
      return;
    }

    const seededBuckets = await Promise.all(
      DEFAULT_BUCKETS.map((bucket) =>
        createBucket({ name: bucket.group, items: bucket.items }, userId)
      )
    );
    persist({ ...state, buckets: seededBuckets });
  }

  const filteredBuckets = useMemo(() => {
    const query = normalizeName(essentialSearch).toLowerCase();
    if (!query) return state.buckets;

    return state.buckets.filter(
      (bucket) =>
        bucket.group.toLowerCase().includes(query) ||
        bucket.items.some((item) => item.toLowerCase().includes(query))
    );
  }, [essentialSearch, state.buckets]);

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
        createdAt: Date.now(),
      },
    ]);

    persist({ ...state, effective: nextEffective });
  }

  function removeFromEffectiveByName(name) {
    persist({
      ...state,
      effective: state.effective.filter((item) => !sameName(item.name, name)),
    });
  }

  function removeFromEffectiveById(id) {
    persist({
      ...state,
      effective: state.effective.filter((item) => item.id !== id),
    });
  }

  function clearEffective() {
    persist({ ...state, effective: [] });
  }

  function onEssentialToggle(itemName, itemGroup, checked) {
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
    link.download = "shopping-list.txt";
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
        setAuthError("Check your email to confirm the account, then sign in.");
        return;
      }

      setSession(nextSession);
      setAuthMode("authenticated");
      await loadRemoteBuckets(nextSession.user.id);
    } catch (error) {
      setAuthError(error.message || "Authentication error");
    } finally {
      setAuthLoading(false);
    }
  }

  async function handleLogout() {
    setAuthError("");

    try {
      await logout();
    } catch (error) {
      setAuthError(error.message || "Logout error");
    } finally {
      setSession(null);
      setAuthMode("prompt");
      persist({ ...state, buckets: DEFAULT_BUCKETS });
    }
  }

  async function handleAddBucket(event) {
    event.preventDefault();
    const normalized = normalizeName(bucketName);
    if (!normalized) return;

    setBucketError("");
    setBucketLoading(true);

    try {
      const nextBucket = canPersistBuckets
        ? await createBucket({ name: normalized, items: [] }, session.user.id)
        : createLocalBucket(normalized);

      persist({ ...state, buckets: [...state.buckets, nextBucket] });
      setBucketName("");
    } catch (error) {
      setBucketError(error.message || "Cannot create bucket");
    } finally {
      setBucketLoading(false);
    }
  }

  async function handleDeleteBucket(bucket) {
    const confirmed = window.confirm(`Delete bucket "${bucket.group}"?`);
    if (!confirmed) return;

    setBucketError("");
    setBucketLoading(true);

    try {
      if (canPersistBuckets) {
        await deleteBucket(bucket.id, session.user.id);
      }

      persist({
        ...state,
        buckets: state.buckets.filter((item) => item.id !== bucket.id),
        effective: state.effective.filter((item) => item.group !== bucket.group),
      });
    } catch (error) {
      setBucketError(error.message || "Cannot delete bucket");
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
          authError={authError}
          authLoading={authLoading}
          credentials={credentials}
          isSupabaseConfigured={isSupabaseConfigured}
          onChangeCredentials={updateCredential}
          onContinueOffline={() => {
            setAuthError("");
            setAuthMode("guest");
          }}
          onSubmit={handleAuthSubmit}
        />
      ) : null}

      <AppHeader
        canPersistBuckets={canPersistBuckets}
        isAuthenticated={isAuthenticated}
        onLogin={() => setAuthMode("prompt")}
        onLogout={handleLogout}
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
          isInEffective={isInEffective}
          onAddBucket={handleAddBucket}
          onChangeBucketName={setBucketName}
          onChangeSearch={setEssentialSearch}
          onDeleteBucket={handleDeleteBucket}
          onToggleGroup={toggleGroup}
          onToggleItem={onEssentialToggle}
        />

        <EffectiveListPanel
          customItem={customItem}
          effectiveItems={state.effective}
          onAddCustomItem={handleAddCustomItem}
          onChangeCustomItem={setCustomItem}
          onClear={clearEffective}
          onDownload={downloadTxt}
          onRemoveItem={removeFromEffectiveById}
        />
      </main>

      <AppFooter />
    </>
  );
}
