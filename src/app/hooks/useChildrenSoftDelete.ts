"use client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
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
  page,                 
}: {
  connectionId: string;
  page?: string | null;
}) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({ resourceId, parentResourceId }: { resourceId: string; parentResourceId?: string }) => {
      return { resourceId, parentResourceId };
    },

    onMutate: async ({ resourceId, parentResourceId }: { resourceId: string; parentResourceId?: string }) => {
      const key = [queryKeyBase_children, connectionId, parentResourceId, page];
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

      toast.success("Deleted successfully", {
        description: "The item has been removed from your view",
        duration: 3000,
      });

      return { prev, resourceId, parentResourceId };
    },

    onError: (_err, _vars, ctx) => {
      const key = [queryKeyBase_children, connectionId, ctx?.parentResourceId, page];
      if (ctx?.prev) qc.setQueryData(key, ctx.prev);
      if (ctx?.resourceId) {
        const hidden = loadHiddenSet(connectionId);
        hidden.delete(ctx.resourceId);
        saveHiddenSet(connectionId, hidden);
      }
      
      toast.error("Failed to delete resource", {
        description: "Something went wrong. Please try again.",
        duration: 4000,
      });
    },
  });
}
