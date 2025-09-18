"use client";

import { BreadcrumbNav, Crumb } from "@/components/BreadcrumbNav";
import { Header } from "@/components/Header";
import { Pager } from "@/components/Pager";
import { ResourceList } from "@/components/ResourceList";
import { useEffect, useMemo, useState } from "react";
import { useChildren, useConnections } from "../hooks/useChildren";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

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
    () => [{ id: undefined, label: "My Files" }, ...breadcrumbs],
    [breadcrumbs],
  );

  // URL sync: initialize state from URL and keep URL updated with state changes
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Initialize from URL on first mount
  useEffect(() => {
    try {
      const bcParam = searchParams.get("bc");
      if (bcParam) {
        const parsed = JSON.parse(bcParam) as { id: string; label: string }[];
        if (Array.isArray(parsed)) {
          setBreadcrumbs(parsed);
        }
      }
    } catch {
      // ignore malformed bc param
    }
    const p = searchParams.get("page");
    if (p) setPage(p);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Push state to URL whenever breadcrumbs or page change
  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());
    if (breadcrumbs.length > 0) {
      params.set("bc", JSON.stringify(breadcrumbs));
    } else {
      params.delete("bc");
    }
    if (page) {
      params.set("page", page);
    } else {
      params.delete("page");
    }
    router.replace(`${pathname}?${params.toString()}`);
  }, [breadcrumbs, page, pathname, router, searchParams]);

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
            isPending={isPending || isFetching}
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

