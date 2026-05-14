type StatCardProps = {
  accentColor: string;
  label: string;
  value: string | number;
  valueClassName?: string;
};

export function StatCard({
  accentColor,
  label,
  value,
  valueClassName = "text-3xl",
}: StatCardProps) {
  return (
    <div
      className="flex min-h-28 flex-col justify-between rounded-lg border border-[#d8e0db] border-t-4 bg-white p-4 shadow-sm"
      style={{ borderTopColor: accentColor }}
    >
      <span className="text-sm text-[#52615d]">{label}</span>
      <strong className={`mt-2 block truncate ${valueClassName}`}>{value}</strong>
    </div>
  );
}

