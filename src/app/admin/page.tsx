"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { io, type Socket } from "socket.io-client";

type ResultNominee = {
  id: string;
  name: string;
  party: string;
  voteCount: number;
};

type ElectionResults = {
  totalVotes: number;
  nominees: ResultNominee[];
};

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000";

export default function AdminPage() {
  const [email, setEmail] = useState("admin@voteflow.local");
  const [password, setPassword] = useState("admin123");
  const [token, setToken] = useState(() =>
    typeof window === "undefined" ? "" : localStorage.getItem("admin-token") ?? ""
  );
  const [results, setResults] = useState<ElectionResults>({
    totalVotes: 0,
    nominees: [],
  });
  const [status, setStatus] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const maxVotes = useMemo(
    () => Math.max(...results.nominees.map((nominee) => nominee.voteCount), 1),
    [results.nominees]
  );

  useEffect(() => {
    if (!token) {
      return;
    }

    let socket: Socket | undefined;

    async function loadResults() {
      try {
        const response = await fetch(`${API_URL}/api/results`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) {
          throw new Error("Admin session expired");
        }

        setResults(await response.json());
        socket = io(API_URL, {
          auth: { token },
          transports: ["websocket", "polling"],
        });
        socket.on("results:update", setResults);
      } catch (error) {
        setStatus(error instanceof Error ? error.message : "Unable to load results");
        localStorage.removeItem("admin-token");
        setToken("");
      }
    }

    loadResults();

    return () => {
      socket?.disconnect();
    };
  }, [token]);

  async function login() {
    setIsLoading(true);
    setStatus("");

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
      setStatus("Logged in as admin.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Login failed");
    } finally {
      setIsLoading(false);
    }
  }

  function logout() {
    localStorage.removeItem("admin-token");
    setToken("");
    setResults({ totalVotes: 0, nominees: [] });
  }

  if (!token) {
    return (
      <main className="min-h-screen bg-[#f7f7f2] px-5 py-8 text-[#171717]">
        <section className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-md flex-col justify-center">
          <Link className="mb-8 text-xl font-semibold" href="/">
            VoteFlow
          </Link>
          <div className="rounded-lg border border-[#d7d2c5] bg-white p-6 shadow-sm">
            <h1 className="text-2xl font-semibold">Admin Login</h1>
            <div className="mt-6 space-y-4">
              <label className="block">
                <span className="text-sm font-medium text-[#55524b]">Email</span>
                <input
                  className="mt-2 h-11 w-full rounded-md border border-[#d7d2c5] px-3 outline-none focus:border-[#0f6b5f]"
                  onChange={(event) => setEmail(event.target.value)}
                  value={email}
                />
              </label>
              <label className="block">
                <span className="text-sm font-medium text-[#55524b]">Password</span>
                <input
                  className="mt-2 h-11 w-full rounded-md border border-[#d7d2c5] px-3 outline-none focus:border-[#0f6b5f]"
                  onChange={(event) => setPassword(event.target.value)}
                  type="password"
                  value={password}
                />
              </label>
            </div>
            <button
              className="mt-6 h-11 w-full rounded-md bg-[#171717] font-semibold text-white transition hover:bg-[#333] disabled:bg-[#9b978e]"
              disabled={isLoading}
              onClick={login}
            >
              {isLoading ? "Signing in..." : "Sign In"}
            </button>
            {status ? <p className="mt-4 text-sm text-[#7b4f22]">{status}</p> : null}
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f7f7f2] text-[#171717]">
      <section className="mx-auto w-full max-w-6xl px-5 py-6 sm:px-8">
        <nav className="flex items-center justify-between border-b border-[#d7d2c5] pb-4">
          <Link className="text-xl font-semibold" href="/">
            VoteFlow
          </Link>
          <button
            className="rounded-md border border-[#171717] px-4 py-2 text-sm font-medium transition hover:bg-[#171717] hover:text-white"
            onClick={logout}
          >
            Logout
          </button>
        </nav>

        <div className="py-8">
          <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#7b4f22]">
                Admin Dashboard
              </p>
              <h1 className="mt-3 text-4xl font-semibold">Live vote count</h1>
            </div>
            <div className="rounded-lg border border-[#d7d2c5] bg-white px-6 py-4">
              <span className="text-sm text-[#666158]">Total Votes</span>
              <strong className="block text-4xl">{results.totalVotes}</strong>
            </div>
          </div>

          <div className="mt-8 grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
            <div className="rounded-lg border border-[#d7d2c5] bg-white p-5">
              <h2 className="text-xl font-semibold">Nominee Counts</h2>
              <div className="mt-5 divide-y divide-[#ede8dd]">
                {results.nominees.map((nominee) => (
                  <div
                    className="flex items-center justify-between gap-4 py-4"
                    key={nominee.id}
                  >
                    <span>
                      <span className="block font-semibold">{nominee.name}</span>
                      <span className="text-sm text-[#666158]">{nominee.party}</span>
                    </span>
                    <strong className="text-2xl">{nominee.voteCount}</strong>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-lg border border-[#d7d2c5] bg-white p-5">
              <h2 className="text-xl font-semibold">Vote Graph</h2>
              <div className="mt-6 space-y-5">
                {results.nominees.map((nominee) => {
                  const width = `${Math.max((nominee.voteCount / maxVotes) * 100, 4)}%`;

                  return (
                    <div key={nominee.id}>
                      <div className="mb-2 flex items-center justify-between gap-4 text-sm">
                        <span className="font-medium">{nominee.name}</span>
                        <span>{nominee.voteCount}</span>
                      </div>
                      <div className="h-8 rounded-md bg-[#eee8dc]">
                        <div
                          className="flex h-full items-center justify-end rounded-md bg-[#0f6b5f] pr-3 text-sm font-semibold text-white transition-all"
                          style={{ width }}
                        >
                          {nominee.voteCount}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {status ? <p className="mt-5 text-sm text-[#7b4f22]">{status}</p> : null}
        </div>
      </section>
    </main>
  );
}
