"use client";

import Link from "next/link";
import { useConnectionId } from "./hooks/useChildren";
import { useKbId } from "./hooks/useKbId";

export default function Home() {
  const { connectionId, isPending, error } = useConnectionId();

  const { kbId, loading, error: kbError } = useKbId(connectionId);

  return (
    <main className="p-6 space-y-4">
      <h1 className="text-xl font-semibold">Welcome</h1>
      {isPending && <p>Loading connection…</p>}
      {!isPending && error && (
        <p className="text-red-600">Error: {String(error)}</p>
      )}
      {!isPending && !error && !connectionId && (
        <p className="text-red-600">No connection available</p>
      )}
      {!isPending && !error && connectionId && (
        <>
          {loading && <p>Creating knowledge base…</p>}
          {!loading && kbError && (
            <p className="text-red-600">Error: {kbError.message}</p>
          )}
          {!loading && !kbError && (
            <>
              <p>Knowledge Base ID: {kbId}</p>
              <div>
                <Link href="/finder" className="underline">
                  Go to File Finder
                </Link>
              </div>
            </>
          )}
        </>
      )}
    </main>
  );
}

