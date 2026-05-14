import Link from "next/link";
import { PasswordField } from "./PasswordField";
import type { LoginFormSubmit } from "./types";

type AdminLoginProps = {
  email: string;
  isLoading: boolean;
  password: string;
  showPassword: boolean;
  onEmailChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onSubmit: LoginFormSubmit;
  onTogglePassword: () => void;
};

export function AdminLogin({
  email,
  isLoading,
  password,
  showPassword,
  onEmailChange,
  onPasswordChange,
  onSubmit,
  onTogglePassword,
}: AdminLoginProps) {
  return (
    <section className="mx-auto grid min-h-[calc(100vh-4rem)] max-w-5xl items-center gap-8 lg:grid-cols-[0.95fr_1.05fr]">
      <div>
        <Link className="text-xl font-semibold" href="/">
          VoteFlow
        </Link>
        <p className="mt-10 text-sm font-semibold uppercase tracking-[0.18em] text-[#0f766e]">
          Admin Dashboard
        </p>
        <h1 className="mt-4 text-4xl font-semibold leading-tight sm:text-5xl">
          Monitor live election results with clarity.
        </h1>
        <p className="mt-5 max-w-xl text-base leading-7 text-[#52615d]">
          Sign in to view live counts, leading party, vote margin, and a ranked chart
          that updates as new votes arrive.
        </p>
      </div>

      <form
        className="rounded-lg border border-[#d8e0db] bg-white p-5 shadow-lg shadow-[#0f766e]/10 sm:p-6"
        onSubmit={onSubmit}
      >
        <h2 className="text-2xl font-semibold">Admin Login</h2>
        <p className="mt-2 text-sm text-[#52615d]">
          Use your administrator credentials to access the result center.
        </p>
        <div className="mt-6 space-y-4">
          <label className="block">
            <span className="text-sm font-medium text-[#52615d]">Email</span>
            <input
              className="mt-2 h-12 w-full rounded-md border border-[#d8e0db] px-4 outline-none transition focus:border-[#0f766e] focus:ring-4 focus:ring-[#0f766e]/10"
              onChange={(event) => onEmailChange(event.target.value)}
              type="email"
              value={email}
            />
          </label>
          <PasswordField
            onChange={onPasswordChange}
            onToggle={onTogglePassword}
            showPassword={showPassword}
            value={password}
          />
        </div>
        <button
          className="mt-6 h-12 w-full cursor-pointer rounded-md bg-[#14211f] font-semibold text-white transition hover:bg-[#24423d] disabled:cursor-not-allowed disabled:bg-[#9aa6a1]"
          disabled={isLoading}
          type="submit"
        >
          {isLoading ? "Signing in..." : "Sign In"}
        </button>
      </form>
    </section>
  );
}

