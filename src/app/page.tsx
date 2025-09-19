"use client";

import Link from "next/link";
import { useConnectionId } from "./hooks/useConnections";

export default function Home() {
  const { connectionId, isPending, error } = useConnectionId();

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-6">
      <div className="text-center space-y-12 max-w-4xl mx-auto">
        {/* Animated Title */}
        <div className="relative">
          <h1 className="text-8xl font-bold text-gray-800 drop-shadow-lg">
            {["F", "i", "l", "e", " ", "P", "i", "c", "k", "e", "r"].map((letter, index) => (
              <span 
                key={index}
                className={`inline-block animate-bounce ${letter === " " ? "mx-4" : ""}`}
                style={{ 
                  animationDelay: `${index * 100}ms`,
                  color: `hsl(${220 + index * 15}, 70%, 50%)`
                }}
              >
                {letter === " " ? "\u00A0" : letter}
              </span>
            ))}
          </h1>
          
          {/* Moving shadow effect */}
          <div className="absolute inset-0 text-8xl font-bold text-gray-400 opacity-20 -z-10 transform translate-x-2 translate-y-2">
            <div className="animate-pulse">File Picker</div>
          </div>
        </div>

        {/* Subtitle */}
        <p className="text-xl text-gray-600 animate-fade-in">
          Discover, organize, and manage your files with ease
        </p>

        {/* Status Messages */}
        {isPending && (
          <div className="flex items-center justify-center space-x-3">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="text-lg text-gray-600">Connecting...</p>
          </div>
        )}
        
        {!isPending && error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 animate-shake">
            <p className="text-red-600 font-medium">Connection Error: {String(error)}</p>
          </div>
        )}
        
        {!isPending && !error && !connectionId && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-yellow-700 font-medium">No connection available</p>
          </div>
        )}

        {/* Animated Start Button */}
        {!isPending && !error && connectionId && (
          <div className="relative group animate-slide-in">
            <Link 
              href="/finder" 
              className="relative inline-flex items-center justify-center px-12 py-6 text-2xl font-bold text-white bg-gradient-to-r from-blue-500 via-purple-500 to-blue-600 rounded-full shadow-2xl transform transition-all duration-300 hover:scale-110 hover:shadow-3xl group-hover:animate-pulse overflow-hidden"
            >
              {/* Animated background */}
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              
              {/* Moving shine effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-20 -skew-x-12 animate-shimmer"></div>
              
              {/* Button text */}
              <span className="relative z-10 flex items-center gap-6">
                <span>Start Exploring</span>
                <svg 
                  className="w-8 h-8 animate-bounce mt-3" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </span>
            </Link>
          </div>
        )}
      </div>

      {/* Custom CSS for additional animations */}
      <style jsx>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%) skewX(-12deg); }
          100% { transform: translateX(200%) skewX(-12deg); }
        }
        
        @keyframes fade-in {
          0% { opacity: 0; transform: translateY(20px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes slide-in {
          0% { 
            opacity: 0; 
            transform: translateY(30px); 
          }
          100% { 
            opacity: 1; 
            transform: translateY(0); 
          }
        }
        
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
        
        .animate-shimmer {
          animation: shimmer 2s infinite;
        }
        
        .animate-fade-in {
          animation: fade-in 1s ease-out;
        }
        
        .animate-slide-in {
          animation: slide-in 0.6s ease-out;
        }
        
        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }
      `}</style>
    </main>
  );
}

