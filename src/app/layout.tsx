import type { Metadata } from "next";
import { Cormorant_Garamond, DM_Sans, DM_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { Providers } from "@/components/providers/auth-provider";
import { ThemeProvider } from "@/contexts/theme-context";

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

const dmMono = DM_Mono({
  variable: "--font-dm-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "AETHEL OS — Tu Negocio Merece un Sistema Operativo",
  description: "AETHEL OS le da a cada industria la infraestructura digital que las empresas del Fortune 500 pagan millones. Panaderías. Bufetes. Clínicas. Salones. En una plataforma.",
  keywords: ["AETHEL OS", "AETHEL", "SaaS", "Caribbean", "Trinidad", "Tobago", "Guyana", "business software", "ERP", "CRM"],
  authors: [{ name: "AETHEL OS" }],
  icons: {
    icon: "/logo.svg",
  },
  openGraph: {
    title: "AETHEL OS — Tu Negocio Merece un Sistema Operativo",
    description: "Infraestructura digital para empresas del Caribe",
    url: "https://aethel.tt",
    siteName: "AETHEL OS",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "AETHEL OS",
    description: "Infraestructura digital para empresas del Caribe",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body
        className={`${cormorant.variable} ${dmSans.variable} ${dmMono.variable} antialiased bg-background text-foreground min-h-screen`}
      >
        <Providers>
          <ThemeProvider>
            {children}
          </ThemeProvider>
        </Providers>
        <Toaster />
      </body>
    </html>
  );
}
