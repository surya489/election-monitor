import type { Nominee } from "./types";

type NomineeOptionProps = {
  hasVoted: boolean;
  nominee: Nominee;
  selectedNominee: string;
  onSelect: (nomineeId: string) => void;
};

export function NomineeOption({
  hasVoted,
  nominee,
  selectedNominee,
  onSelect,
}: NomineeOptionProps) {
  const isSelected = selectedNominee === nominee.id;

  return (
    <label
      className={`grid grid-cols-[3rem_1fr] items-center gap-3 rounded-md border p-4 transition sm:grid-cols-[3.5rem_1fr_auto] sm:gap-4 ${
        isSelected
          ? "border-[#0f766e] bg-[#eefcf8] shadow-sm"
          : "border-[#d8e0db] hover:border-[#91aaa2] hover:bg-[#fbfdfc]"
      } ${hasVoted ? "cursor-not-allowed opacity-75" : "cursor-pointer"}`}
    >
      <span className="flex h-14 w-14 items-center justify-center rounded-md bg-[#14211f] text-center text-xs font-bold leading-tight text-white">
        {nominee.symbol}
      </span>
      <span>
        <span className="flex flex-wrap items-center gap-2 font-semibold text-[#14211f]">
          {nominee.abbreviation}
          {hasVoted && isSelected ? (
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
        checked={isSelected}
        className="col-start-2 h-5 w-5 justify-self-end accent-[#0f766e] sm:col-start-auto sm:justify-self-auto"
        disabled={hasVoted}
        name="nominee"
        onChange={() => onSelect(nominee.id)}
        type="radio"
      />
    </label>
  );
}

