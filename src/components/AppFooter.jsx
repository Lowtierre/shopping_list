import { pageWidth } from "./uiClasses";

export function AppFooter() {
  return (
    <footer className="border-t border-white/10 py-[18px] text-[#b7c0d8]/90">
      <div className={pageWidth}>
        <small>App React - persistenza locale, accesso Supabase e sincronizzazione dei bucket.</small>
      </div>
    </footer>
  );
}
