import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { File, Folder, X } from "lucide-react";
import { useState } from "react";

interface FileIconProps {
  isDirectory: boolean;
  onDelete?: () => void;
  size?: number;
}

export function FileIcon({ isDirectory, onDelete, size = 20 }: FileIconProps) {
  const [isHovered, setIsHovered] = useState(false);

  const IconComponent = isDirectory ? Folder : File;

  return (
    <div
      className="relative inline-block cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <IconComponent
        size={size}
        className={`transition-colors duration-200 ${
          isDirectory
            ? "text-blue-500 hover:text-blue-600"
            : "text-gray-500 hover:text-gray-600"
        } `}
      />

      {/* Delete cross on hover */}
      {isHovered && onDelete && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                className="absolute -top-1 -right-1 z-10 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-white shadow-sm transition-all duration-200 hover:bg-red-600 hover:shadow-md"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete();
                }}
              >
                <X size={10} className="cursor-pointer" />
              </button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Delete {isDirectory ? "folder" : "file"}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
    </div>
  );
}
