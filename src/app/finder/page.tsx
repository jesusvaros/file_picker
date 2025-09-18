"use client";

import { BreadcrumbNav, Crumb } from "@/components/BreadcrumbNav";
import { Header } from "@/components/Header";
import { Pager } from "@/components/Pager";
import { ResourceList } from "@/components/ResourceList";
import { useEffect, useMemo, useState } from "react";
import { useChildren, useConnectionId } from "../hooks/useChildren";
import { useKbId } from "../hooks/useKbId";

export default function Page() {
  const { connectionId, isPending: loadingConn, error: connError } = useConnectionId();
  const { kbId } = useKbId(connectionId);

  const [breadcrumbs, setBreadcrumbs] = useState<
    { id: string; label: string }[]
  >([]);

  const currentResourceId = breadcrumbs[breadcrumbs.length - 1]?.id;

  const [page, setPage] = useState<string | null>(null);

  const { data, isPending, error, isFetching } = useChildren({
    connectionId: connectionId ?? undefined,
    resourceId: currentResourceId,
    page,
  });

  const items = data?.data ?? [];

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

  // Persist state to localStorage when it changes
  useEffect(() => {
    try {
      localStorage.setItem("finder_breadcrumbs", JSON.stringify(breadcrumbs));
    } catch {}
  }, [breadcrumbs]);

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

      {connectionId && (
        <>
          <BreadcrumbNav
            crumbs={crumbs}
            setBreadcrumbs={setBreadcrumbs}
            setPage={setPage}
          />
          <ResourceList
            items={items}
            isPending={isPending || isFetching}
            error={error}
            parentResourcePath={breadcrumbs[breadcrumbs.length - 1]?.label ?? ""}
            kbId={kbId}
            page={page}
            onOpenFolder={(id, label) => {
              setBreadcrumbs((s) => [...s, { id, label }]);
              setPage(null);
            }}
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

