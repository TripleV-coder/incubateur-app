import type { Metadata } from "next";
import { Cormorant_Garamond, IBM_Plex_Sans } from "next/font/google";
import "./globals.css";

const plex = IBM_Plex_Sans({
  variable: "--font-plex",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXTAUTH_URL ?? "https://incubateur-elite.com"),
  title: "INCUBATEUR ELITE 4.0 | L'académie d'élite du commerce digital",
  description: "Devenir un leader du e-commerce avec l'Incubateur Elite 4.0. Formations premium, coaching et communauté d'exception.",
  keywords: ["e-commerce", "formation", "dropshipping", "business en ligne", "succès", "élite"],
  openGraph: {
    title: "INCUBATEUR ELITE 4.0",
    description: "Rejoignez l'élite du e-commerce dès aujourd'hui.",
    url: "https://incubateur-elite.com",
    siteName: "Incubateur Elite 4.0",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
      },
    ],
    locale: "fr_FR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "INCUBATEUR ELITE 4.0",
    description: "Bâtissez votre empire e-commerce.",
    images: ["/og-image.png"],
  },
};

import { Providers } from "@/components/providers/Providers";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className="dark" suppressHydrationWarning>
      <body
        className={`${plex.variable} ${cormorant.variable} antialiased selection:bg-gold/30 flex flex-col min-h-screen`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

