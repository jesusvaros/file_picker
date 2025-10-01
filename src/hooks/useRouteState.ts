"use client";

import { useCallback, useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

export function useRouteState(key: string, fallback: string | null = null) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const value = useMemo(() => searchParams.get(key) ?? fallback, [
    searchParams,
    key,
    fallback,
  ]);

  const setValue = useCallback(
    (next: string | null | ((prev: string | null) => string | null)) => {
      const params = new URLSearchParams(searchParams.toString());
      const prev = searchParams.get(key) ?? fallback;
      const resolved =
        typeof next === "function" ? (next as (prev: string | null) => string | null)(prev) : next;

      if (resolved === null || resolved === undefined || resolved === "") {
        params.delete(key);
      } else {
        params.set(key, resolved);
      }

      const query = params.toString();
      router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
    },
    [searchParams, router, pathname, key, fallback],
  );

  return [value, setValue] as const;
}
