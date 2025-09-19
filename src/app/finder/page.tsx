"use client";

import { Header } from "@/components/Header";
import { Pager } from "@/components/Pager";
import { ResourceList } from "@/components/ResourceList";
import { useState } from "react";
import { useChildren } from "../hooks/useChildren";
import { useConnectionId } from "../hooks/useConnections";

export default function Page() {
  const { connectionId, orgId, isPending: loadingConn, error: connError } = useConnectionId();

  const [page, setPage] = useState<string | null>(null);

  const { data, isPending, error, isFetching } = useChildren({
    connectionId: connectionId ?? undefined,
    page,
  });

  return (
    <main className="mx-auto max-w-4xl space-y-4 p-6">
      <Header fetching={isFetching} />

      {!connectionId && loadingConn && <p>Loading connections…</p>}
      {!connectionId && connError && (
        <p className="text-red-600">Error connections: {String(connError)}</p>
      )}

      {connectionId && orgId && (
        <>
          <ResourceList
            items={data?.data ?? []}
            isPending={isPending || isFetching}
            error={error}
            page={page}
            connectionId={connectionId}
            orgId={orgId}
          />
          <Pager
            page={page}
            nextPage={data?.next_cursor ?? null}
            onReset={() => setPage(null)}
            onNext={(c) => setPage(c)}
          />
        </>
      )}
    </main>
  );
}

