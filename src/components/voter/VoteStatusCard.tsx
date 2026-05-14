import type { Nominee } from "./types";

type VoteStatusCardProps = {
  hasVoted: boolean;
  nomineesCount: number;
  selectedParty?: Nominee;
};

export function VoteStatusCard({
  hasVoted,
  nomineesCount,
  selectedParty,
}: VoteStatusCardProps) {
  return (
    <div className="rounded-md border border-[#d8e0db] bg-white px-4 py-3 text-sm shadow-sm">
      <span className="block font-semibold text-[#14211f]">
        {hasVoted ? "Vote recorded" : "Ballot ready"}
      </span>
      <span className="text-[#52615d]">
        {hasVoted && selectedParty
          ? `Selected: ${selectedParty.abbreviation}`
          : `${nomineesCount} parties listed`}
      </span>
    </div>
  );
}

