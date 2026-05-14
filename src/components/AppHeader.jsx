import { ghostButton, pageWidth, pill, primaryButton } from "./uiClasses";

export function AppHeader({ canPersistBuckets, isAuthenticated, onLogin, onLogout, onSignup, userEmail }) {
  return (
    <header className="border-b border-white/10 bg-[#121620]/35 py-6 pb-[18px] backdrop-blur-[10px]">
      <div className={`${pageWidth} flex flex-wrap items-start justify-between gap-3`}>
        <div>
          <h1 className="m-0 text-[28px] font-bold">Lista della spesa</h1>
          <p className="m-0 mt-2 text-[#b7c0d8]">
            Scegli dai prodotti di base, aggiungi elementi personalizzati e sincronizza le tue categorie private.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2.5">
          {canPersistBuckets ? <span className={pill}>{userEmail}</span> : null}
          {isAuthenticated ? (
            <button className={ghostButton} type="button" onClick={onLogout}>
              Esci
            </button>
          ) : (
            <>
              <button className={ghostButton} type="button" onClick={onLogin}>
                Accedi
              </button>
              <button className={primaryButton} type="button" onClick={onSignup}>
                Registrati
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
