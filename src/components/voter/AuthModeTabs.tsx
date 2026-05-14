import type { AuthMode } from "./types";

type AuthModeTabsProps = {
  authMode: AuthMode;
  onChange: (mode: AuthMode) => void;
};

export function AuthModeTabs({ authMode, onChange }: AuthModeTabsProps) {
  return (
    <div className="relative mt-6 grid grid-cols-2 rounded-md border border-[#d8e0db] bg-[#f8fbfa] p-1">
      <span
        className={`absolute bottom-1 top-1 w-[calc(50%-0.25rem)] rounded bg-[#14211f] shadow-sm transition-transform duration-300 ease-out ${
          authMode === "login" ? "translate-x-full" : "translate-x-0"
        }`}
      />
      {(["signup", "login"] as const).map((mode) => (
        <button
          className={`relative z-10 h-10 cursor-pointer rounded text-sm font-semibold transition-colors duration-300 ${
            authMode === mode ? "text-white" : "text-[#52615d] hover:text-[#14211f]"
          }`}
          key={mode}
          onClick={() => onChange(mode)}
          type="button"
        >
          {mode === "signup" ? "Sign Up" : "Login"}
        </button>
      ))}
    </div>
  );
}

