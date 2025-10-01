"use client";

import { Component, type ErrorInfo, type ReactNode } from "react";

export type ErrorBoundaryProps = {
  fallback: ReactNode;
  children: ReactNode;
};

export type ErrorBoundaryState = {
  hasError: boolean;
  error?: Error;
};

export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    if (process.env.NODE_ENV !== "production") {
      console.error("Explorer boundary error", error, errorInfo);
    }
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }

    return this.props.children;
  }
}

export function ErrorFallback({ error }: { error?: Error }) {
  return (
    <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm">
      <p className="font-semibold text-red-600">Something went wrong</p>
      {error?.message && (
        <p className="mt-2 break-words text-red-500">{error.message}</p>
      )}
    </div>
  );
}
