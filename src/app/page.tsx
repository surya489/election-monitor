"use client";

import type { FormEvent } from "react";
import { useEffect, useState } from "react";
import Link from "next/link";

type Nominee = {
  id: string;
  abbreviation: string;
  name: string;
  fullName: string;
  party: string;
  leader: string;
  symbol: string;
  voteCount: number;
};

type User = {
  id: string;
  name: string;
  email: string;
};

type Toast = {
  id: number;
  message: string;
  tone: "success" | "error" | "info";
};

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000";
const BALLOT_ORDER = ["DMK", "ADMK", "TVK", "NTK", "PMK"];

function canonicalAbbreviation(abbreviation: string) {
  return abbreviation === "AIADMK" ? "ADMK" : abbreviation;
}

function getAllowedNominees(nominees: Nominee[]) {
  const normalizedNominees = nominees.map((nominee) => ({
    ...nominee,
    abbreviation: canonicalAbbreviation(nominee.abbreviation),
    name: canonicalAbbreviation(nominee.name),
  }));

  return BALLOT_ORDER.map((abbreviation) =>
    normalizedNominees.find((nominee) => nominee.abbreviation === abbreviation)
  ).filter((nominee): nominee is Nominee => Boolean(nominee));
}

export default function Home() {
  const [nominees, setNominees] = useState<Nominee[]>([]);
  const [selectedNominee, setSelectedNominee] = useState("");
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState(() =>
    typeof window === "undefined" ? "" : localStorage.getItem("user-token") ?? ""
  );
  const [authMode, setAuthMode] = useState<"login" | "signup">("signup");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [hasVoted, setHasVoted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState<Toast | null>(null);

  function showToast(message: string, tone: Toast["tone"] = "info") {
    setToast({ id: Date.now(), message, tone });
  }

  function switchAuthMode(mode: "login" | "signup") {
    setAuthMode(mode);
    setName("");
    setEmail("");
    setPassword("");
    setShowPassword(false);
    setToast(null);
  }

  useEffect(() => {
    if (!toast) {
      return;
    }

    const timer = window.setTimeout(() => setToast(null), 3600);
    return () => window.clearTimeout(timer);
  }, [toast]);

  useEffect(() => {
    if (!token) {
      return;
    }

    async function loadVotingSession() {
      setIsLoading(true);
      try {
        const [meResponse, voteResponse, nomineesResponse] = await Promise.all([
          fetch(`${API_URL}/api/auth/me`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${API_URL}/api/votes/me`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${API_URL}/api/nominees`),
        ]);

        if (!meResponse.ok) {
          throw new Error("Your session expired. Please sign in again.");
        }

        const meData = await meResponse.json();
        const voteData = voteResponse.ok ? await voteResponse.json() : { nomineeId: null };
        const nomineesData = await nomineesResponse.json();

        setUser(meData.user);
        setHasVoted(Boolean(voteData.nomineeId));
        setSelectedNominee(voteData.nomineeId ?? "");
        setNominees(getAllowedNominees(nomineesData.nominees ?? []));
      } catch (error) {
        localStorage.removeItem("user-token");
        setToken("");
        setUser(null);
        showToast(error instanceof Error ? error.message : "Please sign in again.", "error");
      } finally {
        setIsLoading(false);
      }
    }

    loadVotingSession();
  }, [token]);

  async function authenticate(event?: FormEvent<HTMLFormElement>) {
    event?.preventDefault();
    setIsSubmitting(true);
    setToast(null);

    try {
      const endpoint = authMode === "signup" ? "signup" : "user-login";
      const response = await fetch(`${API_URL}/api/auth/${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          authMode === "signup" ? { name, email, password } : { email, password }
        ),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message ?? "Authentication failed");
      }

      localStorage.setItem("user-token", data.token);
      setToken(data.token);
      setUser(data.user);
      setName("");
      setPassword("");
      showToast(
        authMode === "signup"
          ? "Account created. Your ballot is ready."
          : "Welcome back. Your ballot is ready.",
        "success"
      );
    } catch (error) {
      showToast(error instanceof Error ? error.message : "Authentication failed", "error");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function submitVote() {
    if (!token) {
      showToast("Please sign in before voting.", "error");
      return;
    }

    if (!selectedNominee) {
      showToast("Please select a party before voting.", "info");
      return;
    }

    setIsSubmitting(true);
    setToast(null);

    try {
      const response = await fetch(`${API_URL}/api/votes`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ nomineeId: selectedNominee }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message ?? "Vote could not be submitted");
      }

      setHasVoted(true);
      showToast("Your vote has been recorded. Thank you.", "success");
    } catch (error) {
      showToast(error instanceof Error ? error.message : "Vote failed", "error");
    } finally {
      setIsSubmitting(false);
    }
  }

  function logout() {
    localStorage.removeItem("user-token");
    setToken("");
    setUser(null);
    setHasVoted(false);
    setSelectedNominee("");
    setNominees([]);
    showToast("You have been logged out.", "info");
  }

  const selectedParty = nominees.find((nominee) => nominee.id === selectedNominee);

  const authPanel = (
    <div className="mx-auto grid w-full max-w-5xl flex-1 items-center gap-8 py-10 lg:grid-cols-[0.95fr_1.05fr]">
      <div className="rounded-lg border border-[#d8e0db] bg-white/80 p-6 shadow-sm backdrop-blur sm:p-8">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#0f766e]">
          Tamil Nadu Election Poll
        </p>
        <h1 className="mt-4 text-4xl font-semibold leading-tight text-[#14211f] sm:text-5xl">
          Sign in to open your secure ballot.
        </h1>
        <p className="mt-5 text-base leading-7 text-[#52615d]">
          Create a voter account or return with your existing profile. The party
          list appears only after your identity is verified.
        </p>
        <div className="mt-8 grid gap-3 text-sm text-[#52615d] sm:grid-cols-3">
          <span className="rounded-md border border-[#d8e0db] bg-[#f8fbfa] px-3 py-3 font-medium">
            Verified access
          </span>
          <span className="rounded-md border border-[#d8e0db] bg-[#f8fbfa] px-3 py-3 font-medium">
            One vote only
          </span>
          <span className="rounded-md border border-[#d8e0db] bg-[#f8fbfa] px-3 py-3 font-medium">
            Instant status
          </span>
        </div>
      </div>

      <form
        className="rounded-lg border border-[#d8e0db] bg-white p-5 shadow-lg shadow-[#0f766e]/10 sm:p-6"
        onSubmit={authenticate}
      >
        <h2 className="text-2xl font-semibold text-[#14211f]">Voter Access</h2>
        <p className="mt-2 text-sm text-[#52615d]">
          {authMode === "signup"
            ? "Fill in the details below to create your voter profile."
            : "Welcome back. Enter your credentials to continue."}
        </p>

        <div className="relative mt-6 grid grid-cols-2 rounded-md border border-[#d8e0db] bg-[#f8fbfa] p-1">
          <span
            className={`absolute bottom-1 top-1 w-[calc(50%-0.25rem)] rounded bg-[#14211f] shadow-sm transition-transform duration-300 ease-out ${
              authMode === "login" ? "translate-x-full" : "translate-x-0"
            }`}
          />
          {(["signup", "login"] as const).map((mode) => (
            <button
              className={`relative z-10 h-10 cursor-pointer rounded text-sm font-semibold transition-colors duration-300 ${
                authMode === mode
                  ? "text-white"
                  : "text-[#52615d] hover:text-[#14211f]"
              }`}
              key={mode}
              onClick={() => switchAuthMode(mode)}
              type="button"
            >
              {mode === "signup" ? "Sign Up" : "Login"}
            </button>
          ))}
        </div>

        <div className="mt-5 space-y-3">
          {authMode === "signup" ? (
            <input
              className="h-12 w-full rounded-md border border-[#d8e0db] bg-white px-4 outline-none transition placeholder:text-[#899590] focus:border-[#0f766e] focus:ring-4 focus:ring-[#0f766e]/10"
              onChange={(event) => setName(event.target.value)}
              placeholder="Full name"
              required
              value={name}
            />
          ) : null}
          <input
            className="h-12 w-full rounded-md border border-[#d8e0db] bg-white px-4 outline-none transition placeholder:text-[#899590] focus:border-[#0f766e] focus:ring-4 focus:ring-[#0f766e]/10"
            onChange={(event) => setEmail(event.target.value)}
            placeholder="Email"
            required
            type="email"
            value={email}
          />
          <div className="relative">
            <input
              className="h-12 w-full rounded-md border border-[#d8e0db] bg-white px-4 pr-12 outline-none transition placeholder:text-[#899590] focus:border-[#0f766e] focus:ring-4 focus:ring-[#0f766e]/10"
              minLength={6}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Password"
              required
              type={showPassword ? "text" : "password"}
              value={password}
            />
            <button
              aria-label={showPassword ? "Hide password" : "Show password"}
              className="absolute right-2 top-1/2 flex h-9 w-9 -translate-y-1/2 cursor-pointer items-center justify-center rounded-md text-[#52615d] transition hover:bg-[#eefcf8] hover:text-[#14211f]"
              onClick={() => setShowPassword((current) => !current)}
              type="button"
            >
              {showPassword ? (
                <svg
                  aria-hidden="true"
                  className="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path d="M3 3l18 18" />
                  <path d="M10.6 10.6a2 2 0 0 0 2.8 2.8" />
                  <path d="M9.9 4.2A10.8 10.8 0 0 1 12 4c5 0 9 5 9 8a8.8 8.8 0 0 1-2.2 3.5" />
                  <path d="M6.6 6.6C4.4 8.1 3 10.2 3 12c0 3 4 8 9 8a10.7 10.7 0 0 0 4.1-.8" />
                </svg>
              ) : (
                <svg
                  aria-hidden="true"
                  className="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12Z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              )}
            </button>
          </div>
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

  const votingPanel = (
    <div className="flex-1 py-8">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#0f766e]">
            Tamil Nadu Election Poll
          </p>
          <h1 className="mt-3 text-3xl font-semibold text-[#14211f] sm:text-4xl">
            Welcome, {user?.name}
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-[#52615d]">
            {hasVoted
              ? "Your vote is locked. You can review the party you selected below."
              : "Choose one party from the list and submit your vote."}
          </p>
        </div>
        <div className="rounded-md border border-[#d8e0db] bg-white px-4 py-3 text-sm shadow-sm">
          <span className="block font-semibold text-[#14211f]">
            {hasVoted ? "Vote recorded" : "Ballot ready"}
          </span>
          <span className="text-[#52615d]">
            {hasVoted && selectedParty
              ? `Selected: ${selectedParty.abbreviation}`
              : `${nominees.length} parties listed`}
          </span>
        </div>
      </div>

      <div className="rounded-lg border border-[#d8e0db] bg-white p-5 shadow-lg shadow-[#0f766e]/10 sm:p-6">
        {isLoading ? (
          <p className="py-10 text-center text-[#52615d]">Loading parties...</p>
        ) : (
          <div className="grid gap-3 xl:grid-cols-2">
            {nominees.map((nominee) => (
              <label
                className={`grid grid-cols-[3rem_1fr] items-center gap-3 rounded-md border p-4 transition sm:grid-cols-[3.5rem_1fr_auto] sm:gap-4 ${
                  selectedNominee === nominee.id
                    ? "border-[#0f766e] bg-[#eefcf8] shadow-sm"
                    : "border-[#d8e0db] hover:border-[#91aaa2] hover:bg-[#fbfdfc]"
                } ${hasVoted ? "cursor-not-allowed opacity-75" : "cursor-pointer"}`}
                key={nominee.id}
              >
                <span className="flex h-14 w-14 items-center justify-center rounded-md bg-[#14211f] text-center text-xs font-bold leading-tight text-white">
                  {nominee.symbol}
                </span>
                <span>
                  <span className="flex flex-wrap items-center gap-2 font-semibold text-[#14211f]">
                    {nominee.abbreviation}
                    {hasVoted && selectedNominee === nominee.id ? (
                      <span className="rounded-full bg-[#0f766e] px-2 py-1 text-xs text-white">
                        Your vote
                      </span>
                    ) : null}
                  </span>
                  <span className="block text-sm text-[#52615d]">{nominee.fullName}</span>
                  <span className="mt-1 block text-xs font-medium uppercase text-[#0f766e]">
                    Leader: {nominee.leader}
                  </span>
                </span>
                <input
                  checked={selectedNominee === nominee.id}
                  className="col-start-2 h-5 w-5 justify-self-end accent-[#0f766e] sm:col-start-auto sm:justify-self-auto"
                  disabled={hasVoted}
                  name="nominee"
                  onChange={() => setSelectedNominee(nominee.id)}
                  type="radio"
                />
              </label>
            ))}
          </div>
        )}

        <button
          className="mt-6 h-12 w-full cursor-pointer rounded-md bg-[#14211f] px-5 font-semibold text-white transition hover:bg-[#24423d] disabled:cursor-not-allowed disabled:bg-[#9aa6a1]"
          disabled={isSubmitting || hasVoted || isLoading}
          onClick={submitVote}
        >
          {hasVoted ? "Vote Submitted" : isSubmitting ? "Submitting..." : "Submit Vote"}
        </button>
      </div>
    </div>
  );

  return (
    <main className="min-h-screen bg-[linear-gradient(135deg,#f5fbf9_0%,#eef4ff_45%,#fff8ed_100%)] text-[#14211f]">
      {toast ? (
        <div
          className={`fixed left-5 right-5 top-5 z-50 rounded-md border px-4 py-3 text-sm shadow-lg sm:left-auto sm:max-w-sm ${
            toast.tone === "success"
              ? "border-[#bce7d3] bg-[#effcf6] text-[#14513d]"
              : toast.tone === "error"
                ? "border-[#f3c4c4] bg-[#fff1f1] text-[#8d1d1d]"
                : "border-[#c9d8f0] bg-[#f3f7ff] text-[#243f6b]"
          }`}
          role="status"
        >
          {toast.message}
        </div>
      ) : null}

      <section className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-5 py-6 sm:px-8">
        <nav className="flex flex-wrap items-center justify-between gap-3 border-b border-[#d8e0db] pb-4">
          <Link className="text-xl font-semibold text-[#14211f]" href="/">
            VoteFlow
          </Link>
          {user ? (
            <button
              className="cursor-pointer rounded-md border border-[#14211f] px-4 py-2 text-sm font-medium transition hover:bg-[#14211f] hover:text-white"
              onClick={logout}
            >
              Logout
            </button>
          ) : null}
        </nav>

        {user ? votingPanel : authPanel}
      </section>
    </main>
  );
}
