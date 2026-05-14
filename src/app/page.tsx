"use client";

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

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000";

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
  const [hasVoted, setHasVoted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");

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
        setNominees(nomineesData.nominees ?? []);
      } catch (error) {
        localStorage.removeItem("user-token");
        setToken("");
        setUser(null);
        setMessage(error instanceof Error ? error.message : "Please sign in again.");
      } finally {
        setIsLoading(false);
      }
    }

    loadVotingSession();
  }, [token]);

  async function authenticate() {
    setIsSubmitting(true);
    setMessage("");

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
      setMessage("Signed in. You can now access the voting page.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Authentication failed");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function submitVote() {
    if (!token) {
      setMessage("Please sign in before voting.");
      return;
    }

    if (!selectedNominee) {
      setMessage("Please select a party before voting.");
      return;
    }

    setIsSubmitting(true);
    setMessage("");

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
      setMessage("Your vote has been recorded. Thank you.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Vote failed");
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
  }

  return (
    <main className="min-h-screen bg-[#f7f7f2] text-[#171717]">
      <section className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-5 py-6 sm:px-8">
        <nav className="flex flex-wrap items-center justify-between gap-3 border-b border-[#d7d2c5] pb-4">
          <Link className="text-xl font-semibold" href="/">
            VoteFlow
          </Link>
          <div className="flex items-center gap-2">
            {user ? (
              <button className="text-sm font-medium text-[#7b4f22]" onClick={logout}>
                Logout
              </button>
            ) : null}
            <Link
              className="rounded-md border border-[#171717] px-4 py-2 text-sm font-medium transition hover:bg-[#171717] hover:text-white"
              href="/admin"
            >
              Admin
            </Link>
          </div>
        </nav>

        <div className="grid flex-1 gap-8 py-8 lg:grid-cols-[0.72fr_1.28fr]">
          <div className="self-center">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#7b4f22]">
              Tamil Nadu Election Poll
            </p>
            <h1 className="mt-4 text-4xl font-semibold leading-tight sm:text-5xl">
              Login first. Then cast one secure vote.
            </h1>
            <p className="mt-5 max-w-xl text-base leading-7 text-[#55524b]">
              The voting list is available only after signup or login. Each
              account can vote once, and the backend rejects repeat votes.
            </p>

            <div className="mt-8 rounded-lg border border-[#d7d2c5] bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between gap-4">
                <h2 className="text-xl font-semibold">
                  {user ? `Welcome, ${user.name}` : "Voter Login"}
                </h2>
              </div>

              {!user ? (
                <>
                  <div className="mt-5 grid grid-cols-2 rounded-md border border-[#d7d2c5] p-1">
                    {(["signup", "login"] as const).map((mode) => (
                      <button
                        className={`h-9 rounded text-sm font-semibold ${
                          authMode === mode ? "bg-[#171717] text-white" : "text-[#55524b]"
                        }`}
                        key={mode}
                        onClick={() => setAuthMode(mode)}
                      >
                        {mode === "signup" ? "Sign Up" : "Login"}
                      </button>
                    ))}
                  </div>
                  <div className="mt-5 space-y-3">
                    {authMode === "signup" ? (
                      <input
                        className="h-11 w-full rounded-md border border-[#d7d2c5] px-3 outline-none focus:border-[#0f6b5f]"
                        onChange={(event) => setName(event.target.value)}
                        placeholder="Full name"
                        value={name}
                      />
                    ) : null}
                    <input
                      className="h-11 w-full rounded-md border border-[#d7d2c5] px-3 outline-none focus:border-[#0f6b5f]"
                      onChange={(event) => setEmail(event.target.value)}
                      placeholder="Email"
                      value={email}
                    />
                    <input
                      className="h-11 w-full rounded-md border border-[#d7d2c5] px-3 outline-none focus:border-[#0f6b5f]"
                      onChange={(event) => setPassword(event.target.value)}
                      placeholder="Password"
                      type="password"
                      value={password}
                    />
                  </div>
                  <button
                    className="mt-5 h-11 w-full rounded-md bg-[#171717] font-semibold text-white transition hover:bg-[#333] disabled:bg-[#9b978e]"
                    disabled={isSubmitting}
                    onClick={authenticate}
                  >
                    {isSubmitting
                      ? "Please wait..."
                      : authMode === "signup"
                        ? "Create Account"
                        : "Login"}
                  </button>
                </>
              ) : (
                <p className="mt-4 rounded-md bg-[#eef8f5] px-4 py-3 text-sm text-[#17473f]">
                  Account verified. The ballot is unlocked on the right.
                </p>
              )}
            </div>
          </div>

          <div className="rounded-lg border border-[#d7d2c5] bg-white p-5 shadow-sm">
            {!user ? (
              <div className="flex min-h-[560px] flex-col justify-center rounded-md border border-dashed border-[#d7d2c5] p-6 text-center">
                <h2 className="text-2xl font-semibold">Voting page locked</h2>
                <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-[#666158]">
                  Sign up or login to view the parties, leaders, symbols, and
                  submit your vote.
                </p>
              </div>
            ) : (
              <>
                <div className="mb-5 flex items-center justify-between gap-4">
                  <h2 className="text-xl font-semibold">Parties</h2>
                  <span className="text-sm text-[#666158]">{nominees.length} listed</span>
                </div>

                {isLoading ? (
                  <p className="py-10 text-center text-[#666158]">Loading parties...</p>
                ) : (
                  <div className="grid gap-3 xl:grid-cols-2">
                    {nominees.map((nominee) => (
                      <label
                        className={`grid cursor-pointer grid-cols-[3.5rem_1fr_auto] items-center gap-4 rounded-md border p-4 transition ${
                          selectedNominee === nominee.id
                            ? "border-[#0f6b5f] bg-[#eef8f5]"
                            : "border-[#e5e0d5] hover:border-[#b9b1a2]"
                        } ${hasVoted ? "cursor-not-allowed opacity-70" : ""}`}
                        key={nominee.id}
                      >
                        <span className="flex h-14 w-14 items-center justify-center rounded-md bg-[#171717] text-center text-xs font-bold leading-tight text-white">
                          {nominee.symbol}
                        </span>
                        <span>
                          <span className="block font-semibold">{nominee.abbreviation}</span>
                          <span className="block text-sm text-[#55524b]">{nominee.fullName}</span>
                          <span className="mt-1 block text-xs font-medium uppercase text-[#7b4f22]">
                            Leader: {nominee.leader}
                          </span>
                        </span>
                        <input
                          checked={selectedNominee === nominee.id}
                          className="h-5 w-5 accent-[#0f6b5f]"
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
                  className="mt-6 h-12 w-full rounded-md bg-[#171717] px-5 font-semibold text-white transition hover:bg-[#333] disabled:cursor-not-allowed disabled:bg-[#9b978e]"
                  disabled={isSubmitting || hasVoted || isLoading}
                  onClick={submitVote}
                >
                  {hasVoted ? "Vote Submitted" : isSubmitting ? "Submitting..." : "Submit Vote"}
                </button>
              </>
            )}

            {message ? (
              <p className="mt-4 rounded-md bg-[#f2efe6] px-4 py-3 text-sm text-[#3e3a33]">
                {message}
              </p>
            ) : null}
          </div>
        </div>
      </section>
    </main>
  );
}
