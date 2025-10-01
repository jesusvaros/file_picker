import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, X } from "lucide-react";
import * as React from "react";

interface SearchControlProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  isSearchActive: boolean;
  onFocusChange?: (focused: boolean) => void;
}

export function SearchControl({
  searchQuery,
  onSearchChange,
  isSearchActive,
  onFocusChange,
}: SearchControlProps) {
  const [showSearchInput, setShowSearchInput] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (isSearchActive) {
      setShowSearchInput(true);
    }
  }, [isSearchActive]);

  // Handle search button click
  const handleSearchClick = () => {
    setShowSearchInput(true);
    // Focus the input after animation starts
    setTimeout(() => {
      inputRef.current?.focus();
    }, 50);
  };

  // Handle search input blur
  const handleSearchBlur = () => {
    if (!searchQuery.trim()) {
      // Delay hiding to allow for smooth transition
      setTimeout(() => {
        setShowSearchInput(false);
      }, 150);
    }
  };

  // Handle clear search
  const handleClearSearch = () => {
    onSearchChange("");
    setTimeout(() => {
      setShowSearchInput(false);
    }, 150);
  };

  return (
    <div className="relative">
      <div
        className={`relative overflow-hidden rounded-md border transition-all duration-300 ease-in-out ${
          showSearchInput || searchQuery
            ? "bg-background w-64"
            : "bg-background hover:bg-accent w-8"
        } flex h-8 items-center`}
      >
        {/* Search Icon - always visible */}
        <div
          className={`absolute top-1/2 left-2 -translate-y-1/2 transition-all duration-300 ${showSearchInput || searchQuery ? "opacity-50" : "cursor-pointer opacity-100"} `}
          onClick={
            !showSearchInput && !searchQuery ? handleSearchClick : undefined
          }
        >
          <Search className="h-4 w-4" />
        </div>

        {/* Input Field - slides in */}
        <Input
          ref={inputRef}
          placeholder="Search files and folders..."
          value={searchQuery}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            onSearchChange(e.target.value)
          }
          onFocus={() => onFocusChange?.(true)}
          onBlur={() => {
            onFocusChange?.(false);
            handleSearchBlur();
          }}
          className={`absolute inset-0 flex h-full items-center border-0 bg-transparent pr-8 pl-8 transition-all duration-300 ${
            showSearchInput || searchQuery
              ? "pointer-events-auto opacity-100"
              : "pointer-events-none opacity-0"
          } `}
        />

        {/* Clear Button - appears when there's content */}
        {(showSearchInput || searchQuery) && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearSearch}
            className={`absolute top-1/2 right-1 h-6 w-6 -translate-y-1/2 rounded-full p-0 transition-all duration-200 hover:bg-gray-100 ${searchQuery ? "opacity-100" : "opacity-50"} `}
            title={searchQuery ? "Clear search and close" : "Close search"}
          >
            <X className="h-3 w-3" />
          </Button>
        )}
      </div>
    </div>
  );
}
