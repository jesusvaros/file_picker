"use client";

import Link from "next/link";
import { useConnectionId } from "./hooks/useConnections";

export default function Home() {
  const { connectionId, isPending, error } = useConnectionId();

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50 p-6">
      <div className="mx-auto max-w-4xl space-y-12 text-center">
        {/* Animated Title */}
        <div className="relative">
          <h1 className="text-8xl font-bold text-gray-800 drop-shadow-lg">
            {["F", "i", "l", "e", " ", "P", "i", "c", "k", "e", "r"].map(
              (letter, index) => (
                <span
                  key={index}
                  className={`inline-block animate-bounce ${letter === " " ? "mx-4" : ""}`}
                  style={{
                    animationDelay: `${index * 100}ms`,
                    color: `hsl(${220 + index * 15}, 70%, 50%)`,
                  }}
                >
                  {letter === " " ? "\u00A0" : letter}
                </span>
              ),
            )}
          </h1>

          {/* Moving shadow effect */}
          <div className="absolute inset-0 -z-10 translate-x-2 translate-y-2 transform text-8xl font-bold text-gray-400 opacity-20">
            <div className="animate-pulse">File Picker</div>
          </div>
        </div>

        {/* Subtitle */}
        <p className="animate-fade-in text-xl text-gray-600">
          Discover, organize, and manage your files with ease
        </p>

        {/* Status Messages */}
        {isPending && (
          <div className="flex items-center justify-center space-x-3">
            <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600"></div>
            <p className="text-lg text-gray-600">Connecting...</p>
          </div>
        )}

        {!isPending && error && (
          <div className="animate-shake rounded-lg border border-red-200 bg-red-50 p-4">
            <p className="font-medium text-red-600">
              Connection Error: {String(error)}
            </p>
          </div>
        )}

        {!isPending && !error && !connectionId && (
          <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4">
            <p className="font-medium text-yellow-700">
              No connection available
            </p>
          </div>
        )}

        {/* Animated Start Button */}
        {!isPending && !error && connectionId && (
          <div className="group animate-slide-in relative">
            <Link
              href="/finder"
              className="hover:shadow-3xl relative inline-flex transform items-center justify-center overflow-hidden rounded-full bg-gradient-to-r from-blue-500 via-purple-500 to-blue-600 px-12 py-6 text-2xl font-bold text-white shadow-2xl transition-all duration-300 group-hover:animate-pulse hover:scale-110"
            >
              {/* Animated background */}
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-700 opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>

              {/* Moving shine effect */}
              <div className="animate-shimmer absolute inset-0 -skew-x-12 bg-gradient-to-r from-transparent via-white to-transparent opacity-20"></div>

              {/* Button text */}
              <span className="relative z-10 flex items-center gap-6">
                <span>Start Exploring</span>
                <svg
                  className="mt-3 h-8 w-8 animate-bounce"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={3}
                    d="M13 7l5 5m0 0l-5 5m5-5H6"
                  />
                </svg>
              </span>
            </Link>
          </div>
        )}
      </div>

      {/* Custom CSS for additional animations */}
      <style jsx>{`
        @keyframes shimmer {
          0% {
            transform: translateX(-100%) skewX(-12deg);
          }
          100% {
            transform: translateX(200%) skewX(-12deg);
          }
        }

        @keyframes fade-in {
          0% {
            opacity: 0;
            transform: translateY(20px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
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
          0%,
          100% {
            transform: translateX(0);
          }
          25% {
            transform: translateX(-5px);
          }
          75% {
            transform: translateX(5px);
          }
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
