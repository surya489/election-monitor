import { NomineeOption } from "./NomineeOption";
import { VoteStatusCard } from "./VoteStatusCard";
import type { Nominee, User } from "./types";

type BallotPanelProps = {
  hasVoted: boolean;
  isLoading: boolean;
  isSubmitting: boolean;
  nominees: Nominee[];
  selectedNominee: string;
  selectedParty?: Nominee;
  user: User;
  onSelectNominee: (nomineeId: string) => void;
  onSubmitVote: () => void;
};

export function BallotPanel({
  hasVoted,
  isLoading,
  isSubmitting,
  nominees,
  selectedNominee,
  selectedParty,
  user,
  onSelectNominee,
  onSubmitVote,
}: BallotPanelProps) {
  return (
    <div className="flex-1 py-8">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#0f766e]">
            Tamil Nadu Election Poll
          </p>
          <h1 className="mt-3 text-3xl font-semibold text-[#14211f] sm:text-4xl">
            Welcome, {user.name}
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-[#52615d]">
            {hasVoted
              ? "Your vote is locked. You can review the party you selected below."
              : "Choose one party from the list and submit your vote."}
          </p>
        </div>
        <VoteStatusCard
          hasVoted={hasVoted}
          nomineesCount={nominees.length}
          selectedParty={selectedParty}
        />
      </div>

      <div className="rounded-lg border border-[#d8e0db] bg-white p-5 shadow-lg shadow-[#0f766e]/10 sm:p-6">
        {isLoading ? (
          <p className="py-10 text-center text-[#52615d]">Loading parties...</p>
        ) : (
          <div className="grid gap-3 xl:grid-cols-2">
            {nominees.map((nominee) => (
              <NomineeOption
                hasVoted={hasVoted}
                key={nominee.id}
                nominee={nominee}
                onSelect={onSelectNominee}
                selectedNominee={selectedNominee}
              />
            ))}
          </div>
        )}

        <button
          className="mt-6 h-12 w-full cursor-pointer rounded-md bg-[#14211f] px-5 font-semibold text-white transition hover:bg-[#24423d] disabled:cursor-not-allowed disabled:bg-[#9aa6a1]"
          disabled={isSubmitting || hasVoted || isLoading}
          onClick={onSubmitVote}
        >
          {hasVoted ? "Vote Submitted" : isSubmitting ? "Submitting..." : "Submit Vote"}
        </button>
      </div>
    </div>
  );
}

