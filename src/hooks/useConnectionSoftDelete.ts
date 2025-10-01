"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import type { Paginated } from "@/domain/pagination";
import type { Resource } from "@/domain/resource";
import { useHiddenResources } from "@/hooks/useHiddenResources";

export const queryKeyBaseChildren = "connection-children";

export function useConnectionSoftDelete({
  connectionId,
  page,
}: {
  connectionId: string;
  page?: string | null;
}) {
  const qc = useQueryClient();
  const { updateHiddenSet } = useHiddenResources(connectionId);

  return useMutation({
    mutationFn: async ({
      resourceId,
      parentResourceId,
    }: {
      resourceId: string;
      parentResourceId?: string;
    }) => ({ resourceId, parentResourceId }),

    onMutate: async ({
      resourceId,
      parentResourceId,
    }: {
      resourceId: string;
      parentResourceId?: string;
    }) => {
      const key = [queryKeyBaseChildren, connectionId, parentResourceId, page];
      await qc.cancelQueries({ queryKey: key });
      const prev = qc.getQueryData<Paginated<Resource>>(key);

      qc.setQueryData<Paginated<Resource>>(key, (old) =>
        old
          ? {
              ...old,
              data: old.data.filter((i) => i.resource_id !== resourceId),
            }
          : old,
      );

      updateHiddenSet((prev) => {
        prev.add(resourceId);
        return prev;
      });

      toast.success("Deleted successfully", {
        description: "The item has been removed from your view",
        duration: 3000,
      });

      return { prev, resourceId, parentResourceId };
    },

    onError: (_err, _vars, ctx) => {
      const key = [
        queryKeyBaseChildren,
        connectionId,
        ctx?.parentResourceId,
        page,
      ];
      if (ctx?.prev) qc.setQueryData(key, ctx.prev);
      if (ctx?.resourceId) {
        updateHiddenSet((prev) => {
          prev.delete(ctx.resourceId as string);
          return prev;
        });
      }

      toast.error("Failed to delete resource", {
        description: "Something went wrong. Please try again.",
        duration: 4000,
      });
    },
  });
}
