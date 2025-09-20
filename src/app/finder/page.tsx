"use client";

import { MacWindow } from "@/components/MacWindow";
import { ResourceList } from "@/components/ResourceList";
import { useState } from "react";
import { useConnectionId } from "../hooks/useConnections";

export default function Page() {
  const {
    connectionId,
    orgId,
    isPending: loadingConn,
    error: connError,
  } = useConnectionId();

  const [page, setPage] = useState<string | null>(null);

  return (
    <main
      className="flex h-screen items-center justify-center overflow-hidden bg-cover bg-center bg-no-repeat p-8"
      style={{
        backgroundImage:
          "url('https://upload.wikimedia.org/wikipedia/en/2/27/Bliss_%28Windows_XP%29.png')",
      }}
    >
      <MacWindow>
        <div className="space-y-4 p-6 pt-2">
          {!connectionId && loadingConn && (
            <div className="flex items-center justify-center py-12">
              <div className="flex items-center space-x-3">
                <div className="h-6 w-6 animate-spin rounded-full border-b-2 border-blue-600"></div>
                <p className="text-gray-600">Loading connections…</p>
              </div>
            </div>
          )}

          {!connectionId && connError && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-4">
              <p className="font-medium text-red-600">
                Error connections: {String(connError)}
              </p>
            </div>
          )}

          {connectionId && orgId && (
            <ResourceList
              page={page}
              connectionId={connectionId}
              orgId={orgId}
              onPageChange={setPage}
            />
          )}
        </div>
      </MacWindow>
    </main>
  );
}
