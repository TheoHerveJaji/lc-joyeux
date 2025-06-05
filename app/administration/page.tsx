'use client';

import { useEffect, useState } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Settings } from 'lucide-react';
import Image from 'next/image';

type Tab = 'menu' | 'plat' | 'event' | 'categories';

export default function AdminPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>('plat');
  
  const [plat, setPlat] = useState({
    nom: '',
    description: '',
    tags: [] as string[],
    image: null as File | null,
    fileUrl: null as string | null,
  });

  const [plat2, setPlat2] = useState({
    nom: '',
    description: '',
    tags: [] as string[],
    image: null as File | null,
    fileUrl: null as string | null,
  });

  const [plats, setPlats] = useState<Array<{
    id: number;
    nom: string;
    description: string;
    tags: string[];
    fileUrl: string | null;
    createdAt: string;
  }>>([]);

  const [editingPlat, setEditingPlat] = useState<number | null>(null);
  const [showSecondPlat, setShowSecondPlat] = useState(false);
  const [platStatus, setPlatStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [platMessage, setPlatMessage] = useState('');

  const [event, setEvent] = useState({
    titre: '',
    date: '',
    heure: '',
    description: '',
  });

  const [events, setEvents] = useState<Array<{
    id: number;
    titre: string;
    date: string;
    heure: string;
    description: string;
  }>>([]);
  const [editingEvent, setEditingEvent] = useState<number | null>(null);
  const [eventStatus, setEventStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [eventMessage, setEventMessage] = useState('');

  const [menuFile, setMenuFile] = useState<File | null>(null);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const [currentMenuUrl, setCurrentMenuUrl] = useState<string | null>(null);
  const [categories, setCategories] = useState<{ id: number; name: string }[]>([]);
  const [newCategory, setNewCategory] = useState('');

  // Redirection si pas connecté ou pas admin
  useEffect(() => {
    if (status === 'loading') return;
    
    if (!session) {
      router.push('/login');
    } else if (session.user.role !== 'ADMIN') {
      router.push('/');
    }
  }, [session, status, router]);

  // Charger le menu au montage
  useEffect(() => {
    const fetchMenu = async () => {
      try {
        const response = await fetch('/api/menu');
        if (response.ok) {
          const data = await response.json();
          setCurrentMenuUrl(data.url);
        }
      } catch (error) {
        console.error('Erreur lors de la récupération du menu:', error);
      }
    };
    fetchMenu();
  }, []);

  // Charger les plats au montage
  useEffect(() => {
    const fetchPlats = async () => {
      const response = await fetch('/api/plat');
      if (response.ok) {
        const data = await response.json();
        const plats = data.plats || [];
        setPlats(plats);
        
        // Si des plats existent, les afficher dans le formulaire
        if (plats.length > 0) {
          setPlat({
            nom: plats[0].nom,
            description: plats[0].description,
            tags: plats[0].tags,
            image: null,
            fileUrl: plats[0].fileUrl,
          });

          if (plats.length > 1) {
            setPlat2({
              nom: plats[1].nom,
              description: plats[1].description,
              tags: plats[1].tags,
              image: null,
              fileUrl: plats[1].fileUrl,
            });
            setShowSecondPlat(true);
          }
        }
      }
    };
    fetchPlats();
  }, []);

  // Charger les catégories au montage
  useEffect(() => {
    const fetchCategories = async () => {
      const response = await fetch('/api/categories');
      if (response.ok) {
        const data = await response.json();
        setCategories(data);
      }
    };
    fetchCategories();
  }, []);

  // Charger les événements au montage
  useEffect(() => {
    const fetchEvents = async () => {
      const response = await fetch('/api/events');
      if (response.ok) {
        const data = await response.json();
        setEvents(data);
      }
    };
    fetchEvents();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, platNumber: number) => {
    if (platNumber === 1) {
      setPlat({ ...plat, [e.target.name]: e.target.value });
    } else {
      setPlat2({ ...plat2, [e.target.name]: e.target.value });
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>, platNumber: number) => {
    if (e.target.files && e.target.files[0]) {
      if (platNumber === 1) {
        setPlat({ ...plat, image: e.target.files[0] });
      } else {
        setPlat2({ ...plat2, image: e.target.files[0] });
      }
    }
  };

  const handleTagToggle = (tag: string, platNumber: number) => {
    if (platNumber === 1) {
      setPlat((prev) => ({
        ...prev,
        tags: prev.tags.includes(tag)
          ? prev.tags.filter((t) => t !== tag)
          : [...prev.tags, tag],
      }));
    } else {
      setPlat2((prev) => ({
        ...prev,
        tags: prev.tags.includes(tag)
          ? prev.tags.filter((t) => t !== tag)
          : [...prev.tags, tag],
      }));
    }
  };

  const handleRemoveImage = async (platNumber: number) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer l\'image de ce plat ?')) return;
    setPlatStatus('idle');

    const platId = platNumber === 1 ? plats[0]?.id : plats[1]?.id;
    if (!platId) return;

    const response = await fetch(`/api/plat/${platId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ removeImage: true }),
    });

    if (response.ok) {
      if (platNumber === 1) {
        setPlat(prev => ({ ...prev, fileUrl: null }));
      } else {
        setPlat2(prev => ({ ...prev, fileUrl: null }));
      }
      setPlatStatus('success');
      setPlatMessage('Image supprimée avec succès !');
    } else {
      setPlatStatus('error');
      setPlatMessage('Erreur lors de la suppression de l\'image');
    }
  };

  const handleDeletePlat = async (platNumber: number) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce plat ?')) return;
    setPlatStatus('idle');

    const platId = platNumber === 1 ? plats[0]?.id : plats[1]?.id;
    if (!platId) return;

    const response = await fetch(`/api/plat/${platId}`, {
      method: 'DELETE',
    });

    if (response.ok) {
      if (platNumber === 1) {
        setPlat({
          nom: '',
          description: '',
          tags: [],
          image: null,
          fileUrl: null,
        });
        // Si on supprime le premier plat et qu'il y a un deuxième plat, on le déplace en premier
        if (plats.length > 1) {
          setPlat({
            nom: plats[1].nom,
            description: plats[1].description,
            tags: plats[1].tags,
            image: null,
            fileUrl: plats[1].fileUrl,
          });
          setPlat2({
            nom: '',
            description: '',
            tags: [],
            image: null,
            fileUrl: null,
          });
          setShowSecondPlat(false);
        }
      } else {
        setPlat2({
          nom: '',
          description: '',
          tags: [],
          image: null,
          fileUrl: null,
        });
        setShowSecondPlat(false);
      }
      setPlats(plats.filter(p => p.id !== platId));
      setPlatStatus('success');
      setPlatMessage('Plat supprimé avec succès !');
    } else {
      setPlatStatus('error');
      setPlatMessage('Erreur lors de la suppression du plat');
    }
  };

  const handlePlatSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPlatStatus('idle');

    try {
      const formData = new FormData();
      
      // Premier plat
      formData.append("nom", plat.nom);
      formData.append("description", plat.description);
      formData.append("tags", JSON.stringify(plat.tags));
      if (plat.image) {
        formData.append("file", plat.image);
      }

      // Deuxième plat si présent
      if (showSecondPlat && plat2.nom && plat2.description) {
        formData.append("nom2", plat2.nom);
        formData.append("description2", plat2.description);
        formData.append("tags2", JSON.stringify(plat2.tags));
        if (plat2.image) {
          formData.append("file2", plat2.image);
        }
      }

      const response = await fetch('/api/plat', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        setPlats(data.plats);
        setPlatStatus('success');
        setPlatMessage('Plats mis à jour avec succès !');
        
        // Mettre à jour les formulaires avec les nouvelles données
        if (data.plats.length > 0) {
          setPlat({
            nom: data.plats[0].nom,
            description: data.plats[0].description,
            tags: data.plats[0].tags,
            image: null,
            fileUrl: data.plats[0].fileUrl,
          });

          if (data.plats.length > 1) {
            setPlat2({
              nom: data.plats[1].nom,
              description: data.plats[1].description,
              tags: data.plats[1].tags,
              image: null,
              fileUrl: data.plats[1].fileUrl,
            });
            setShowSecondPlat(true);
          } else {
            setShowSecondPlat(false);
          }
        }
      } else {
        setPlatStatus('error');
        setPlatMessage('Erreur lors de la mise à jour des plats');
      }
    } catch (error) {
      console.error('Erreur:', error);
      setPlatStatus('error');
      setPlatMessage('Une erreur est survenue');
    }
  };

  const handleEventSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setEventStatus('idle');
    const response = await fetch('/api/events', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(event),
    });
    if (response.ok) {
      const newEvent = await response.json();
      setEvents([...events, newEvent]);
      setEvent({
        titre: '',
        date: '',
        heure: '',
        description: '',
      });
      setEventStatus('success');
      setEventMessage('Événement ajouté avec succès !');
    } else {
      setEventStatus('error');
      setEventMessage('Erreur lors de l\'ajout de l\'événement');
    }
  };

  const handleEditEvent = (eventToEdit: typeof events[0]) => {
    setEditingEvent(eventToEdit.id);
    setEvent({
      titre: eventToEdit.titre,
      date: eventToEdit.date.split('T')[0],
      heure: eventToEdit.heure,
      description: eventToEdit.description,
    });
  };

  const handleUpdateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEvent) return;
    setEventStatus('idle');

    const response = await fetch(`/api/events/${editingEvent}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(event),
    });

    if (response.ok) {
      const updatedEvent = await response.json();
      setEvents(events.map(e => e.id === editingEvent ? updatedEvent : e));
      setEvent({
        titre: '',
        date: '',
        heure: '',
        description: '',
      });
      setEditingEvent(null);
      setEventStatus('success');
      setEventMessage('Événement modifié avec succès !');
    } else {
      setEventStatus('error');
      setEventMessage('Erreur lors de la modification de l\'événement');
    }
  };

  const handleDeleteEvent = async (id: number) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet événement ?')) return;
    setEventStatus('idle');

    const response = await fetch(`/api/events/${id}`, {
      method: 'DELETE',
    });

    if (response.ok) {
      setEvents(events.filter(e => e.id !== id));
      setEventStatus('success');
      setEventMessage('Événement supprimé avec succès !');
    } else {
      setEventStatus('error');
      setEventMessage('Erreur lors de la suppression de l\'événement');
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

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategory.trim()) return;

    const response = await fetch('/api/categories', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name: newCategory }),
    });

    if (response.ok) {
      const data = await response.json();
      setCategories([...categories, data]);
      setNewCategory('');
    }
  };

  const handleDeleteCategory = async (id: number) => {
    const response = await fetch(`/api/categories/${id}`, {
      method: 'DELETE',
    });

    if (response.ok) {
      setCategories(categories.filter(cat => cat.id !== id));
    }
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
            <span className="hidden md:inline">Administration</span>
            <span className="md:hidden flex items-center gap-2">
              <Settings className="w-6 h-6" />
            </span>
          </h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">
              Bonjour <strong>{session.user.name}</strong>
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
        <div className="flex border-b border-gray-200 mb-6 overflow-x-auto whitespace-nowrap w-full scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
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
            onClick={() => setActiveTab('categories')}
            className={`px-6 py-3 font-helvetica font-semibold transition-colors border-b-2 ${
              activeTab === 'categories'
                ? 'text-cafe-joyeux border-cafe-joyeux'
                : 'text-gray-600 border-transparent hover:text-gray-800'
            }`}
          >
            Catégories
          </button>
        </div>

        {/* Contenu des onglets */}
        <div className="bg-white p-6 rounded-lg shadow-sm">
          {/* Onglet Plat du Jour */}
          {activeTab === 'plat' && (
            <section>
              <h2 className="font-helvetica text-2xl font-bold mb-4">
                Gérer les Plats du Jour
              </h2>
              <form onSubmit={handlePlatSubmit} className="space-y-8">
                {/* Premier plat */}
                <div className="space-y-4 p-4 border border-gray-200 rounded-lg">
                  <div className="flex justify-between items-center">
                    <h3 className="font-helvetica text-xl font-bold">Premier plat</h3>
                    <button
                      type="button"
                      onClick={() => handleDeletePlat(1)}
                      className="text-red-500 hover:text-red-700 font-helvetica font-semibold"
                    >
                      Supprimer le plat
                    </button>
                  </div>
                  <div>
                    <label className="block font-gotham text-sm font-medium text-gray-700 mb-1">
                      Nom du plat
                    </label>
                    <input
                      type="text"
                      name="nom"
                      value={plat.nom}
                      onChange={(e) => handleChange(e, 1)}
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
                      onChange={(e) => handleChange(e, 1)}
                      className="w-full p-2 border border-gray-300 rounded-md font-gotham"
                      rows={3}
                      required
                    />
                  </div>
                  <div>
                    <label className="block font-gotham text-sm font-medium text-gray-700 mb-1">
                      Catégories
                    </label>
                    <div className="flex gap-2 flex-wrap">
                      {categories.map((category) => (
                        <button
                          type="button"
                          key={category.id}
                          onClick={() => handleTagToggle(category.name, 1)}
                          className={`px-3 py-1 rounded-full text-xs font-semibold border transition-colors ${
                            plat.tags.includes(category.name)
                              ? 'bg-cafe-joyeux text-black border-cafe-joyeux'
                              : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-yellow-50'
                          }`}
                        >
                          {category.name}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block font-gotham text-sm font-medium text-gray-700 mb-1">
                      Image du plat
                    </label>
                    {plat.fileUrl && (
                      <div className="mb-4">
                        <div className="w-48 h-48 relative rounded-lg overflow-hidden border border-gray-200">
                          <Image
                            src={plat.fileUrl}
                            alt={plat.nom}
                            fill
                            className="object-cover"
                            sizes="(max-width: 768px) 100vw, 192px"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(1)}
                          className="mt-2 text-red-500 hover:text-red-700 font-helvetica font-semibold"
                        >
                          Supprimer l'image
                        </button>
                      </div>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageChange(e, 1)}
                      className="w-full p-2 border border-gray-300 rounded-md font-gotham
                        file:mr-4 file:py-2 file:px-4
                        file:rounded-full file:border-0
                        file:text-sm file:font-semibold
                        file:bg-cafe-joyeux file:text-white
                        hover:file:bg-cafe-joyeux/90"
                    />
                    {plat.image && (
                      <p className="mt-2 text-sm text-gray-500">
                        Nouvelle image sélectionnée : {plat.image.name}
                      </p>
                    )}
                  </div>
                </div>

                {/* Bouton pour ajouter un deuxième plat */}
                {!showSecondPlat && plat.nom && plat.description && (
                  <button
                    type="button"
                    onClick={() => setShowSecondPlat(true)}
                    className="w-full py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-cafe-joyeux hover:text-cafe-joyeux transition-colors font-helvetica font-semibold"
                  >
                    + Ajouter un deuxième plat
                  </button>
                )}

                {/* Deuxième plat */}
                {showSecondPlat && (
                  <div className="space-y-4 p-4 border border-gray-200 rounded-lg">
                    <div className="flex justify-between items-center">
                      <h3 className="font-helvetica text-xl font-bold">Deuxième plat</h3>
                      <button
                        type="button"
                        onClick={() => {
                          setShowSecondPlat(false);
                          setPlat2({
                            nom: '',
                            description: '',
                            tags: [],
                            image: null,
                            fileUrl: null,
                          });
                        }}
                        className="text-red-500 hover:text-red-700 font-helvetica font-semibold"
                      >
                        Supprimer le plat
                      </button>
                    </div>
                    <div>
                      <label className="block font-gotham text-sm font-medium text-gray-700 mb-1">
                        Nom du plat
                      </label>
                      <input
                        type="text"
                        name="nom"
                        value={plat2.nom}
                        onChange={(e) => handleChange(e, 2)}
                        className="w-full p-2 border border-gray-300 rounded-md font-gotham"
                      />
                    </div>
                    <div>
                      <label className="block font-gotham text-sm font-medium text-gray-700 mb-1">
                        Description
                      </label>
                      <textarea
                        name="description"
                        value={plat2.description}
                        onChange={(e) => handleChange(e, 2)}
                        className="w-full p-2 border border-gray-300 rounded-md font-gotham"
                        rows={3}
                      />
                    </div>
                    <div>
                      <label className="block font-gotham text-sm font-medium text-gray-700 mb-1">
                        Catégories
                      </label>
                      <div className="flex gap-2 flex-wrap">
                        {categories.map((category) => (
                          <button
                            type="button"
                            key={category.id}
                            onClick={() => handleTagToggle(category.name, 2)}
                            className={`px-3 py-1 rounded-full text-xs font-semibold border transition-colors ${
                              plat2.tags.includes(category.name)
                                ? 'bg-cafe-joyeux text-black border-cafe-joyeux'
                                : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-yellow-50'
                            }`}
                          >
                            {category.name}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block font-gotham text-sm font-medium text-gray-700 mb-1">
                        Image du plat
                      </label>
                      {plat2.fileUrl && (
                        <div className="mb-4">
                          <div className="w-48 h-48 relative rounded-lg overflow-hidden border border-gray-200">
                            <Image
                              src={plat2.fileUrl}
                              alt={plat2.nom}
                              fill
                              className="object-cover"
                              sizes="(max-width: 768px) 100vw, 192px"
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveImage(2)}
                            className="mt-2 text-red-500 hover:text-red-700 font-helvetica font-semibold"
                          >
                            Supprimer l'image
                          </button>
                        </div>
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleImageChange(e, 2)}
                        className="w-full p-2 border border-gray-300 rounded-md font-gotham
                          file:mr-4 file:py-2 file:px-4
                          file:rounded-full file:border-0
                          file:text-sm file:font-semibold
                          file:bg-cafe-joyeux file:text-white
                          hover:file:bg-cafe-joyeux/90"
                      />
                      {plat2.image && (
                        <p className="mt-2 text-sm text-gray-500">
                          Nouvelle image sélectionnée : {plat2.image.name}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                <div className="flex gap-2">
                  <button
                    type="submit"
                    className="flex-1 bg-cafe-joyeux text-white font-helvetica font-bold py-2 px-4 rounded-md hover:bg-yellow-500 transition-colors"
                  >
                    Enregistrer les modifications
                  </button>
                </div>
                {platStatus === 'success' && (
                  <p className="text-green-600 text-sm">{platMessage}</p>
                )}
                {platStatus === 'error' && (
                  <p className="text-red-600 text-sm">{platMessage}</p>
                )}
              </form>
            </section>
          )}

          {/* Onglet Events */}
          {activeTab === 'event' && (
            <section>
              <h2 className="font-helvetica text-2xl font-bold mb-4">
                {editingEvent ? 'Modifier un Événement' : 'Ajouter un Événement'}
              </h2>
              <form onSubmit={editingEvent ? handleUpdateEvent : handleEventSubmit} className="space-y-4">
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
                <div className="flex gap-2">
                  <button
                    type="submit"
                    className="flex-1 bg-cafe-joyeux text-white font-helvetica font-bold py-2 px-4 rounded-md hover:bg-yellow-500 transition-colors"
                  >
                    {editingEvent ? 'Modifier l\'événement' : 'Ajouter l\'événement'}
                  </button>
                  {editingEvent && (
                    <button
                      type="button"
                      onClick={() => {
                        setEditingEvent(null);
                        setEvent({
                          titre: '',
                          date: '',
                          heure: '',
                          description: '',
                        });
                        setEventStatus('idle');
                      }}
                      className="bg-gray-500 text-white font-helvetica font-bold py-2 px-4 rounded-md hover:bg-gray-600 transition-colors"
                    >
                      Annuler
                    </button>
                  )}
                </div>
                {eventStatus === 'success' && (
                  <p className="text-green-600 text-sm">{eventMessage}</p>
                )}
                {eventStatus === 'error' && (
                  <p className="text-red-600 text-sm">{eventMessage}</p>
                )}
              </form>

              {/* Liste des événements */}
              <div className="mt-8">
                <h3 className="font-helvetica text-xl font-bold mb-4">Liste des événements</h3>
                <div className="space-y-4">
                  {events.map((event) => (
                    <div key={event.id} className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-helvetica font-bold text-lg">{event.titre}</h4>
                          <p className="text-gray-600">
                            {new Date(event.date).toLocaleDateString('fr-FR')} à {event.heure}
                          </p>
                          <p className="mt-2 text-gray-700">{event.description}</p>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEditEvent(event)}
                            className="text-blue-600 hover:text-blue-800 font-helvetica font-semibold"
                          >
                            Modifier
                          </button>
                          <button
                            onClick={() => handleDeleteEvent(event.id)}
                            className="text-red-500 hover:text-red-700 font-helvetica font-semibold"
                          >
                            Supprimer
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          )}

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
                    className="w-full p-2 border border-gray-300 rounded-md font-gotham
                      file:mr-4 file:py-2 file:px-4
                      file:rounded-full file:border-0
                      file:text-sm file:font-semibold
                      file:bg-cafe-joyeux file:text-white
                      hover:file:bg-cafe-joyeux/90"
                    required
                  />
                  {menuFile && (
                    <p className="mt-2 text-sm text-gray-500">
                      Fichier sélectionné : {menuFile.name}
                    </p>
                  )}
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
                  <p className="text-green-600 text-sm">Menu enregistré avec succès !</p>
                )}
                {uploadStatus === 'error' && (
                  <p className="text-red-600 text-sm">Erreur lors de l&apos;upload du menu</p>
                )}
              </form>

              {currentMenuUrl && (
                <div className="mt-8">
                  <h3 className="font-helvetica text-lg font-semibold mb-2">Menu actuel :</h3>
                  <div className="w-full h-[500px] border border-gray-200 rounded-lg overflow-hidden">
                    <iframe
                      src={`${currentMenuUrl}#toolbar=0&navpanes=0`}
                      className="w-full h-full"
                      title="Menu de la semaine"
                    />
                  </div>
                </div>
              )}
            </section>
          )}

          {/* Onglet Catégories */}
          {activeTab === 'categories' && (
            <section>
              <h2 className="font-helvetica text-2xl font-bold mb-4">
                Gérer les Catégories
              </h2>
              <form onSubmit={handleAddCategory} className="space-y-4 mb-6">
                <div>
                  <label className="block font-gotham text-sm font-medium text-gray-700 mb-1">
                    Nouvelle catégorie
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value)}
                      className="flex-1 p-2 border border-gray-300 rounded-md font-gotham"
                      placeholder="Nom de la catégorie"
                      required
                    />
                    <button
                      type="submit"
                      className="bg-cafe-joyeux text-white font-helvetica font-bold py-2 px-4 rounded-md hover:bg-yellow-500 transition-colors"
                    >
                      Ajouter
                    </button>
                  </div>
                </div>
              </form>

              <div className="space-y-2">
                {categories.map((category) => (
                  <div
                    key={category.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-md"
                  >
                    <span className="font-gotham">{category.name}</span>
                    <button
                      onClick={() => handleDeleteCategory(category.id)}
                      className="text-red-500 hover:text-red-700 font-helvetica font-semibold"
                    >
                      Supprimer
                    </button>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    </main>
  );
}
