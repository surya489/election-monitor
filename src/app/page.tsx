"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Nominee = {
  id: string;
  name: string;
  party: string;
  voteCount: number;
};

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000";

function getSessionId() {
  const existing = sessionStorage.getItem("vote-session-id");

  if (existing) {
    return existing;
  }

  const sessionId = crypto.randomUUID();
  sessionStorage.setItem("vote-session-id", sessionId);
  return sessionId;
}

export default function Home() {
  const [nominees, setNominees] = useState<Nominee[]>([]);
  const [selectedNominee, setSelectedNominee] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [hasVoted, setHasVoted] = useState(() =>
    typeof window === "undefined"
      ? false
      : sessionStorage.getItem("vote-submitted") === "true"
  );

  useEffect(() => {
    async function loadNominees() {
      try {
        const response = await fetch(`${API_URL}/api/nominees`);
        const data = await response.json();
        setNominees(data.nominees ?? []);
      } catch {
        setMessage("Unable to load nominees. Please try again.");
      } finally {
        setIsLoading(false);
      }
    }

    loadNominees();
  }, []);

  async function submitVote() {
    if (!selectedNominee) {
      setMessage("Please select a nominee before voting.");
      return;
    }

    setIsSubmitting(true);
    setMessage("");

    try {
      const response = await fetch(`${API_URL}/api/votes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nomineeId: selectedNominee,
          sessionId: getSessionId(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message ?? "Vote could not be submitted");
      }

      sessionStorage.setItem("vote-submitted", "true");
      setHasVoted(true);
      setMessage("Your vote has been recorded. Thank you.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Vote failed");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#f7f7f2] text-[#171717]">
      <section className="mx-auto flex min-h-screen w-full max-w-5xl flex-col px-5 py-6 sm:px-8">
        <nav className="flex items-center justify-between border-b border-[#d7d2c5] pb-4">
          <Link className="text-xl font-semibold" href="/">
            VoteFlow
          </Link>
          <Link
            className="rounded-md border border-[#171717] px-4 py-2 text-sm font-medium transition hover:bg-[#171717] hover:text-white"
            href="/admin"
          >
            Admin
          </Link>
        </nav>

        <div className="grid flex-1 items-center gap-10 py-10 lg:grid-cols-[0.82fr_1.18fr]">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#7b4f22]">
              Live Election Poll
            </p>
            <h1 className="mt-4 text-4xl font-semibold leading-tight sm:text-5xl">
              Cast your vote for one nominee.
            </h1>
            <p className="mt-5 max-w-xl text-base leading-7 text-[#55524b]">
              Each browser session can vote once. The admin dashboard receives
              updated totals as soon as votes are submitted.
            </p>
          </div>

          <div className="rounded-lg border border-[#d7d2c5] bg-white p-5 shadow-sm">
            <div className="mb-5 flex items-center justify-between gap-4">
              <h2 className="text-xl font-semibold">Nominees</h2>
              <span className="text-sm text-[#666158]">{nominees.length} listed</span>
            </div>

            {isLoading ? (
              <p className="py-10 text-center text-[#666158]">Loading nominees...</p>
            ) : (
              <div className="space-y-3">
                {nominees.map((nominee) => (
                  <label
                    className={`flex cursor-pointer items-center justify-between gap-4 rounded-md border p-4 transition ${
                      selectedNominee === nominee.id
                        ? "border-[#0f6b5f] bg-[#eef8f5]"
                        : "border-[#e5e0d5] hover:border-[#b9b1a2]"
                    } ${hasVoted ? "cursor-not-allowed opacity-70" : ""}`}
                    key={nominee.id}
                  >
                    <span>
                      <span className="block font-semibold">{nominee.name}</span>
                      <span className="text-sm text-[#666158]">{nominee.party}</span>
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
