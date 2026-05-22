import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { Providers } from "./store/Providers";

const plusJakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "OrbitDash",
  description: "Votre tableau de bord intelligent et personnalisable",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="fr"
      className={`${plusJakarta.variable} h-full`}
    >
      <body className="h-full overflow-hidden bg-[var(--bg)] text-[var(--text-1)]">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
