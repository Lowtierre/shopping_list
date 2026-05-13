import { ghostButton, pageWidth, pill, primaryButton } from "./uiClasses";

export function AppHeader({ canPersistBuckets, isAuthenticated, onLogin, onLogout, userEmail }) {
  return (
    <header className="border-b border-white/10 bg-[#121620]/35 py-6 pb-[18px] backdrop-blur-[10px]">
      <div className={`${pageWidth} flex flex-wrap items-start justify-between gap-3`}>
        <div>
          <h1 className="m-0 text-[28px] font-bold">Shopping List</h1>
          <p className="m-0 mt-2 text-[#b7c0d8]">
            Pick from essentials, add custom items, authenticate, and sync bucket structural changes.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2.5">
          <span className={pill}>{canPersistBuckets ? userEmail : "Offline"}</span>
          {isAuthenticated ? (
            <button className={ghostButton} type="button" onClick={onLogout}>
              Logout
            </button>
          ) : (
            <button className={primaryButton} type="button" onClick={onLogin}>
              Login
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
