"use client";

import { BreadcrumbNav, Crumb } from "@/components/BreadcrumbNav";
import { Header } from "@/components/Header";
import { Pager } from "@/components/Pager";
import { ResourceList } from "@/components/ResourceList";
import { useEffect, useMemo, useState } from "react";
import { useChildren } from "../hooks/useChildren";
import { useConnectionId } from "../hooks/useConnections";

export default function Page() {
  const { connectionId, orgId, isPending: loadingConn, error: connError, data: connections } = useConnectionId();

  const [breadcrumbs, setBreadcrumbs] = useState<
    { id: string; label: string }[]
  >([]);

  const currentResourceId = breadcrumbs[breadcrumbs.length - 1]?.id;

  const [page, setPage] = useState<string | null>(null);

  const { data, isPending, error, isFetching } = useChildren({
    connectionId: connectionId ?? undefined,
    currentResourceId: currentResourceId,
    page,
  });

  const crumbs: Crumb[] = useMemo(
    () => [{ id: undefined, label: "My Files" }, ...breadcrumbs],
    [breadcrumbs],
  );

  // Initialize state from localStorage on first mount
  useEffect(() => {
    try {
    // breadcrumbs
    const storedBc = localStorage.getItem("finder_breadcrumbs");
    if (storedBc) {
      const parsed = JSON.parse(storedBc) as { id: string; label: string }[];
      if (Array.isArray(parsed)) setBreadcrumbs(parsed);
    }

    // page
    const storedPage = localStorage.getItem("finder_page");
    if (storedPage) setPage(storedPage);
    } catch {}
  }, []);

  // Persist breadcrumbs to localStorage when it changes
  useEffect(() => {
    try {
      localStorage.setItem("finder_breadcrumbs", JSON.stringify(breadcrumbs));
    } catch {}
  }, [breadcrumbs]);

  // Persist page to localStorage when it changes
  useEffect(() => {
    try {
      if (page) localStorage.setItem("finder_page", page);
      else localStorage.removeItem("finder_page");
    } catch {}
  }, [page]);

  return (
    <main className="mx-auto max-w-4xl space-y-4 p-6">
      <Header fetching={isFetching} />

      {!connectionId && loadingConn && <p>Loading connections…</p>}
      {!connectionId && connError && (
        <p className="text-red-600">Error connections: {String(connError)}</p>
      )}

      {connectionId && orgId && (
        <>
          <BreadcrumbNav
            crumbs={crumbs}
            setBreadcrumbs={setBreadcrumbs}
            setPage={setPage}
          />
          <ResourceList
            items={data?.data ?? []}
            isPending={isPending || isFetching}
            error={error}
            breadcrumbs={breadcrumbs}
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

