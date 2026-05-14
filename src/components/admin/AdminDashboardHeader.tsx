export function AdminDashboardHeader() {
  return (
    <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#0f766e]">
          Admin Dashboard
        </p>
        <h1 className="mt-3 text-3xl font-semibold sm:text-4xl">Live vote count</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-[#52615d]">
          Results refresh in real time when ballots are submitted.
        </p>
      </div>
      <div className="inline-flex animate-pulse items-center gap-2 self-start rounded-full border border-[#bce7d3] bg-[#effcf6] px-4 py-2 text-sm font-medium text-[#14513d] lg:self-auto">
        <span className="h-2.5 w-2.5 rounded-full bg-[#0f766e] shadow-[0_0_0_6px_rgba(15,118,110,0.12)]" />
        Live updates on
      </div>
    </div>
  );
}

