export function SuspenseFallback() {
  return (
    <div className="flex h-full items-center justify-center p-6">
      <div className="flex items-center gap-3 rounded-lg border border-muted-foreground/10 bg-white/60 px-4 py-3 shadow-sm backdrop-blur">
        <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
        <span className="text-sm text-muted-foreground">Loading view…</span>
      </div>
    </div>
  );
}
