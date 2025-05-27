'use client';

import { useEffect, useState } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';

const TAGS = ['Végétarien', 'Sans gluten', 'Vegan', 'Épicé'];

type Tab = 'menu' | 'plat' | 'event';

export default function AdminPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>('menu');
  
  const [plat, setPlat] = useState({
    nom: '',
    description: '',
    tags: [] as string[],
    image: '',
  });

  const [event, setEvent] = useState({
    titre: '',
    date: '',
    heure: '',
    description: '',
  });

  const [menuFile, setMenuFile] = useState<File | null>(null);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');

  // Redirection si pas connecté ou pas admin
  useEffect(() => {
    if (status === 'loading') return;
    
    if (!session) {
      router.push('/login');
    } else if (session.user.role !== 'ADMIN') {
      router.push('/');
    }
  }, [session, status, router]);

  // Charger depuis l'API au montage
  useEffect(() => {
    const fetchPlat = async () => {
      const response = await fetch('/api/plat');
      if (response.ok) {
        const data = await response.json();
        setPlat(data);
      }
    };
    fetchPlat();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setPlat({ ...plat, [e.target.name]: e.target.value });
  };

  const handleTagToggle = (tag: string) => {
    setPlat((prev) => ({
      ...prev,
      tags: prev.tags.includes(tag)
        ? prev.tags.filter((t) => t !== tag)
        : [...prev.tags, tag],
    }));
  };

  const handlePlatSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const response = await fetch('/api/plat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(plat),
    });
    if (response.ok) {
      alert('Plat du jour mis à jour avec succès !');
    }
  };

  const handleEventSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const response = await fetch('/api/events', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(event),
    });
    if (response.ok) {
      alert('Event ajouté avec succès !');
      setEvent({
        titre: '',
        date: '',
        heure: '',
        description: '',
      });
    }
  };

  const handleMenuUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!menuFile) return;

    setUploadStatus('uploading');
    const formData = new FormData();
    formData.append('file', menuFile);

    try {
      const response = await fetch('/api/menu', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        setUploadStatus('success');
        setMenuFile(null);
      } else {
        setUploadStatus('error');
      }
    } catch (error) {
      console.error('Erreur lors de l\'upload du menu:', error);
      setUploadStatus('error');
    }
  };

  const handleLogout = async () => {
    await signOut({ callbackUrl: '/' });
  };

  if (status === 'loading') {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">Chargement...</p>
      </main>
    );
  }

  if (!session || session.user.role !== 'ADMIN') {
    return null;
  }

  return (
    <main className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header avec titre et bouton déconnexion */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="font-helvetica text-3xl font-bold">
            Administration
          </h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">
              Connecté en tant que: <strong>{session.user.name}</strong>
            </span>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors font-helvetica font-semibold text-sm"
            >
              Déconnexion
            </button>
          </div>
        </div>

        {/* Onglets */}
        <div className="flex border-b border-gray-200 mb-6">
          <button
            onClick={() => setActiveTab('menu')}
            className={`px-6 py-3 font-helvetica font-semibold transition-colors border-b-2 ${
              activeTab === 'menu'
                ? 'text-cafe-joyeux border-cafe-joyeux'
                : 'text-gray-600 border-transparent hover:text-gray-800'
            }`}
          >
            Menu de la Semaine
          </button>
          <button
            onClick={() => setActiveTab('plat')}
            className={`px-6 py-3 font-helvetica font-semibold transition-colors border-b-2 ${
              activeTab === 'plat'
                ? 'text-cafe-joyeux border-cafe-joyeux'
                : 'text-gray-600 border-transparent hover:text-gray-800'
            }`}
          >
            Plat du Jour
          </button>
          <button
            onClick={() => setActiveTab('event')}
            className={`px-6 py-3 font-helvetica font-semibold transition-colors border-b-2 ${
              activeTab === 'event'
                ? 'text-cafe-joyeux border-cafe-joyeux'
                : 'text-gray-600 border-transparent hover:text-gray-800'
            }`}
          >
            Événements
          </button>
        </div>

        {/* Contenu des onglets */}
        <div className="bg-white p-6 rounded-lg shadow-sm">
          {/* Onglet Menu */}
          {activeTab === 'menu' && (
            <section>
              <h2 className="font-helvetica text-2xl font-bold mb-4">
                Menu de la Semaine
              </h2>
              <form onSubmit={handleMenuUpload} className="space-y-4">
                <div>
                  <label className="block font-gotham text-sm font-medium text-gray-700 mb-1">
                    Upload du menu PDF
                  </label>
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={(e) => setMenuFile(e.target.files?.[0] || null)}
                    className="w-full p-2 border border-gray-300 rounded-md font-gotham"
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={!menuFile || uploadStatus === 'uploading'}
                  className={`w-full bg-cafe-joyeux text-white font-helvetica font-bold py-2 px-4 rounded-md transition-colors ${
                    !menuFile || uploadStatus === 'uploading'
                      ? 'opacity-50 cursor-not-allowed'
                      : 'hover:bg-yellow-500'
                  }`}
                >
                  {uploadStatus === 'uploading' ? 'Upload en cours...' : 'Uploader le menu'}
                </button>
                {uploadStatus === 'success' && (
                  <p className="text-green-600 text-sm">Menu uploadé avec succès !</p>
                )}
                {uploadStatus === 'error' && (
                  <p className="text-red-600 text-sm">Erreur lors de l&apos;upload du menu</p>
                )}
              </form>
            </section>
          )}

          {/* Onglet Plat du Jour */}
          {activeTab === 'plat' && (
            <section>
              <h2 className="font-helvetica text-2xl font-bold mb-4">
                Modifier le Plat du Jour
              </h2>
              <form onSubmit={handlePlatSubmit} className="space-y-4">
                <div>
                  <label className="block font-gotham text-sm font-medium text-gray-700 mb-1">
                    Nom du plat
                  </label>
                  <input
                    type="text"
                    name="nom"
                    value={plat.nom}
                    onChange={handleChange}
                    className="w-full p-2 border border-gray-300 rounded-md font-gotham"
                    required
                  />
                </div>
                <div>
                  <label className="block font-gotham text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={plat.description}
                    onChange={handleChange}
                    className="w-full p-2 border border-gray-300 rounded-md font-gotham"
                    rows={3}
                    required
                  />
                </div>
                <div>
                  <label className="block font-gotham text-sm font-medium text-gray-700 mb-1">
                    Tags
                  </label>
                  <div className="flex gap-2 flex-wrap">
                    {TAGS.map((tag) => (
                      <button
                        type="button"
                        key={tag}
                        onClick={() => handleTagToggle(tag)}
                        className={`px-3 py-1 rounded-full text-xs font-semibold border transition-colors ${
                          plat.tags.includes(tag)
                            ? 'bg-cafe-joyeux text-black border-cafe-joyeux'
                            : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-yellow-50'
                        }`}
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block font-gotham text-sm font-medium text-gray-700 mb-1">
                    Image (URL ou laisser vide)
                  </label>
                  <input
                    type="text"
                    name="image"
                    value={plat.image}
                    onChange={handleChange}
                    className="w-full p-2 border border-gray-300 rounded-md font-gotham"
                    placeholder="https://..."
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-cafe-joyeux text-white font-helvetica font-bold py-2 px-4 rounded-md hover:bg-yellow-500 transition-colors"
                >
                  Mettre à jour le plat du jour
                </button>
              </form>
            </section>
          )}

          {/* Onglet Events */}
          {activeTab === 'event' && (
            <section>
              <h2 className="font-helvetica text-2xl font-bold mb-4">
                Ajouter un Événement
              </h2>
              <form onSubmit={handleEventSubmit} className="space-y-4">
                <div>
                  <label className="block font-gotham text-sm font-medium text-gray-700 mb-1">
                    Titre de l&apos;événement
                  </label>
                  <input
                    type="text"
                    value={event.titre}
                    onChange={(e) => setEvent({ ...event, titre: e.target.value })}
                    className="w-full p-2 border border-gray-300 rounded-md font-gotham"
                    required
                  />
                </div>
                <div>
                  <label className="block font-gotham text-sm font-medium text-gray-700 mb-1">
                    Date
                  </label>
                  <input
                    type="date"
                    value={event.date}
                    onChange={(e) => setEvent({ ...event, date: e.target.value })}
                    className="w-full p-2 border border-gray-300 rounded-md font-gotham"
                    required
                  />
                </div>
                <div>
                  <label className="block font-gotham text-sm font-medium text-gray-700 mb-1">
                    Heure
                  </label>
                  <input
                    type="time"
                    value={event.heure}
                    onChange={(e) => setEvent({ ...event, heure: e.target.value })}
                    className="w-full p-2 border border-gray-300 rounded-md font-gotham"
                    required
                  />
                </div>
                <div>
                  <label className="block font-gotham text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={event.description}
                    onChange={(e) => setEvent({ ...event, description: e.target.value })}
                    className="w-full p-2 border border-gray-300 rounded-md font-gotham"
                    rows={3}
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-cafe-joyeux text-white font-helvetica font-bold py-2 px-4 rounded-md hover:bg-yellow-500 transition-colors"
                >
                  Ajouter l&apos;événement
                </button>
              </form>
            </section>
          )}
        </div>
      </div>
    </main>
  );
}
