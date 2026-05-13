import { errorText, ghostButton, input, modalCard, primaryButton } from "./uiClasses";

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
              {isSignup ? "Crea account" : "Accesso"}
            </h2>
            <p className="m-0 mt-2 text-sm text-[#b7c0d8]">
              {isSignup
                ? "Crea un account per salvare e sincronizzare i tuoi bucket privati."
                : "Accedi per modificare e sincronizzare i tuoi bucket privati."}
            </p>
          </div>
          <button className={ghostButton} type="button" onClick={onClose}>
            Chiudi
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
            <button
              className={ghostButton}
              type="button"
              onClick={() => onChangeAuthView(isSignup ? "login" : "signup")}
              disabled={authLoading}
            >
              {isSignup ? "Ho gia un account" : "Crea account"}
            </button>
          </div>
        </form>

        {authError ? <p className={errorText}>{authError}</p> : null}
      </div>
    </div>
  );
}
