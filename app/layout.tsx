import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "CityGuards — Command Center",
  description:
    "Sistema Integrado de Gestão de Ocorrências Urbanas para Câmaras Municipais. Monitorize, priorize e resolva ocorrências na via pública em tempo real.",
  keywords: [
    "CityGuards",
    "ocorrências urbanas",
    "câmara municipal",
    "dashboard",
    "gestão urbana",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-PT" className={`${inter.variable} h-full antialiased`}>
      <body className="h-full overflow-hidden font-sans">{children}</body>
    </html>
  );
}
