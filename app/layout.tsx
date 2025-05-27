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
        <link rel="icon" href="/cafe-joyeux.png" type="image/png" />
      </head>
      <body className={inter.className + " bg-gradient-to-b from-white via-yellow-50 to-yellow-100 overflow-x-hidden min-h-screen"}>
        <Providers>
          <Navigation />
          {children}
        </Providers>
        <footer className="bg-gray-900 text-white py-10">
          <div className="max-w-5xl mx-auto flex flex-col md:flex-row justify-between items-center md:items-start gap-8 px-4">
            <div>
              <h4 className="font-helvetica text-lg font-bold mb-2">Café Joyeux</h4>
              <p className="font-gotham text-white/90 max-w-xs">
                Une chaîne de cafés-restaurants qui emploie et forme des personnes en situation de handicap.
              </p>
            </div>
            <div className="flex flex-col items-center md:items-end gap-2">
              <span className="font-gotham text-white/80 mb-1">Suivez-nous</span>
              <div className="flex gap-4">
                <a href="#" aria-label="Facebook" className="hover:text-cafe-joyeux transition-colors text-2xl"><svg fill="currentColor" viewBox="0 0 24 24" className="w-6 h-6"><path d="M22.675 0h-21.35C.595 0 0 .592 0 1.326v21.348C0 23.408.595 24 1.325 24h11.495v-9.294H9.692v-3.622h3.128V8.413c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.797.143v3.24l-1.918.001c-1.504 0-1.797.715-1.797 1.763v2.313h3.587l-.467 3.622h-3.12V24h6.116C23.406 24 24 23.408 24 22.674V1.326C24 .592 23.406 0 22.675 0"/></svg></a>
                <a href="#" aria-label="Instagram" className="hover:text-cafe-joyeux transition-colors text-2xl"><svg fill="currentColor" viewBox="0 0 24 24" className="w-6 h-6"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 1.366.062 2.633.334 3.608 1.308.974.974 1.246 2.241 1.308 3.608.058 1.266.069 1.646.069 4.85s-.012 3.584-.07 4.85c-.062 1.366-.334 2.633-1.308 3.608-.974.974-2.241 1.246-3.608 1.308-1.266.058-1.646.069-4.85.069s-3.584-.012-4.85-.07c-1.366-.062-2.633-.334-3.608-1.308-.974-.974-1.246-2.241-1.308-3.608C2.175 15.647 2.163 15.267 2.163 12s.012-3.584.07-4.85c.062-1.366.334-2.633 1.308-3.608.974-.974 2.241-1.246 3.608-1.308C8.416 2.175 8.796 2.163 12 2.163zm0-2.163C8.741 0 8.332.013 7.052.072 5.775.131 4.602.425 3.635 1.392 2.668 2.359 2.374 3.532 2.315 4.808 2.256 6.088 2.243 6.497 2.243 12c0 5.503.013 5.912.072 7.192.059 1.276.353 2.449 1.32 3.416.967.967 2.14 1.261 3.416 1.32 1.28.059 1.689.072 7.192.072s5.912-.013 7.192-.072c1.276-.059 2.449-.353 3.416-1.32.967-.967 1.261-2.14 1.32-3.416.059-1.28.072-1.689.072-7.192s-.013-5.912-.072-7.192c-.059-1.276-.353-2.449-1.32-3.416C21.449.425 20.276.131 19 .072 17.72.013 17.311 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zm0 10.162a3.999 3.999 0 1 1 0-7.998 3.999 3.999 0 0 1 0 7.998zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z"/></svg></a>
              </div>
            </div>
          </div>
          <div className="text-center text-white/60 text-xs mt-6">© 2023 Café Joyeux. Tous droits réservés.</div>
        </footer>
      </body>
    </html>
  );
}
