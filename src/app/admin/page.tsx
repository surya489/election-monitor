"use client";

import type { FormEvent } from "react";
import { useEffect, useMemo, useState } from "react";
import { io, type Socket } from "socket.io-client";
import { AdminDashboardHeader } from "@/components/admin/AdminDashboardHeader";
import { AdminLogin } from "@/components/admin/AdminLogin";
import { AdminShell } from "@/components/admin/AdminShell";
import { ResultsSummary } from "@/components/admin/ResultsSummary";
import { VoteShareChart, type PieSegment } from "@/components/admin/VoteShareChart";
import type {
  ElectionResults,
  ResultNominee,
  Toast,
} from "@/components/admin/types";

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

function createPieSegments(
  rankedNominees: ResultNominee[],
  totalVotes: number
): PieSegment[] {
  return rankedNominees.map((nominee, index) => {
    const previousVotes = rankedNominees
      .slice(0, index)
      .reduce((sum, item) => sum + item.voteCount, 0);
    const start = totalVotes === 0 ? 0 : (previousVotes / totalVotes) * 100;
    const share = totalVotes === 0 ? 0 : (nominee.voteCount / totalVotes) * 100;

    return {
      nominee,
      color: CHART_COLORS[index % CHART_COLORS.length],
      percent: Math.round(share),
      share,
      start,
    };
  });
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
    () => createPieSegments(rankedNominees, results.totalVotes),
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
      <AdminShell className="px-5 py-8" toast={toast}>
        <AdminLogin
          email={email}
          isLoading={isLoading}
          onEmailChange={setEmail}
          onPasswordChange={setPassword}
          onSubmit={login}
          onTogglePassword={() => setShowPassword((current) => !current)}
          password={password}
          showPassword={showPassword}
        />
      </AdminShell>
    );
  }

  return (
    <AdminShell onLogout={logout} showNav toast={toast}>
      <div className="py-6">
        <AdminDashboardHeader />
        <ResultsSummary
          activeParties={activeParties}
          leader={leader}
          margin={margin}
          totalVotes={results.totalVotes}
        />
        <VoteShareChart
          hoveredParty={hoveredParty}
          isLoading={isResultsLoading}
          leader={leader}
          onHoverParty={setHoveredParty}
          partiesCount={rankedNominees.length}
          pieSegments={pieSegments}
          totalVotes={results.totalVotes}
        />
      </div>
    </AdminShell>
  );
}
