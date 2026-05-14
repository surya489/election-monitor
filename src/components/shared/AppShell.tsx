import Link from "next/link";
import type { ReactNode } from "react";
import { ToastMessage } from "./ToastMessage";
import type { Toast } from "./types";

type AppShellProps = {
  children: ReactNode;
  toast: Toast | null;
  className?: string;
  contentClassName?: string;
  showLogout?: boolean;
  onLogout?: () => void;
};

export function AppShell({
  children,
  toast,
  className = "",
  contentClassName = "",
  showLogout = false,
  onLogout,
}: AppShellProps) {
  return (
    <main
      className={`min-h-screen bg-[linear-gradient(135deg,#f5fbf9_0%,#eef4ff_45%,#fff8ed_100%)] text-[#14211f] ${className}`}
    >
      <ToastMessage toast={toast} />
      <section
        className={`mx-auto flex min-h-screen w-full max-w-6xl flex-col px-5 py-6 sm:px-8 ${contentClassName}`}
      >
        <nav className="flex flex-wrap items-center justify-between gap-3 border-b border-[#d8e0db] pb-4">
          <Link className="text-xl font-semibold text-[#14211f]" href="/">
            VoteFlow
          </Link>
          {showLogout ? (
            <button
              className="cursor-pointer rounded-md border border-[#14211f] px-4 py-2 text-sm font-medium transition hover:bg-[#14211f] hover:text-white"
              onClick={onLogout}
            >
              Logout
            </button>
          ) : null}
        </nav>
        {children}
      </section>
    </main>
  );
}

