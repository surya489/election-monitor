import Link from "next/link";
import type { ReactNode } from "react";
import type { Toast } from "./types";
import { ToastMessage } from "@/components/shared/ToastMessage";

type AdminShellProps = {
  children: ReactNode;
  className?: string;
  showNav?: boolean;
  toast: Toast | null;
  onLogout?: () => void;
};

export function AdminShell({
  children,
  className = "",
  showNav = false,
  toast,
  onLogout,
}: AdminShellProps) {
  return (
    <main
      className={`min-h-screen bg-[linear-gradient(135deg,#f5fbf9_0%,#eef4ff_48%,#fff8ed_100%)] text-[#14211f] ${className}`}
    >
      <ToastMessage toast={toast} />
      {showNav ? (
        <section className="mx-auto w-full max-w-6xl px-5 py-6 sm:px-8">
          <nav className="flex items-center justify-between border-b border-[#d8e0db] pb-4">
            <Link className="text-xl font-semibold" href="/">
              VoteFlow
            </Link>
            <button
              className="cursor-pointer rounded-md border border-[#14211f] px-4 py-2 text-sm font-medium transition hover:bg-[#14211f] hover:text-white"
              onClick={onLogout}
            >
              Logout
            </button>
          </nav>
          {children}
        </section>
      ) : (
        children
      )}
    </main>
  );
}
