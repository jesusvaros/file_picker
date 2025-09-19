"use client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { Paginated, Resource } from "../api/stackai/utils";

const hiddenKey = (connectionId: string) => `connection_hidden_ids:${connectionId}`;

export const queryKeyBase_children = "connection-children";

function loadHiddenSet(connectionId: string) {
  try {
    const raw = localStorage.getItem(hiddenKey(connectionId));
    const arr: string[] = raw ? JSON.parse(raw) : [];
    return new Set(arr);
  } catch {
    return new Set<string>();
  }
}

function saveHiddenSet(connectionId: string, set: Set<string>) {
  try {
    localStorage.setItem(hiddenKey(connectionId), JSON.stringify([...set]));
  } catch {}
}

export function useConnectionSoftDelete({
  connectionId,
  currentResourceId, 
  page,                 
}: {
  connectionId: string;
  currentResourceId?: string | null;
  page?: string | null;
}) {
  const qc = useQueryClient();
  const key = [queryKeyBase_children, connectionId, currentResourceId, page];

  return useMutation({
    mutationFn: async (resourceId: string) => {
      return resourceId;
    },

    onMutate: async (resourceId: string) => {
      await qc.cancelQueries({ queryKey: key });
      const prev = qc.getQueryData<Paginated<Resource>>(key);

      qc.setQueryData<Paginated<Resource>>(key, (old) =>
        old
          ? { ...old, data: old.data.filter((i) => i.resource_id !== resourceId) }
          : old
      );

      const hidden = loadHiddenSet(connectionId);
      hidden.add(resourceId);
      saveHiddenSet(connectionId, hidden);

      return { prev, resourceId };
    },

    onError: (_err, _vars, ctx) => {
      if (ctx?.prev) qc.setQueryData(key, ctx.prev);
      if (ctx?.resourceId) {
        const hidden = loadHiddenSet(connectionId);
        hidden.delete(ctx.resourceId);
        saveHiddenSet(connectionId, hidden);
      }
    },
  });
}
