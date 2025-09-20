"use client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { Paginated, Resource } from "../api/stackai/utils";
import { loadHiddenResourceIds, saveHiddenResourceIds } from "../api/stackai/utils";

export const queryKeyBase_children = "connection-children";

export function useConnectionSoftDelete({
  connectionId,
  page,
}: {
  connectionId: string;
  page?: string | null;
}) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({
      resourceId,
      parentResourceId,
    }: {
      resourceId: string;
      parentResourceId?: string;
    }) => {
      return { resourceId, parentResourceId };
    },

    onMutate: async ({
      resourceId,
      parentResourceId,
    }: {
      resourceId: string;
      parentResourceId?: string;
    }) => {
      const key = [queryKeyBase_children, connectionId, parentResourceId, page];
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

      const hidden = loadHiddenResourceIds(connectionId);
      hidden.add(resourceId);
      saveHiddenResourceIds(connectionId, hidden);

      toast.success("Deleted successfully", {
        description: "The item has been removed from your view",
        duration: 3000,
      });

      return { prev, resourceId, parentResourceId };
    },

    onError: (_err, _vars, ctx) => {
      const key = [
        queryKeyBase_children,
        connectionId,
        ctx?.parentResourceId,
        page,
      ];
      if (ctx?.prev) qc.setQueryData(key, ctx.prev);
      if (ctx?.resourceId) {
        const hidden = loadHiddenResourceIds(connectionId);
        hidden.delete(ctx.resourceId);
        saveHiddenResourceIds(connectionId, hidden);
      }

      toast.error("Failed to delete resource", {
        description: "Something went wrong. Please try again.",
        duration: 4000,
      });
    },
  });
}
