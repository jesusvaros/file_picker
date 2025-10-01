"use client";

import { useCallback, useMemo } from "react";

import { useRouteState } from "@/hooks/useRouteState";

function parseHiddenState(param: string | null): Map<string, Set<string>> {
  const map = new Map<string, Set<string>>();
  if (!param) return map;

  const entries = param.split(";").filter(Boolean);
  for (const entry of entries) {
    const [connectionId, ids] = entry.split(":");
    if (!connectionId) continue;
    const idSet = new Set<string>();
    if (ids) {
      ids
        .split(",")
        .filter(Boolean)
        .forEach((id) => idSet.add(decodeURIComponent(id)));
    }
    map.set(decodeURIComponent(connectionId), idSet);
  }
  return map;
}

function serializeHiddenState(map: Map<string, Set<string>>): string {
  const parts: string[] = [];
  for (const [connectionId, ids] of map.entries()) {
    if (!ids.size) continue;
    const encodedIds = Array.from(ids)
      .map((id) => encodeURIComponent(id))
      .join(",");
    parts.push(`${encodeURIComponent(connectionId)}:${encodedIds}`);
  }
  return parts.join(";");
}

export function useHiddenResources(connectionId: string | undefined) {
  const [state, setState] = useRouteState("hidden");

  const hiddenSet = useMemo(() => {
    if (!connectionId) return new Set<string>();
    return parseHiddenState(state).get(connectionId) ?? new Set<string>();
  }, [connectionId, state]);

  const updateHiddenSet = useCallback(
    (updater: (prev: Set<string>) => Set<string>) => {
      setState((prev) => {
        const map = parseHiddenState(prev);
        if (!connectionId) return prev;
        const prevSet = map.get(connectionId) ?? new Set<string>();
        const nextSet = updater(new Set(prevSet));
        if (!nextSet.size) {
          map.delete(connectionId);
        } else {
          map.set(connectionId, nextSet);
        }
        const serialized = serializeHiddenState(map);
        return serialized || null;
      });
    },
    [connectionId, setState],
  );

  return {
    hiddenSet,
    updateHiddenSet,
  };
}
