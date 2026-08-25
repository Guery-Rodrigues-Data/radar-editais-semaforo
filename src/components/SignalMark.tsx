export function SignalMark({ className = "" }: { className?: string }) {
  return (
    <span
      aria-hidden
      className={`flex h-8 w-8 flex-col items-center justify-center gap-[3px] rounded-sm bg-ink p-1.5 ${className}`}
    >
      <span className="h-1 w-1 rounded-full bg-signal-red" />
      <span className="h-1 w-1 rounded-full bg-signal-amber" />
      <span className="h-1 w-1 rounded-full bg-signal-green" />
    </span>
  );
}
