"use client";

import { Button } from "@/components/ui/button";

export function Pager({
  page,
  nextPage,
  onReset,
  onNext,
}: {
  page: string | null;
  nextPage: string | null | undefined;
  onReset: () => void;
  onNext: (page: string | null) => void;
}) {
  const hasNext = Boolean(nextPage);

  if (!hasNext) return null;

  return (
    <div className="mt-3 flex items-center justify-between">
      <div className="text-xs opacity-60">Page: {page ?? "1"}</div>
      <div className="flex gap-2">
        {page && (
          <Button
            variant="outline"
            size="sm"
            onClick={onReset}
            disabled={!page}
            title="Reset page"
          >
            ⏮️ page 1
          </Button>
        )}
        <Button
          variant="default"
          size="lg"
          onClick={() => onNext(nextPage ?? null)}
          disabled={!hasNext}
        >
          Next Page ➡️
        </Button>
      </div>
    </div>
  );
}
