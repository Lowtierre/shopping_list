import { errorText, ghostButton, input, modalCard, primaryButton } from "./uiClasses";

export function AuthPrompt({
  authError,
  authLoading,
  credentials,
  isSupabaseConfigured,
  onChangeCredentials,
  onContinueOffline,
  onSubmit,
}) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-[#0b0d12]/90 px-4 text-[#eef2ff] backdrop-blur-sm">
      <div className={modalCard}>
        <h2 className="m-0 text-xl font-bold">Accesso</h2>
        <p className="m-0 mt-2 text-sm text-[#b7c0d8]">
          Puoi entrare senza account, ma le modifiche ai bucket resteranno locali e non saranno salvate nel database.
        </p>

        {!isSupabaseConfigured ? (
          <p className="m-0 mt-3 rounded-[14px] border border-dashed border-white/10 bg-white/[0.02] p-3 text-sm text-[#ff9db1]">
            Supabase non e configurato. Aggiungi le variabili VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY per abilitare login e sync.
          </p>
        ) : null}

        <form className="mt-4 grid gap-2.5" onSubmit={(event) => onSubmit(event, "login")}>
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
              Entra
            </button>
            <button
              className={ghostButton}
              type="button"
              onClick={(event) => onSubmit(event, "signup")}
              disabled={!isSupabaseConfigured || authLoading}
            >
              Crea account
            </button>
            <button className={ghostButton} type="button" onClick={onContinueOffline}>
              Continua offline
            </button>
          </div>
        </form>

        {authError ? <p className={errorText}>{authError}</p> : null}
      </div>
    </div>
  );
}
