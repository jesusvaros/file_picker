"use client";

export function Header({ fetching }: { fetching: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <h1 className="text-2xl font-semibold">File Picker</h1>
      <div className="text-xs opacity-60">
        {fetching ? "Refreshing…" : "Ready"}
      </div>
    </div>
  );
}
