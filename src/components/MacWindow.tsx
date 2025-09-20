import { toast } from "sonner";

interface MacWindowProps {
  children: React.ReactNode;
}

export function MacWindow({ children }: MacWindowProps) {
  return (
    <div className="w-full max-w-6xl overflow-hidden rounded-xl border border-gray-300 bg-white shadow-2xl">
      {/* Window Title Bar */}
      <div className="flex items-center border-b border-gray-400 bg-gradient-to-b from-gray-200 to-gray-300 px-4 py-3">
        {/* Traffic Light Buttons */}
        <div className="flex items-center space-x-2">
          <div
            className="h-3 w-3 cursor-pointer rounded-full bg-red-500 shadow-sm transition-colors hover:bg-red-600"
            onClick={() =>
              toast.error("Goodbye! 👋", {
                description:
                  "Are you sure you want to leave this amazing file picker?",
                duration: 3000,
              })
            }
          >
            <div className="h-full w-full rounded-full bg-gradient-to-br from-red-400 to-red-600"></div>
          </div>
          <div
            className="h-3 w-3 cursor-pointer rounded-full bg-yellow-500 shadow-sm transition-colors hover:bg-yellow-600"
            onClick={() =>
              toast("Why would you minimize the file picker? 🤔", {
                description: "I mean... we're just getting to know each other!",
                duration: 4000,
              })
            }
          >
            <div className="h-full w-full rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600"></div>
          </div>
          <div
            className="h-3 w-3 cursor-pointer rounded-full bg-green-500 shadow-sm transition-colors hover:bg-green-600"
            onClick={() =>
              toast.success("Now we're talking! 🚀", {
                description: "More space for all your beautiful files!",
                duration: 3000,
              })
            }
          >
            <div className="h-full w-full rounded-full bg-gradient-to-br from-green-400 to-green-600"></div>
          </div>
        </div>

        {/* Window Title - Empty for clean look */}
        <div className="flex-1"></div>
      </div>

      {/* Window Content */}
      <div className="h-[700px] overflow-y-auto bg-white">{children}</div>
    </div>
  );
}
