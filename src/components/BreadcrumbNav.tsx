"use client";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import type { Dispatch, SetStateAction } from "react";

export type Crumb = { id?: string; label: string };

export function BreadcrumbNav({
  crumbs,
  setBreadcrumbs,
  setPage
}: {
  crumbs: Crumb[];
  setBreadcrumbs: Dispatch<SetStateAction<{ id: string; label: string }[]>>;
  setPage: Dispatch<SetStateAction<string | null>>;
}) {
      const goToCrumb = (index: number) => {
        if (index === 0) {
          setBreadcrumbs([]);
          setPage(null);
          return;
        }
        setBreadcrumbs((s) => s.slice(0, index));
        setPage(null);
      };
    
  return (
    <Breadcrumb>
      <BreadcrumbList>
        {crumbs.map((c, i) => {
          const isLast = i === crumbs.length - 1;
          return (
            <span key={`${c.id ?? "root"}-${i}`} className="flex items-center">
              <BreadcrumbItem>
                {isLast ? (
                  <BreadcrumbPage>{c.label}</BreadcrumbPage>
                ) : (
                  <BreadcrumbLink
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      goToCrumb(i);
                    }}
                    className="hover:underline"
                  >
                    {c.label}
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
              {!isLast && <BreadcrumbSeparator />}
            </span>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
}

