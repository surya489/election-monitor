"use client";

import type { FormEvent } from "react";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/shared/AppShell";
import type { Toast } from "@/components/shared/types";
import { BallotPanel } from "@/components/voter/BallotPanel";
import { VoterAuthPanel } from "@/components/voter/VoterAuthPanel";
import type { AuthMode, Nominee, User } from "@/components/voter/types";

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
  const [authMode, setAuthMode] = useState<AuthMode>("signup");
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

  function switchAuthMode(mode: AuthMode) {
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

  return (
    <AppShell onLogout={logout} showLogout={Boolean(user)} toast={toast}>
      {user ? (
        <BallotPanel
          hasVoted={hasVoted}
          isLoading={isLoading}
          isSubmitting={isSubmitting}
          nominees={nominees}
          onSelectNominee={setSelectedNominee}
          onSubmitVote={submitVote}
          selectedNominee={selectedNominee}
          selectedParty={selectedParty}
          user={user}
        />
      ) : (
        <VoterAuthPanel
          authMode={authMode}
          email={email}
          isSubmitting={isSubmitting}
          name={name}
          onAuthModeChange={switchAuthMode}
          onEmailChange={setEmail}
          onNameChange={setName}
          onPasswordChange={setPassword}
          onSubmit={authenticate}
          onTogglePassword={() => setShowPassword((current) => !current)}
          password={password}
          showPassword={showPassword}
        />
      )}
    </AppShell>
  );
}
