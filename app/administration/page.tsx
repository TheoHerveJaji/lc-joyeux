'use client';

import { useEffect, useState } from 'react';

const TAGS = ['Végétarien', 'Sans gluten', 'Vegan', 'Épicé'];

export default function AdminPage() {
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

  return (
    <main className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="font-helvetica text-3xl font-bold mb-8 text-center">
          Administration
        </h1>

        {/* Section Upload Menu PDF */}
        <section className="bg-white p-6 rounded-lg shadow-sm mb-8">
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

        {/* Formulaire Plat du Jour */}
        <section className="bg-white p-6 rounded-lg shadow-sm mb-8">
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

        {/* Formulaire Event */}
        <section className="bg-white p-6 rounded-lg shadow-sm">
          <h2 className="font-helvetica text-2xl font-bold mb-4">
            Ajouter un Event
          </h2>
          <form onSubmit={handleEventSubmit} className="space-y-4">
            <div>
              <label className="block font-gotham text-sm font-medium text-gray-700 mb-1">
                Titre de l&apos;event
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
              Ajouter l&apos;event
            </button>
          </form>
        </section>
      </div>
    </main>
  );
} 