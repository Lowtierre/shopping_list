import { pageWidth } from "./uiClasses";

export function AppFooter() {
  return (
    <footer className="border-t border-white/10 py-[18px] text-[#b7c0d8]/90">
      <div className={pageWidth}>
        <small>React app - local persistence plus Supabase auth and bucket sync.</small>
      </div>
    </footer>
  );
}
