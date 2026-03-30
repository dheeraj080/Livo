import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from 'react-hot-toast';
import { ThemeProvider } from '@/components/ThemeProvider';

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Livo - Timeless Focus",
  description: "A premium productivity suite for clarity and achievement.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
          {children}
          <Toaster 
            position="bottom-right"
            toastOptions={{
                className: 'dark:bg-slate-900 dark:text-slate-100 dark:border dark:border-slate-800',
            }}
          />
        </ThemeProvider>
      </body>
    </html>
  );
}
