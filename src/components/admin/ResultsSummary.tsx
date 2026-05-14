import { StatCard } from "./StatCard";
import type { ResultNominee } from "./types";

type ResultsSummaryProps = {
  activeParties: number;
  leader?: ResultNominee;
  margin: number;
  totalVotes: number;
};

export function ResultsSummary({
  activeParties,
  leader,
  margin,
  totalVotes,
}: ResultsSummaryProps) {
  return (
    <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard accentColor="#0f766e" label="Total votes" value={totalVotes} />
      <StatCard
        accentColor="#4d6f91"
        label="Leading party"
        value={leader ? leader.abbreviation : "-"}
        valueClassName="text-2xl"
      />
      <StatCard accentColor="#b45309" label="Lead margin" value={margin} />
      <StatCard accentColor="#2563eb" label="Parties with votes" value={activeParties} />
    </div>
  );
}

