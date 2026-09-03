import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { ERPProvider } from "@/components/providers/erp-provider";
import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import { Toaster } from "sonner";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Apex School ERP — Multi-Campus Management Platform",
  description:
    "Next-generation unified school management platform for multi-branch campuses, academics, HR, student records, fee collection, and biometric attendance.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased min-h-screen bg-background text-foreground flex`}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <ERPProvider>
            {/* Desktop Persistent Sidebar */}
            <div className="hidden lg:block shrink-0">
              <Sidebar />
            </div>

            {/* Main Application Column */}
            <div className="flex flex-col flex-1 min-w-0 min-h-screen overflow-x-hidden">
              <Topbar />
              <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-6">
                {children}
              </main>
            </div>
            <Toaster richColors position="top-right" closeButton />
          </ERPProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
