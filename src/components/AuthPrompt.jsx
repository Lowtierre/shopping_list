import { X } from "lucide-react";
import { errorText, input, modalCard, primaryButton } from "./uiClasses";

export function AuthPrompt({
  authView,
  authError,
  authLoading,
  credentials,
  isSupabaseConfigured,
  onChangeAuthView,
  onChangeCredentials,
  onClose,
  onSubmit,
}) {
  const isSignup = authView === "signup";

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-[#0b0d12]/90 px-4 text-[#eef2ff] backdrop-blur-sm">
      <div className={modalCard}>
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="m-0 text-xl font-bold">
              {isSignup ? "Crea account" : "Accedi"}
            </h2>
            <p className="m-0 mt-2 text-sm text-[#b7c0d8]">
              {isSignup
                ? "Crea un account per salvare e sincronizzare le tue categorie private."
                : "Accedi per modificare e sincronizzare le tue categorie private."}
            </p>
          </div>
          <button
            className="grid h-10 w-10 shrink-0 cursor-pointer place-items-center rounded-xl border border-white/10 bg-white/[0.04] text-[#eef2ff] transition hover:bg-white/[0.06] active:translate-y-px"
            type="button"
            onClick={onClose}
            aria-label="Chiudi"
          >
            <X aria-hidden="true" size={18} strokeWidth={2.2} />
          </button>
        </div>

        <div
          className="mt-4 grid grid-cols-2 rounded-xl border border-white/10 bg-white/[0.03] p-1"
          role="tablist"
          aria-label="Seleziona modalita di autenticazione"
        >
          <button
            className={`cursor-pointer rounded-lg border px-3 py-2 text-sm font-medium transition active:translate-y-px ${
              !isSignup
                ? "border-[#7aa2ff]/55 bg-[#7aa2ff]/[0.18] text-[#eef2ff]"
                : "border-transparent bg-transparent text-[#b7c0d8] hover:bg-white/[0.05] hover:text-[#eef2ff]"
            }`}
            type="button"
            role="tab"
            aria-selected={!isSignup}
            onClick={() => onChangeAuthView("login")}
            disabled={authLoading}
          >
            Accedi
          </button>
          <button
            className={`cursor-pointer rounded-lg border px-3 py-2 text-sm font-medium transition active:translate-y-px ${
              isSignup
                ? "border-[#7aa2ff]/55 bg-[#7aa2ff]/[0.18] text-[#eef2ff]"
                : "border-transparent bg-transparent text-[#b7c0d8] hover:bg-white/[0.05] hover:text-[#eef2ff]"
            }`}
            type="button"
            role="tab"
            aria-selected={isSignup}
            onClick={() => onChangeAuthView("signup")}
            disabled={authLoading}
          >
            Crea account
          </button>
        </div>

        {!isSupabaseConfigured ? (
          <p className="m-0 mt-3 rounded-[14px] border border-dashed border-white/10 bg-white/[0.02] p-3 text-sm text-[#ff9db1]">
            Supabase non e configurato. Aggiungi le variabili VITE_SUPABASE_URL e VITE_SUPABASE_PUBLISHABLE_KEY per abilitare accesso e sincronizzazione.
          </p>
        ) : null}

        <form className="mt-4 grid gap-2.5" onSubmit={(event) => onSubmit(event, authView)}>
          <input
            className={input}
            type="email"
            placeholder="Email"
            value={credentials.email}
            onChange={(event) => onChangeCredentials("email", event.target.value)}
            disabled={!isSupabaseConfigured || authLoading}
          />
          <input
            className={input}
            type="password"
            placeholder="Password"
            value={credentials.password}
            onChange={(event) => onChangeCredentials("password", event.target.value)}
            disabled={!isSupabaseConfigured || authLoading}
          />
          <div className="flex flex-wrap gap-2.5">
            <button
              className={primaryButton}
              type="submit"
              disabled={!isSupabaseConfigured || authLoading}
            >
              {isSignup ? "Crea account" : "Entra"}
            </button>
          </div>
        </form>

        {authError ? <p className={errorText}>{authError}</p> : null}
      </div>
    </div>
  );
}
