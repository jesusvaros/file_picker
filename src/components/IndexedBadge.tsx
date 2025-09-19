interface IndexedBadgeProps {
  onDelete: () => void;
  isDirectory?: boolean;
}

export function IndexedBadge({ onDelete, isDirectory = false }: IndexedBadgeProps) {
  return (
    <div className="relative inline-flex h-6 items-center overflow-hidden group">
      <div
        onClick={(e) => {
          if (isDirectory) return;
          e.stopPropagation();
          onDelete();
        }}
        className={`relative h-6 px-2 py-0 ${isDirectory ? 'w-24 cursor-default' : 'w-16 cursor-not-allowed'} flex items-center justify-center bg-blue-500 text-white text-xs rounded transition-colors duration-300 group-hover:bg-red-500 overflow-hidden`}
      >
        <span className="absolute inset-0 flex items-center justify-center transition-transform duration-300 group-hover:-translate-y-6 font-medium">
          Indexed
        </span>
        <span className="absolute inset-0 flex items-center justify-center translate-y-6 transition-transform duration-300 group-hover:translate-y-0 font-medium">
          {isDirectory ? "Not indexable" : "De-index"}
        </span>
      </div>
    </div>
  );
}
