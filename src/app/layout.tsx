import './globals.css';
import type { Metadata } from 'next';
import { Providers } from './providers';
import { ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'File Picker – StackAI Test',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
