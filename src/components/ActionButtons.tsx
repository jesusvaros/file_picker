import { Button } from "@/components/ui/button";

interface ActionButtonsProps {
  onStartIndexing: () => void;
  isSearchActive: boolean;
}

export function ActionButtons({
  onStartIndexing,
  isSearchActive,
}: ActionButtonsProps) {
  return (
    <div
      className={`transition-all duration-300 ease-in-out ${
        isSearchActive
          ? "pointer-events-none -translate-x-6 scale-95 opacity-0"
          : "translate-x-0 scale-100 opacity-100"
      } `}
    >
      <Button
        size="lg"
        variant="default"
        onClick={onStartIndexing}
        className="cursor-pointer rounded-xl bg-blue-500 px-4 py-2 hover:bg-blue-600"
      >
        Start Indexing
      </Button>
    </div>
  );
}
