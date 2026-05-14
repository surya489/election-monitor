import { PasswordInput } from "@/components/shared/PasswordInput";
import { AuthModeTabs } from "./AuthModeTabs";
import type { AuthFormSubmit, AuthMode } from "./types";

type VoterAuthPanelProps = {
  authMode: AuthMode;
  email: string;
  isSubmitting: boolean;
  name: string;
  password: string;
  showPassword: boolean;
  onAuthModeChange: (mode: AuthMode) => void;
  onEmailChange: (value: string) => void;
  onNameChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onSubmit: AuthFormSubmit;
  onTogglePassword: () => void;
};

export function VoterAuthPanel({
  authMode,
  email,
  isSubmitting,
  name,
  password,
  showPassword,
  onAuthModeChange,
  onEmailChange,
  onNameChange,
  onPasswordChange,
  onSubmit,
  onTogglePassword,
}: VoterAuthPanelProps) {
  return (
    <div className="mx-auto grid w-full max-w-5xl flex-1 items-center gap-8 py-10 lg:grid-cols-[0.95fr_1.05fr]">
      <AuthIntro />

      <form
        className="rounded-lg border border-[#d8e0db] bg-white p-5 shadow-lg shadow-[#0f766e]/10 sm:p-6"
        onSubmit={onSubmit}
      >
        <h2 className="text-2xl font-semibold text-[#14211f]">Voter Access</h2>
        <p className="mt-2 text-sm text-[#52615d]">
          {authMode === "signup"
            ? "Fill in the details below to create your voter profile."
            : "Welcome back. Enter your credentials to continue."}
        </p>

        <AuthModeTabs authMode={authMode} onChange={onAuthModeChange} />

        <div className="mt-5 space-y-3">
          {authMode === "signup" ? (
            <input
              className="h-12 w-full rounded-md border border-[#d8e0db] bg-white px-4 outline-none transition placeholder:text-[#899590] focus:border-[#0f766e] focus:ring-4 focus:ring-[#0f766e]/10"
              onChange={(event) => onNameChange(event.target.value)}
              placeholder="Full name"
              required
              value={name}
            />
          ) : null}
          <input
            className="h-12 w-full rounded-md border border-[#d8e0db] bg-white px-4 outline-none transition placeholder:text-[#899590] focus:border-[#0f766e] focus:ring-4 focus:ring-[#0f766e]/10"
            onChange={(event) => onEmailChange(event.target.value)}
            placeholder="Email"
            required
            type="email"
            value={email}
          />
          <PasswordInput
            minLength={6}
            onChange={onPasswordChange}
            onToggle={onTogglePassword}
            placeholder="Password"
            required
            showPassword={showPassword}
            value={password}
          />
        </div>

        <button
          className="mt-5 h-12 w-full cursor-pointer rounded-md bg-[#14211f] font-semibold text-white transition hover:bg-[#24423d] disabled:cursor-not-allowed disabled:bg-[#9aa6a1]"
          disabled={isSubmitting}
          type="submit"
        >
          {isSubmitting
            ? "Please wait..."
            : authMode === "signup"
              ? "Create Account"
              : "Login"}
        </button>
      </form>
    </div>
  );
}

function AuthIntro() {
  return (
    <div className="rounded-lg border border-[#d8e0db] bg-white/80 p-6 shadow-sm backdrop-blur sm:p-8">
      <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#0f766e]">
        Tamil Nadu Election Poll
      </p>
      <h1 className="mt-4 text-4xl font-semibold leading-tight text-[#14211f] sm:text-5xl">
        Sign in to open your secure ballot.
      </h1>
      <p className="mt-5 text-base leading-7 text-[#52615d]">
        Create a voter account or return with your existing profile. The party list
        appears only after your identity is verified.
      </p>
      <div className="mt-8 grid gap-3 text-sm text-[#52615d] sm:grid-cols-3">
        {["Verified access", "One vote only", "Instant status"].map((label) => (
          <span
            className="rounded-md border border-[#d8e0db] bg-[#f8fbfa] px-3 py-3 font-medium"
            key={label}
          >
            {label}
          </span>
        ))}
      </div>
    </div>
  );
}

