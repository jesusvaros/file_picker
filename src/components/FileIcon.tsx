import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
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
        className={`
          transition-colors duration-200
          ${isDirectory 
            ? 'text-blue-500 hover:text-blue-600' 
            : 'text-gray-500 hover:text-gray-600'
          }
        `}
      />
      
      {/* Delete cross on hover */}
      {isHovered && onDelete && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                className="
                  absolute 
                  -top-1 
                  -right-1 
                  w-4 
                  h-4 
                  bg-red-500 
                  hover:bg-red-600 
                  text-white 
                  rounded-full 
                  flex 
                  items-center 
                  justify-center 
                  transition-all 
                  duration-200 
                  shadow-sm
                  hover:shadow-md
                  z-10
                "
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete();
                }}
              >
                <X size={10} className="cursor-pointer" />
              </button>
            </TooltipTrigger >
            <TooltipContent>
              <p>Delete {isDirectory ? 'folder' : 'file'}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
    </div>
  );
}
