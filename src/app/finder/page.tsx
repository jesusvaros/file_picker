"use client";

import { useMemo, useState } from "react";
import { useChildren, useConnections } from "../hooks/useChildren";
import { Header } from "@/components/Header";
import { BreadcrumbNav, Crumb } from "@/components/BreadcrumbNav";
import { ResourceList } from "@/components/ResourceList";
import { Pager } from "@/components/Pager";

export default function Page() {
  const {
    data: connections,
    isPending: loadingConn,
    error: connError,
  } = useConnections();
  const connectionId = connections?.[0]?.connection_id;

  const [breadcrumbs, setBreadcrumbs] = useState<
    { id: string; label: string }[]
  >([]);
  const currentResourceId = breadcrumbs[breadcrumbs.length - 1]?.id;

  const [page, setPage] = useState<string | null>(null);

  const { data, isPending, error, isFetching } = useChildren({
    connectionId,
    resourceId: currentResourceId,
    page,
  });

  const items = data?.data ?? [];

  const crumbs: Crumb[] = useMemo(
    () => [{ id: undefined, label: "Root" }, ...breadcrumbs],
    [breadcrumbs],
  );

  return (
    <main className="mx-auto max-w-4xl space-y-4 p-6">
      <Header fetching={isFetching} />

      {loadingConn && <p>Loading connections…</p>}
      {connError && (
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
            isPending={isPending}
            error={error}
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
