import type { Metadata } from "next";
import "./globals.css";
import { Playfair_Display, DM_Sans, Rubik_Spray_Paint, Permanent_Marker } from "next/font/google";

const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-playfair" });
const dmSans = DM_Sans({ subsets: ["latin"], variable: "--font-dm" });
// Fontes estilo pixo/graffiti — usadas em títulos grandes
const spray = Rubik_Spray_Paint({ subsets: ["latin"], weight: "400", variable: "--font-spray" });
const marker = Permanent_Marker({ subsets: ["latin"], weight: "400", variable: "--font-marker" });

export const metadata: Metadata = {
  title: "Humanity Bearers – Sistema de Doações",
  description: "Gestão de doações para instituições",
  icons: {
    icon: "/ursinho.png",
    shortcut: "/ursinho.png",
    apple: "/ursinho.png",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`${playfair.variable} ${dmSans.variable} ${spray.variable} ${marker.variable}`}>
      <body>{children}</body>
    </html>
  );
}