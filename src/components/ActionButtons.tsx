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
    <div className={`
      transition-all duration-300 ease-in-out
      ${isSearchActive 
        ? 'opacity-0 scale-95 -translate-x-6 pointer-events-none' 
        : 'opacity-100 scale-100 translate-x-0'
      }
    `}>
      <Button
        size="lg"
        variant="default"
        onClick={onStartIndexing}
        className="bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded-xl cursor-pointer"
      >
        Start Indexing
      </Button>
    </div>
  );
}
