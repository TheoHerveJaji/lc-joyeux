import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navigation from "./components/Navigation";
import { Providers } from "./providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Le Café Joyeux - Plat du Jour",
  description: "Découvrez le plat du jour et les événements du Café Joyeux",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <head>
        <link rel="icon" href="/cafe-joyeux.svg" type="image/svg" />
      </head>
      <body className={inter.className + " bg-white overflow-x-hidden min-h-screen flex flex-col"}>
        <Providers>
          <Navigation />
          <div className="flex-1">
            {children}
          </div>
          <footer className="bg-gray-900 text-white py-10">
            <div className="max-w-5xl mx-auto flex flex-col md:flex-row justify-between items-center md:items-start gap-8 px-4">
              <div>
                <h4 className="font-helvetica text-lg font-bold mb-2">Café Joyeux</h4>
                <p className="font-gotham text-white/90 max-w-xs">
                  La première famille de cafés-restaurants à employer et former des personnes en situation de handicap mental et cognitif.
                </p>
              </div>
              <div className="flex flex-col items-center md:items-end gap-2">
                <span className="font-gotham text-white/80 mb-1">Suivez-nous</span>
                <div className="flex gap-4">
                  <a href="https://www.facebook.com/cafejoyeux/?locale=fr_FR" aria-label="Facebook" className="text-white hover:text-cafe-joyeux transition-colors">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
                      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3.28l.72-4h-4V7a1 1 0 0 1 1-1h3z"/>
                    </svg>
                  </a>
                  <a href="https://www.instagram.com/cafejoyeux/" aria-label="Instagram" className="text-white hover:text-cafe-joyeux transition-colors">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
                      <rect x="2" y="2" width="20" height="20" rx="5" />
                      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                      <line x1="17.5" y1="6.5" x2="17.5" y2="6.5" />
                    </svg>
                  </a>
                  <a href="https://www.linkedin.com/company/cafejoyeux/" aria-label="LinkedIn" className="text-white hover:text-cafe-joyeux transition-colors">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
                      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
                      <rect x="2" y="9" width="4" height="12" />
                      <circle cx="4" cy="4" r="2" />
                    </svg>
                  </a>
                </div>
              </div>
            </div>
            <div className="text-center text-white/60 text-xs mt-6">© 2025 Café Joyeux. Tous droits réservés.</div>
          </footer>
        </Providers>
      </body>
    </html>
  );
}
