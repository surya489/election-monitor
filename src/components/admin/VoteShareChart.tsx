import type { ResultNominee } from "./types";

export type PieSegment = {
  color: string;
  nominee: ResultNominee;
  percent: number;
  share: number;
  start: number;
};

type VoteShareChartProps = {
  hoveredParty: ResultNominee | null;
  isLoading: boolean;
  leader?: ResultNominee;
  partiesCount: number;
  pieSegments: PieSegment[];
  totalVotes: number;
  onHoverParty: (nominee: ResultNominee | null) => void;
};

export function VoteShareChart({
  hoveredParty,
  isLoading,
  leader,
  partiesCount,
  pieSegments,
  totalVotes,
  onHoverParty,
}: VoteShareChartProps) {
  return (
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
            {partiesCount} parties
          </span>
        </div>

        <div className="mt-6">
          {isLoading ? (
            <p className="py-10 text-center text-[#52615d]">Loading results...</p>
          ) : pieSegments.length === 0 ? (
            <p className="py-10 text-center text-[#52615d]">No parties found.</p>
          ) : (
            <div className="grid gap-6 lg:grid-cols-[22rem_1fr] lg:items-stretch">
              <PieChartPanel
                hoveredParty={hoveredParty}
                leader={leader}
                onHoverParty={onHoverParty}
                pieSegments={pieSegments}
                totalVotes={totalVotes}
              />
              <RankingTable pieSegments={pieSegments} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function PieChartPanel({
  hoveredParty,
  leader,
  pieSegments,
  totalVotes,
  onHoverParty,
}: Omit<VoteShareChartProps, "isLoading" | "partiesCount">) {
  return (
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
                onMouseEnter={() => onHoverParty(segment.nominee)}
                onMouseLeave={() => onHoverParty(null)}
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
            {hoveredParty ? hoveredParty.abbreviation : totalVotes}
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
            <strong className="block text-xl">{leader ? leader.voteCount : 0}</strong>
            <span className="text-xs text-[#52615d]">votes</span>
          </span>
        </div>
      </div>
    </div>
  );
}

function RankingTable({ pieSegments }: { pieSegments: PieSegment[] }) {
  return (
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
                <span className="font-semibold text-[#52615d]">#{index + 1}</span>
                <span className="flex min-w-0 items-center gap-3">
                  <span
                    className="h-4 w-4 shrink-0 rounded-full"
                    style={{ backgroundColor: segment.color }}
                  />
                  <span className="min-w-0">
                    <span className="flex min-w-0 items-center gap-2">
                      <strong className="truncate">{segment.nominee.abbreviation}</strong>
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
                    width: `${Math.max(
                      segment.percent,
                      segment.nominee.voteCount > 0 ? 6 : 0
                    )}%`,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

