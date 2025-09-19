"use client";

import { MacWindow } from "@/components/MacWindow";
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
    <main 
      className="h-screen p-8 flex items-center justify-center bg-cover bg-center bg-no-repeat overflow-hidden"
      style={{
        backgroundImage: "url('https://upload.wikimedia.org/wikipedia/en/2/27/Bliss_%28Windows_XP%29.png')"
      }}
    >
      <MacWindow fetching={isFetching}>
        <div className="p-6 space-y-4">

          {!connectionId && loadingConn && (
            <div className="flex items-center justify-center py-12">
              <div className="flex items-center space-x-3">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                <p className="text-gray-600">Loading connections…</p>
              </div>
            </div>
          )}
          
          {!connectionId && connError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-600 font-medium">Error connections: {String(connError)}</p>
            </div>
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
        </div>
      </MacWindow>
    </main>
  );
}

