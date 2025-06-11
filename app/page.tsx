'use client';

import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Calendar, Clock } from 'lucide-react';
import Image from 'next/image';

interface Event {
  id: number;
  titre: string;
  date: string;
  heure: string;
  description: string;
  fileUrl?: string;
}

interface PlatDuJour {
  id: number;
  nom: string;
  date: string;
  updatedAt: string;
  fileUrl?: string;
  description: string;
  tags?: string[];
}

interface PlatDuJourResponse {
  plats: PlatDuJour[];
  date: string;
  updatedAt: string;
}

interface Category {
  id: number;
  name: string;
}

interface Side {
  id: number;
  description: string;
  category: string;
}

export default function Home() {
  const [platDuJour, setPlatDuJour] = useState<PlatDuJourResponse | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [menuUrl, setMenuUrl] = useState<string | null>(null);
  const [sides, setSides] = useState<Side[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [platResponse, eventsResponse, categoriesResponse, menuResponse, sidesResponse] = await Promise.all([
          fetch('/api/plat'),
          fetch('/api/events'),
          fetch('/api/categories'),
          fetch('/api/menu'),
          fetch('/api/sides')
        ]);

        if (platResponse.ok) {
          const data = await platResponse.json();
          setPlatDuJour(data);
        }
        if (eventsResponse.ok) {
          const data = await eventsResponse.json();
          setEvents(data);
        }
        if (categoriesResponse.ok) {
          const data = await categoriesResponse.json();
          setCategories(data);
        }
        if (menuResponse.ok) {
          const data = await menuResponse.json();
          setMenuUrl(data.url);
        }
        if (sidesResponse.ok) {
          const data = await sidesResponse.json();
          setSides(data);
        }
      } catch (error) {
        console.error('Erreur lors de la récupération des données:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  if (isLoading) {
    return (
      <main className="flex-1 overflow-x-hidden pt-8">
        {/* Skeleton pour le titre */}
        <div className="flex items-center gap-2 justify-center z-10 relative mb-6">
          <div className="w-12 h-12 bg-gray-200 rounded-full animate-pulse" />
          <div className="w-32 h-8 bg-gray-200 rounded animate-pulse" />
        </div>

        {/* Skeleton pour la date */}
        <section className="text-center my-6">
          <div className="w-64 h-8 bg-gray-200 rounded animate-pulse mx-auto mb-2" />
          <div className="w-48 h-6 bg-gray-200 rounded animate-pulse mx-auto" />
        </section>

        {/* Skeleton pour le plat du jour */}
        <section className="max-w-4xl mx-auto px-2 md:px-0 mb-8">
          <div className="bg-white border-2 border-gray-200 rounded-xl shadow-lg p-4 md:p-10 flex flex-col md:flex-row gap-8 items-stretch">
            <div className="flex flex-col gap-4 md:w-1/3">
              <div className="aspect-square w-full rounded-xl bg-gray-200 animate-pulse" />
            </div>
            <div className="flex-1 flex flex-col justify-center gap-2">
              <div className="w-3/4 h-8 bg-gray-200 rounded animate-pulse mb-4" />
              <div className="w-full h-4 bg-gray-200 rounded animate-pulse mb-2" />
              <div className="w-full h-4 bg-gray-200 rounded animate-pulse mb-2" />
              <div className="w-2/3 h-4 bg-gray-200 rounded animate-pulse mb-4" />
              <div className="flex gap-2">
                <div className="w-20 h-6 bg-gray-200 rounded-full animate-pulse" />
                <div className="w-24 h-6 bg-gray-200 rounded-full animate-pulse" />
              </div>
            </div>
          </div>
        </section>

        {/* Skeleton pour les événements */}
        <section className="py-8 px-4 sm:px-6 lg:px-8 bg-white/80 z-10 relative">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-10">
              <div className="w-48 h-8 bg-gray-200 rounded animate-pulse mx-auto mb-2" />
              <div className="w-64 h-6 bg-gray-200 rounded animate-pulse mx-auto" />
            </div>
            <div className="grid md:grid-cols-2 gap-8">
              {[1, 2].map((i) => (
                <div key={i} className="bg-white rounded-xl shadow-lg p-6 animate-pulse">
                  <div className="w-32 h-6 bg-gray-200 rounded mb-4" />
                  <div className="w-3/4 h-8 bg-gray-200 rounded mb-4" />
                  <div className="w-full h-4 bg-gray-200 rounded mb-2" />
                  <div className="w-2/3 h-4 bg-gray-200 rounded" />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Skeleton pour le menu */}
        <section className="max-w-4xl mx-auto px-2 md:px-0 mb-16 pt-8">
          <div className="bg-white border-2 border-gray-200 rounded-xl shadow-lg p-4 md:p-10">
            <div className="flex items-center justify-between mb-6">
              <div className="w-48 h-8 bg-gray-200 rounded animate-pulse" />
              <div className="w-32 h-10 bg-gray-200 rounded animate-pulse" />
            </div>
            <div className="w-full h-[800px] bg-gray-200 rounded animate-pulse" />
          </div>
        </section>
      </main>
    );
  }

  if (!platDuJour || !platDuJour.plats || platDuJour.plats.length === 0) {
    return (
      <main className="flex-1 flex items-center justify-center py-20">
        <div className="text-center space-y-4 px-4 max-w-lg mx-auto">
          <div className="text-6xl mb-4 animate-bounce-slow">🍽️</div>
          <h2 className="font-helvetica text-2xl md:text-3xl font-bold text-gray-800">
            Aucun plat du jour n&apos;est défini
          </h2>
          <p className="font-gotham text-gray-600">
            Nous sommes désolés, il n&apos;y a pas de plat du jour disponible pour le moment. Veuillez réessayer plus tard.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1 overflow-x-hidden pt-8">
      {/* Motif festif en fond */}
      {/* <div className="pointer-events-none select-none absolute inset-0 z-0">
        <div className="absolute top-0 left-0 w-72 h-72 bg-pink-200 rounded-full blur-3xl opacity-40 animate-bounce-slow" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-cafe-joyeux rounded-full blur-3xl opacity-30 animate-pulse-slow" />
        <div className="absolute top-1/2 left-1/2 w-40 h-40 bg-green-200 rounded-full blur-2xl opacity-30 animate-float" />
      </div> */}

      {/* Séparateur festif */}
      <div className="flex items-center gap-2 justify-center z-10 relative">
        <h1 className="font-helvetica text-4xl md:text-6xl font-bold text-cafe-joyeux drop-shadow-lg animate-fade-in">
          <span className="inline-block animate-wiggle">☀️</span>
        </h1>
        <h2 className="font-helvetica text-2xl font-bold text-cafe-joyeux">Plat du jour</h2>
      </div>

      {/* Section date */}
      <section className="text-center my-6">
        <h1 className="font-helvetica text-3xl md:text-4xl font-bold text-gray-900">
          {format(new Date(platDuJour.date || Date.now()), "EEEE d MMMM", { locale: fr })}
        </h1>
        <p className="font-gotham text-gray-600 text-base">
          Dernière mise à jour: <span className="font-bold text-gray-800">{format(new Date(platDuJour.updatedAt || Date.now()), "EEEE d MMMM 'à' HH:mm", { locale: fr })}</span>
        </p>
      </section>

      {/* Card plat du jour */}
      <section className="max-w-4xl mx-auto px-2 md:px-0 mb-8">
        <div className="bg-white border-2 border-cafe-joyeux rounded-xl shadow-lg p-4 md:p-10">
          <div className="flex flex-col gap-8">
            {platDuJour.plats.map((plat, index) => (
              <div key={plat.id || index}>
                <div className="flex flex-col md:flex-row gap-8 items-stretch">
                  {plat.fileUrl && (
                    <div className="flex flex-col gap-4 md:w-1/3">
                      <div className="aspect-square w-full rounded-xl bg-gray-200 overflow-hidden">
                        <Image 
                          src={plat.fileUrl} 
                          alt={plat.nom} 
                          width={400} 
                          height={400} 
                          className="w-full h-full object-cover"
                          priority={index === 0}
                        />
                      </div>
                    </div>
                  )}
                  <div className={`flex-1 flex flex-col justify-center gap-2 ${!plat.fileUrl ? 'md:w-full' : ''}`}>
                    <h3 className="font-helvetica text-2xl font-bold text-gray-900 mb-1">{plat.nom}</h3>
                    <p className="font-gotham text-gray-700 mb-3">{plat.description}</p>
                    <div className="flex gap-2 mb-3 flex-wrap">
                      {(plat.tags || []).map((tag: string, i: number) => (
                        <span 
                          key={i} 
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            tag === 'Végétarien' ? 'bg-green-100 text-green-800' : 
                            tag === 'Sans gluten' ? 'bg-yellow-100 text-yellow-800' : 
                            'bg-gray-100 text-gray-700'
                          }`}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                {index < platDuJour.plats.length - 1 && (
                  <div className="border-b border-gray-200 my-8" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Section des sides */}
      {sides.length > 0 && (
        <section className="max-w-4xl mx-auto px-2 md:px-0 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {['salades', 'soupes', 'buns', 'croques'].map((category) => {
              const categorySides = sides.filter(s => s.category === category);
              if (categorySides.length === 0) return null;

              return (
                <div key={category} className="bg-white border-2 border-cafe-joyeux rounded-xl shadow-lg p-4">
                  <h3 className="font-helvetica text-xl font-bold mb-3 capitalize">
                    {category}
                  </h3>
                  <ul className="space-y-2">
                    {categorySides.map((side) => (
                      <li key={side.id} className="font-gotham text-gray-700">
                        {side.description}
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Offres Section */}
      {events.length > 0 && (
        <section className="py-8 px-4 sm:px-6 lg:px-8 bg-white/80 z-10 relative">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-10">
              <h2 className="font-helvetica text-3xl font-bold mb-2 animate-fade-in">
                <span className="inline-flex items-center gap-2"><span className="text-3xl">🎉</span> Offres du moment</span>
              </h2>
              <p className="font-gotham text-lg text-gray-600">
                Rejoignez-nous pour des moments inoubliables
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8 mb-8">
              {events.map((event) => (
                <div key={event.id} className="bg-gradient-to-br from-white via-white to-yellow-100 rounded-xl shadow-2xl overflow-hidden hover:shadow-3xl transition-shadow flex flex-col border-2 border-cafe-joyeux animate-pop">
                  {event.fileUrl && (
                    <div className="w-full h-48 md:h-auto md:w-1/3 relative">
                      <Image
                        src={event.fileUrl}
                        alt={event.titre}
                        fill
                        className="object-contain"
                        sizes="(max-width: 768px) 100vw, 33vw"
                      />
                    </div>
                  )}
                  <div className={`flex-1 p-6 flex flex-col justify-center ${!event.fileUrl ? 'w-full' : ''}`}>
                    <div className="flex items-center gap-2 mb-2">
                      <Calendar className="w-5 h-5 text-cafe-joyeux" />
                      <span className="flex items-center gap-1 font-gotham font-medium text-sm bg-white px-3 py-1 rounded-full border border-cafe-joyeux">
                        {format(new Date(event.date), "EEEE d MMMM", { locale: fr })} <Clock className="inline w-4 h-4 ml-1" /> {event.heure}
                      </span>
                    </div>
                    <h3 className="font-helvetica text-xl font-bold text-gray-900 mb-2">
                      {event.titre}
                    </h3>
                    <p className="font-gotham text-gray-600 mb-4">
                      {event.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Section Menu de la Semaine */}
      {menuUrl && (
        <section className="max-w-4xl mx-auto px-2 md:px-0 mb-16 pt-8">
          <div className="bg-white border-2 border-cafe-joyeux rounded-xl shadow-lg p-4 md:p-10">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2 mr-4">
                <h2 className="font-helvetica text-2xl font-bold">Menu de la Semaine</h2>
                <span className="text-2xl">📋</span>
              </div>
              <a
                href={menuUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 border border-cafe-joyeux rounded-lg hover:bg-cafe-joyeux/90 transition-colors"
              >
                Télécharger le menu
              </a>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-full max-w-2xl">
                <iframe
                  src={`${menuUrl}#toolbar=0&navpanes=0`}
                  className="w-full h-[800px] border-0 shadow-lg"
                  title="Menu de la semaine"
                />
              </div>
            </div>
          </div>
        </section>
      )}
    </main>
  );
}


