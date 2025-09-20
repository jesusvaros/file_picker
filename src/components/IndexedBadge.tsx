interface IndexedBadgeProps {
  onDelete: () => void;
  isDirectory?: boolean;
}

export function IndexedBadge({
  onDelete,
  isDirectory = false,
}: IndexedBadgeProps) {
  return (
    <div className="group relative inline-flex h-6 items-center overflow-hidden">
      <div
        onClick={(e) => {
          if (isDirectory) return;
          e.stopPropagation();
          onDelete();
        }}
        className={`relative h-6 w-24 px-2 py-0 ${isDirectory ? "cursor-default" : "cursor-pointer"} flex items-center justify-center overflow-hidden rounded bg-blue-500 text-xs text-white transition-colors duration-300 group-hover:bg-red-500`}
      >
        <span className="absolute inset-0 flex items-center justify-center font-medium transition-transform duration-300 group-hover:-translate-y-6">
          Indexed
        </span>
        <span className="absolute inset-0 flex translate-y-6 items-center justify-center font-medium transition-transform duration-300 group-hover:translate-y-0">
          {isDirectory ? "Not indexable" : "De-index"}
        </span>
      </div>
    </div>
  );
}
