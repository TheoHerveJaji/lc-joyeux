'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { Settings } from 'lucide-react';

export default function Navigation() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const { data: session } = useSession();

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Détermine la destination du bouton Administration
  const adminHref = session ? '/administration' : '/login';

  return (
    <nav className={`w-full transition-shadow duration-300 z-50 sticky top-0 bg-[#FCC000] ${scrolled ? 'shadow-2xl shadow-yellow-300/40' : 'shadow-sm'}`} style={{height: 80}}>
      <div className="max-w-7xl mx-auto px-6 flex justify-between items-center h-20">
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-3">
            <Image src="/cafe-joyeux.svg" alt="Logo Café Joyeux" width={56} height={56} priority />
            <span className="font-helvetica text-3xl font-bold text-black">Café Joyeux</span>
          </Link>
        </div>
        <div className="flex items-center gap-4">
          <Link
            href={adminHref}
            className={`font-gotham px-5 py-2 rounded-lg text-base font-semibold shadow-sm border border-black/10 bg-white hover:bg-yellow-100 transition-colors flex items-center gap-2 ${
              pathname === '/administration'
                ? 'ring-2 ring-cafe-joyeux text-cafe-joyeux'
                : 'text-gray-900'
            }`}
          >
            <span className="md:hidden"><Settings className="w-5 h-5" /></span>
            <span className="hidden md:inline">Administration</span>
          </Link>
        </div>
      </div>
    </nav>
  );
}
