"use client";

export function Header({ fetching }: { fetching: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <div className="text-xs opacity-60">
        {fetching ? "Refreshing…" : "Ready"}
      </div>
    </div>
  );
}
