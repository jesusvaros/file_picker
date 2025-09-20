"use client";

import React, { useState, useCallback } from "react";
import { ArrowUpAZ, ArrowDownZA, Calendar, CalendarDays } from "lucide-react";

export type SortKey = "name" | "date";
export type SortDirection = "asc" | "desc";

export type SortState = {
  key: SortKey;
  direction: SortDirection;
};

export type SortOption = {
  key: SortKey;
  direction: SortDirection;
  label: string;
  icon: React.ReactNode;
};

const SORT_OPTIONS: SortOption[] = [
  { 
    key: "name", 
    direction: "asc", 
    label: "Name A-Z", 
    icon: React.createElement(ArrowUpAZ, { className: "h-4 w-4" }) 
  },
  { 
    key: "name", 
    direction: "desc", 
    label: "Name Z-A", 
    icon: React.createElement(ArrowDownZA, { className: "h-4 w-4" }) 
  },
  { 
    key: "date", 
    direction: "desc", 
    label: "Date (Newest)", 
    icon: React.createElement(Calendar, { className: "h-4 w-4" }) 
  },
  { 
    key: "date", 
    direction: "asc", 
    label: "Date (Oldest)", 
    icon: React.createElement(CalendarDays, { className: "h-4 w-4" }) 
  },
];

export function useSortState(initialSort: SortState = { key: "name", direction: "asc" }) {
  const [currentSort, setCurrentSort] = useState<SortState>(initialSort);

  const cycleSortState = useCallback(() => {
    const currentIndex = SORT_OPTIONS.findIndex(
      (option) => option.key === currentSort.key && option.direction === currentSort.direction
    );
    const nextIndex = (currentIndex + 1) % SORT_OPTIONS.length;
    const nextOption = SORT_OPTIONS[nextIndex];
    
    setCurrentSort({
      key: nextOption.key,
      direction: nextOption.direction,
    });
  }, [currentSort]);

  const currentOption = SORT_OPTIONS.find(
    (option) => option.key === currentSort.key && option.direction === currentSort.direction
  ) ?? SORT_OPTIONS[0];

  return {
    sortState: currentSort,
    currentOption,
    cycleSortState,
    setSortState: setCurrentSort,
  };
}
