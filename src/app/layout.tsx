import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { ERPProvider } from "@/components/providers/erp-provider";
import { AppLayoutShell } from "@/components/layout/app-layout-shell";
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
      <body className={`${inter.variable} font-sans antialiased min-h-screen bg-background text-foreground`}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <ERPProvider>
            <AppLayoutShell>{children}</AppLayoutShell>
            <Toaster richColors position="top-right" closeButton />
          </ERPProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
