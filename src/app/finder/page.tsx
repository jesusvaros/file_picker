"use client";

import { MacWindow } from "@/components/MacWindow";
import { ResourceList } from "@/components/ResourceList";
import { useState } from "react";
import { useConnectionId } from "../hooks/useConnections";

export default function Page() {
  const { connectionId, orgId, isPending: loadingConn, error: connError } = useConnectionId();

  const [page, setPage] = useState<string | null>(null);

  return (
    <main 
      className="h-screen p-8 flex items-center justify-center bg-cover bg-center bg-no-repeat overflow-hidden"
      style={{
        backgroundImage: "url('https://upload.wikimedia.org/wikipedia/en/2/27/Bliss_%28Windows_XP%29.png')"
      }}
    >
      <MacWindow>
        <div className="p-6 pt-2 space-y-4">

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

