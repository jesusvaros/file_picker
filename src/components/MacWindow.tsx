import { toast } from "sonner";

interface MacWindowProps {
  children: React.ReactNode;
  fetching?: boolean;
}

export function MacWindow({ children, fetching = false }: MacWindowProps) {
  return (
    <div className="w-full max-w-6xl bg-white rounded-xl shadow-2xl overflow-hidden border border-gray-300">
      {/* Window Title Bar */}
      <div className="bg-gradient-to-b from-gray-200 to-gray-300 border-b border-gray-400 px-4 py-3 flex items-center">
        {/* Traffic Light Buttons */}
        <div className="flex items-center space-x-2">
          <div 
            className="w-3 h-3 bg-red-500 rounded-full shadow-sm hover:bg-red-600 cursor-pointer transition-colors"
            onClick={() => toast.error("Goodbye! 👋", {
              description: "Are you sure you want to leave this amazing file picker?",
              duration: 3000,
            })}
          >
            <div className="w-full h-full rounded-full bg-gradient-to-br from-red-400 to-red-600"></div>
          </div>
          <div 
            className="w-3 h-3 bg-yellow-500 rounded-full shadow-sm hover:bg-yellow-600 cursor-pointer transition-colors"
            onClick={() => toast("Why would you minimize the file picker? 🤔", {
              description: "I mean... we're just getting to know each other!",
              duration: 4000,
            })}
          >
            <div className="w-full h-full rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600"></div>
          </div>
          <div 
            className="w-3 h-3 bg-green-500 rounded-full shadow-sm hover:bg-green-600 cursor-pointer transition-colors"
            onClick={() => toast.success("Now we're talking! 🚀", {
              description: "More space for all your beautiful files!",
              duration: 3000,
            })}
          >
            <div className="w-full h-full rounded-full bg-gradient-to-br from-green-400 to-green-600"></div>
          </div>
        </div>
        
        {/* Window Title - Empty for clean look */}
        <div className="flex-1"></div>
        
        {/* Header Status */}
        <div className="text-xs opacity-60 text-gray-700">
          {fetching ? "Refreshing…" : "Ready"}
        </div>
      </div>

      {/* Window Content */}
      <div className="bg-white h-[700px] overflow-y-auto">
        {children}
      </div>
    </div>
  );
}
