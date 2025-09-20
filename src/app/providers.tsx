"use client";

import { Toaster } from "@/components/ui/sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Analytics } from "@vercel/analytics/next";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

type AppContextType = {
  kbId: string | null;
  setKbId: (id: string | null) => void;
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export function Providers({ children }: { children: ReactNode }) {
  const [client] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60_000,
            gcTime: 5 * 60_000,
            refetchOnWindowFocus: false,
          },
        },
      }),
  );
  const [kbId, setKbIdState] = useState<string | null>(null);

  useEffect(() => {
    try {
      const id = localStorage.getItem("knowledge_base_id");
      if (id) setKbIdState(id);
    } catch {}
  }, []);

  const setKbId = useCallback((id: string | null) => {
    setKbIdState(id);
    try {
      if (id) localStorage.setItem("knowledge_base_id", id);
      else localStorage.removeItem("knowledge_base_id");
    } catch {}
  }, []);

  return (
    <QueryClientProvider client={client}>
      <Analytics />
      <AppContext.Provider value={{ kbId, setKbId }}>
        {children}
      </AppContext.Provider>
      <Toaster />
    </QueryClientProvider>
  );
}

export const useAppContext = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useAppContext must be used within a Providers");
  return ctx;
};
