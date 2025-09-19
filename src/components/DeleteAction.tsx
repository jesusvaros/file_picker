import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Trash2 } from "lucide-react";
import { useState } from "react";

interface DeleteActionProps {
  onDelete: () => void;
  isDirectory?: boolean;
  size?: "sm" | "md" | "lg";
}

export function DeleteAction({ onDelete, isDirectory = false, size = "sm" }: DeleteActionProps) {
  const [isHovered, setIsHovered] = useState(false);

  const sizeClasses = {
    sm: "h-8 w-8 text-xs",
    md: "h-10 w-10 text-sm", 
    lg: "h-12 w-12 text-base"
  };

  const iconSizes = {
    sm: 14,
    md: 16,
    lg: 18
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            className={`
              ${sizeClasses[size]}
              p-0 
              border-2 
              border-transparent 
              hover:border-red-200 
              hover:bg-red-50 
              hover:text-red-600
              transition-all 
              duration-200 
              rounded-lg
              hover:shadow-sm
              cursor-pointer
              flex
              items-center
              justify-center
            `}
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            <Trash2 
              size={iconSizes[size]} 
              className={`
                transition-all 
                duration-200 
                ${isHovered ? 'text-red-600' : 'text-gray-400'}
              `}
            />
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p>Delete {isDirectory ? 'folder' : 'file'}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
