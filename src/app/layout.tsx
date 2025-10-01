import type { Metadata } from "next";
import { ReactNode, Suspense } from "react";
import "./globals.css";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "File Picker – StackAI Test",
  description: "A beautiful file picker interface for StackAI",
  keywords: ["file picker", "stackai", "files", "documents"],
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Suspense fallback={null}>
          <Providers>{children}</Providers>
        </Suspense>
      </body>
    </html>
  );
}
