export function DemoBadge({ className = "" }: { className?: string }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border border-amber-300/70 bg-amber-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-amber-800 ${className}`}
      title="This is a demo storefront. No real orders or payments are processed."
    >
      <span className="h-1.5 w-1.5 rounded-full bg-amber-500" aria-hidden />
      Demo
    </span>
  );
}
