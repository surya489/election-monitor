"use client";

import type { FormEvent } from "react";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { io, type Socket } from "socket.io-client";

type ResultNominee = {
  id: string;
  abbreviation: string;
  name: string;
  fullName: string;
  party: string;
  leader: string;
  symbol: string;
  voteCount: number;
};

type ElectionResults = {
  totalVotes: number;
  nominees: ResultNominee[];
};

type Toast = {
  id: number;
  message: string;
  tone: "success" | "error" | "info";
};

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000";
const BALLOT_ORDER = ["DMK", "ADMK", "TVK", "NTK", "PMK"];
const CHART_COLORS = [
  "#0f766e",
  "#4d6f91",
  "#b45309",
  "#7c3aed",
  "#be123c",
  "#2563eb",
  "#15803d",
  "#c2410c",
];

function canonicalAbbreviation(abbreviation: string) {
  return abbreviation === "AIADMK" ? "ADMK" : abbreviation;
}

function sanitizeResults(results: ElectionResults): ElectionResults {
  const normalizedNominees = results.nominees.map((nominee) => ({
    ...nominee,
    abbreviation: canonicalAbbreviation(nominee.abbreviation),
    name: canonicalAbbreviation(nominee.name),
  }));
  const nominees = BALLOT_ORDER.map((abbreviation) =>
    normalizedNominees.find((nominee) => nominee.abbreviation === abbreviation)
  ).filter((nominee): nominee is ResultNominee => Boolean(nominee));

  return {
    totalVotes: nominees.reduce((sum, nominee) => sum + nominee.voteCount, 0),
    nominees,
  };
}

export default function AdminPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [token, setToken] = useState(() =>
    typeof window === "undefined" ? "" : localStorage.getItem("admin-token") ?? ""
  );
  const [results, setResults] = useState<ElectionResults>({
    totalVotes: 0,
    nominees: [],
  });
  const [toast, setToast] = useState<Toast | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isResultsLoading, setIsResultsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [hoveredParty, setHoveredParty] = useState<ResultNominee | null>(null);

  function showToast(message: string, tone: Toast["tone"] = "info") {
    setToast({ id: Date.now(), message, tone });
  }

  useEffect(() => {
    if (!toast) {
      return;
    }

    const timer = window.setTimeout(() => setToast(null), 3600);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const rankedNominees = useMemo(
    () => [...results.nominees].sort((first, second) => second.voteCount - first.voteCount),
    [results.nominees]
  );

  const leader = rankedNominees[0];
  const runnerUp = rankedNominees[1];
  const margin = leader ? leader.voteCount - (runnerUp?.voteCount ?? 0) : 0;
  const activeParties = results.nominees.filter((nominee) => nominee.voteCount > 0).length;
  const pieSegments = useMemo(
    () =>
      rankedNominees.map((nominee, index) => {
        const previousVotes = rankedNominees
          .slice(0, index)
          .reduce((sum, item) => sum + item.voteCount, 0);
        const start =
          results.totalVotes === 0 ? 0 : (previousVotes / results.totalVotes) * 100;
        const share =
          results.totalVotes === 0 ? 0 : (nominee.voteCount / results.totalVotes) * 100;

        return {
          nominee,
          color: CHART_COLORS[index % CHART_COLORS.length],
          percent: Math.round(share),
          share,
          start,
        };
      }),
    [rankedNominees, results.totalVotes]
  );

  useEffect(() => {
    if (!token) {
      return;
    }

    let socket: Socket | undefined;

    async function loadResults() {
      setIsResultsLoading(true);
      try {
        const response = await fetch(`${API_URL}/api/results`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) {
          throw new Error("Admin session expired");
        }

        setResults(sanitizeResults(await response.json()));
        socket = io(API_URL, {
          auth: { token },
          transports: ["websocket", "polling"],
        });
        socket.on("results:update", (updatedResults: ElectionResults) => {
          setResults(sanitizeResults(updatedResults));
        });
      } catch (error) {
        showToast(
          error instanceof Error ? error.message : "Unable to load results",
          "error"
        );
        localStorage.removeItem("admin-token");
        setToken("");
        setEmail("");
        setPassword("");
        setShowPassword(false);
      } finally {
        setIsResultsLoading(false);
      }
    }

    loadResults();

    return () => {
      socket?.disconnect();
    };
  }, [token]);

  async function login(event?: FormEvent<HTMLFormElement>) {
    event?.preventDefault();
    setIsLoading(true);
    setToast(null);

    try {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message ?? "Login failed");
      }

      localStorage.setItem("admin-token", data.token);
      setToken(data.token);
      setEmail("");
      setPassword("");
      setShowPassword(false);
      showToast("Logged in as admin.", "success");
    } catch (error) {
      showToast(error instanceof Error ? error.message : "Login failed", "error");
    } finally {
      setIsLoading(false);
    }
  }

  function logout() {
    localStorage.removeItem("admin-token");
    setToken("");
    setResults({ totalVotes: 0, nominees: [] });
    setEmail("");
    setPassword("");
    setShowPassword(false);
    setHoveredParty(null);
    showToast("Admin logged out.", "info");
  }

  if (!token) {
    return (
      <main className="min-h-screen bg-[linear-gradient(135deg,#f5fbf9_0%,#eef4ff_48%,#fff8ed_100%)] px-5 py-8 text-[#14211f]">
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
              Sign in to view live counts, leading party, vote margin, and a
              ranked chart that updates as new votes arrive.
            </p>
          </div>

          <form
            className="rounded-lg border border-[#d8e0db] bg-white p-5 shadow-lg shadow-[#0f766e]/10 sm:p-6"
            onSubmit={login}
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
                  onChange={(event) => setEmail(event.target.value)}
                  type="email"
                  value={email}
                />
              </label>
              <label className="block">
                <span className="text-sm font-medium text-[#52615d]">Password</span>
                <span className="relative mt-2 block">
                  <input
                    className="h-12 w-full rounded-md border border-[#d8e0db] px-4 pr-12 outline-none transition focus:border-[#0f766e] focus:ring-4 focus:ring-[#0f766e]/10"
                    onChange={(event) => setPassword(event.target.value)}
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
                </span>
              </label>
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
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[linear-gradient(135deg,#f5fbf9_0%,#eef4ff_48%,#fff8ed_100%)] text-[#14211f]">
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
      <section className="mx-auto w-full max-w-6xl px-5 py-6 sm:px-8">
        <nav className="flex items-center justify-between border-b border-[#d8e0db] pb-4">
          <Link className="text-xl font-semibold" href="/">
            VoteFlow
          </Link>
          <button
            className="cursor-pointer rounded-md border border-[#14211f] px-4 py-2 text-sm font-medium transition hover:bg-[#14211f] hover:text-white"
            onClick={logout}
          >
            Logout
          </button>
        </nav>

        <div className="py-6">
          <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#0f766e]">
                Admin Dashboard
              </p>
              <h1 className="mt-3 text-3xl font-semibold sm:text-4xl">
                Live vote count
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-[#52615d]">
                Results refresh in real time when ballots are submitted.
              </p>
            </div>
            <div className="inline-flex animate-pulse items-center gap-2 self-start rounded-full border border-[#bce7d3] bg-[#effcf6] px-4 py-2 text-sm font-medium text-[#14513d] lg:self-auto">
              <span className="h-2.5 w-2.5 rounded-full bg-[#0f766e] shadow-[0_0_0_6px_rgba(15,118,110,0.12)]" />
              Live updates on
            </div>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="flex min-h-28 flex-col justify-between rounded-lg border border-[#d8e0db] border-t-[#0f766e] border-t-4 bg-white p-4 shadow-sm">
              <span className="text-sm text-[#52615d]">Total votes</span>
              <strong className="mt-2 block text-3xl">{results.totalVotes}</strong>
            </div>
            <div className="flex min-h-28 flex-col justify-between rounded-lg border border-[#d8e0db] border-t-[#4d6f91] border-t-4 bg-white p-4 shadow-sm">
              <span className="text-sm text-[#52615d]">Leading party</span>
              <strong className="mt-2 block truncate text-2xl">
                {leader ? leader.abbreviation : "-"}
              </strong>
            </div>
            <div className="flex min-h-28 flex-col justify-between rounded-lg border border-[#d8e0db] border-t-[#b45309] border-t-4 bg-white p-4 shadow-sm">
              <span className="text-sm text-[#52615d]">Lead margin</span>
              <strong className="mt-2 block text-3xl">{margin}</strong>
            </div>
            <div className="flex min-h-28 flex-col justify-between rounded-lg border border-[#d8e0db] border-t-[#2563eb] border-t-4 bg-white p-4 shadow-sm">
              <span className="text-sm text-[#52615d]">Parties with votes</span>
              <strong className="mt-2 block text-3xl">{activeParties}</strong>
            </div>
          </div>

          <div className="mt-6 space-y-5">
            <div className="rounded-lg border border-[#d8e0db] bg-white p-5 shadow-lg shadow-[#0f766e]/10">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-xl font-semibold">Vote Share Chart</h2>
                  <p className="mt-1 text-sm text-[#52615d]">
                    Live share, ranking, and vote totals in one view.
                  </p>
                </div>
                <span className="rounded-md bg-[#f3f7ff] px-3 py-2 text-sm font-medium text-[#243f6b]">
                  {rankedNominees.length} parties
                </span>
              </div>

              <div className="mt-6">
                {isResultsLoading ? (
                  <p className="py-10 text-center text-[#52615d]">Loading results...</p>
                ) : rankedNominees.length === 0 ? (
                  <p className="py-10 text-center text-[#52615d]">No parties found.</p>
                ) : (
                  <div className="grid gap-6 lg:grid-cols-[22rem_1fr] lg:items-stretch">
                    <div className="flex h-full flex-col justify-between rounded-lg border border-[#d8e0db] bg-[#f8fbfa] p-5">
                      <div className="relative mx-auto flex aspect-square w-full max-w-[17rem] items-center justify-center">
                        <svg
                          aria-label="Vote share pie chart"
                          className="absolute inset-0 h-full w-full -rotate-90 drop-shadow-sm"
                          role="img"
                          viewBox="0 0 100 100"
                        >
                          <circle
                            className="text-[#e7eee9]"
                            cx="50"
                            cy="50"
                            fill="none"
                            r="40"
                            stroke="currentColor"
                            strokeWidth="18"
                          />
                          {pieSegments
                            .filter((segment) => segment.nominee.voteCount > 0)
                            .map((segment) => (
                              <circle
                                className="cursor-pointer transition-all duration-200 hover:opacity-80"
                                cx="50"
                                cy="50"
                                fill="none"
                                key={segment.nominee.id}
                                onMouseEnter={() => setHoveredParty(segment.nominee)}
                                onMouseLeave={() => setHoveredParty(null)}
                                pathLength="100"
                                r="40"
                                stroke={segment.color}
                                strokeDasharray={`${segment.share} ${100 - segment.share}`}
                                strokeDashoffset={-segment.start}
                                strokeLinecap="butt"
                                strokeWidth="18"
                              >
                                <title>
                                  {segment.nominee.abbreviation} - {segment.percent}% (
                                  {segment.nominee.voteCount} votes)
                                </title>
                              </circle>
                            ))}
                        </svg>
                        <div className="absolute inset-8 rounded-full bg-white shadow-sm" />
                        <div className="relative max-w-36 text-center">
                          <span className="block truncate text-sm font-medium text-[#52615d]">
                            {hoveredParty ? hoveredParty.fullName : "Total votes"}
                          </span>
                          <strong className="block truncate text-4xl">
                            {hoveredParty ? hoveredParty.abbreviation : results.totalVotes}
                          </strong>
                        </div>
                      </div>

                      <div className="mt-5 rounded-md bg-white p-4 shadow-sm">
                        <span className="text-xs font-semibold uppercase tracking-[0.16em] text-[#0f766e]">
                          Current leader
                        </span>
                        <div className="mt-3 flex items-center justify-between gap-3">
                          <span className="min-w-0">
                            <strong className="block truncate text-2xl">
                              {leader ? leader.abbreviation : "-"}
                            </strong>
                            <span className="block truncate text-sm text-[#52615d]">
                              {leader ? leader.fullName : "No votes yet"}
                            </span>
                          </span>
                          <span className="rounded-md bg-[#eefcf8] px-3 py-2 text-right">
                            <strong className="block text-xl">
                              {leader ? leader.voteCount : 0}
                            </strong>
                            <span className="text-xs text-[#52615d]">votes</span>
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="h-full overflow-hidden rounded-lg border border-[#d8e0db] bg-white">
                      <div className="hidden grid-cols-[3rem_1fr_auto] bg-[#f8fbfa] px-4 py-3 text-xs font-semibold uppercase tracking-[0.08em] text-[#52615d] sm:grid">
                        <span>Rank</span>
                        <span>Party</span>
                        <span>Share</span>
                      </div>
                      <div className="max-h-[31rem] overflow-y-auto">
                        {pieSegments.map((segment, index) => {
                          const isLeader = index === 0 && segment.nominee.voteCount > 0;

                          return (
                            <div
                              className={`border-t border-[#edf2ef] px-4 py-3 ${
                                isLeader ? "bg-[#eefcf8]" : "bg-white"
                              }`}
                              key={segment.nominee.id}
                            >
                              <div className="grid grid-cols-[2.5rem_1fr] items-center gap-3 sm:grid-cols-[3rem_1fr_auto]">
                                <span className="font-semibold text-[#52615d]">
                                  #{index + 1}
                                </span>
                                <span className="flex min-w-0 items-center gap-3">
                                  <span
                                    className="h-4 w-4 shrink-0 rounded-full"
                                    style={{ backgroundColor: segment.color }}
                                  />
                                  <span className="min-w-0">
                                    <span className="flex min-w-0 items-center gap-2">
                                      <strong className="truncate">
                                        {segment.nominee.abbreviation}
                                      </strong>
                                      {isLeader ? (
                                        <span className="shrink-0 rounded-full bg-[#0f766e] px-2 py-1 text-xs text-white">
                                          Leading
                                        </span>
                                      ) : null}
                                    </span>
                                    <span className="block truncate text-sm text-[#52615d]">
                                      {segment.nominee.fullName}
                                    </span>
                                  </span>
                                </span>
                                <span className="col-start-2 text-left sm:col-start-auto sm:text-right">
                                  <strong className="mr-2 text-2xl sm:mr-0 sm:block">
                                    {segment.percent}%
                                  </strong>
                                  <span className="text-xs text-[#52615d]">
                                    {segment.nominee.voteCount} votes
                                  </span>
                                </span>
                              </div>
                              <div className="mt-3 h-2 overflow-hidden rounded-full bg-[#e7eee9]">
                                <span
                                  className="block h-full rounded-full"
                                  style={{
                                    backgroundColor: segment.color,
                                    width: `${Math.max(segment.percent, segment.nominee.voteCount > 0 ? 6 : 0)}%`,
                                  }}
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

          </div>

        </div>
      </section>
    </main>
  );
}
