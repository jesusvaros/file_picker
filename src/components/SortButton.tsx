import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { type SortOption } from "@/app/hooks/useSortState";

interface SortButtonProps {
  currentSortOption: SortOption;
  onSortClick: () => void;
  isSearchActive: boolean;
}

export function SortButton({
  currentSortOption,
  onSortClick,
  isSearchActive,
}: SortButtonProps) {
  return (
    <div
      className={`transition-all duration-300 ease-in-out ${
        isSearchActive
          ? "pointer-events-none -translate-x-4 scale-95 opacity-0"
          : "translate-x-0 scale-100 opacity-100"
      } `}
    >
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="outline"
            onClick={onSortClick}
            className="h-8 w-8 p-0 transition-all duration-200"
          >
            {currentSortOption.icon}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>{currentSortOption.label}</p>
        </TooltipContent>
      </Tooltip>
    </div>
  );
}
