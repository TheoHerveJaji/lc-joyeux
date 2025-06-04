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
}

interface PlatDuJour {
  nom: string;
  date: string;
  updatedAt: string;
  fileUrl?: string;
  description: string;
  tags?: string[];
}

interface Category {
  id: number;
  name: string;
}

export default function Home() {
  const [platDuJour, setPlatDuJour] = useState<PlatDuJour | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [menuUrl, setMenuUrl] = useState<string | null>(null);

  useEffect(() => {
    const fetchPlat = async () => {
      try {
        const response = await fetch('/api/plat');
        if (response.ok) {
          const data = await response.json();
          setPlatDuJour(data);
        }
      } catch (error) {
        console.error('Erreur lors de la récupération du plat du jour:', error);
      }
    };
    fetchPlat();
  }, []);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await fetch('/api/events');
        if (response.ok) {
          const data = await response.json();
          setEvents(data);
        } else {
          console.error('Error response:', await response.text());
        }
      } catch (error) {
        console.error('Erreur lors de la récupération des événements:', error);
      }
    };
    fetchEvents();
  }, []);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/categories');
        if (response.ok) {
          const data = await response.json();
          setCategories(data);
        }
      } catch (error) {
        console.error('Erreur lors de la récupération des catégories:', error);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchMenu = async () => {
      try {
        const response = await fetch('/api/menu');
        if (response.ok) {
          const data = await response.json();
          setMenuUrl(data.url);
        } else {
          console.error('Erreur lors de la récupération du menu:', await response.text());
        }
      } catch (error) {
        console.error('Erreur lors de la récupération du menu:', error);
      }
    };
    fetchMenu();
  }, []);

  if (!platDuJour || !platDuJour.nom || !platDuJour.updatedAt) {
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
        <div className="bg-white border-2 border-cafe-joyeux rounded-xl shadow-lg p-4 md:p-10 flex flex-col md:flex-row gap-8 items-stretch">
          <div className="flex flex-col gap-4 md:w-1/3">
            {platDuJour.fileUrl ? (
              <div className="aspect-square w-full rounded-xl bg-gray-200 overflow-hidden">
                <Image 
                  src={platDuJour.fileUrl} 
                  alt={platDuJour.nom} 
                  width={400} 
                  height={400} 
                  className="w-full h-full object-cover"
                  priority
                />
              </div>
            ) : (
              <div className="aspect-square w-full rounded-xl bg-gray-100 flex items-center justify-center">
                <span className="text-6xl animate-bounce-slow">🍽️</span>
              </div>
            )}
          </div>
          <div className="flex-1 flex flex-col justify-center gap-2">
            <h3 className="font-helvetica text-2xl font-bold text-gray-900 mb-1">{platDuJour.nom}</h3>
            <p className="font-gotham text-gray-700 mb-3">{platDuJour.description}</p>
            <div className="flex gap-2 mb-3 flex-wrap">
              {(platDuJour.tags || []).map((tag: string, i: number) => (
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
      </section>

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
                <div key={event.id} className="bg-gradient-to-br from-white via-white to-yellow-100 rounded-xl shadow-2xl overflow-hidden hover:shadow-3xl transition-shadow flex flex-col md:flex-row items-stretch border-2 border-cafe-joyeux animate-pop">
                  <div className="flex-1 p-6 flex flex-col justify-center">
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
              <div className="flex items-center gap-2">
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


