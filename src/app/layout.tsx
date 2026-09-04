import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { SettingsProvider } from "@/components/providers/settings-provider";
import { ERPProvider } from "@/components/providers/erp-provider";
import { AppLayoutShell } from "@/components/layout/app-layout-shell";
import { Toaster } from "sonner";

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
      <body
        suppressHydrationWarning
        className="font-sans antialiased min-h-screen bg-background text-foreground"
      >
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <SettingsProvider>
            <ERPProvider>
              <AppLayoutShell>{children}</AppLayoutShell>
              <Toaster richColors position="top-right" closeButton />
            </ERPProvider>
          </SettingsProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
