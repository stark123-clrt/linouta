import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Plus, Edit2, Trash2, Save, X, Upload, Calendar, Mail, Phone, Package, Check, MapPin } from 'lucide-react';
import type { Product, Reservation } from '../types/database';

function Admin() {
  const [products, setProducts] = useState<Product[]>([]);
  const [reservations, setReservations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'products' | 'reservations'>('reservations');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<Product>({
    id: '',
    name: '',
    description: '',
    price: 0,
    image: '',
    category: '',
    minimum_quantity: 1
  });
  const [formLoading, setFormLoading] = useState(false);

  useEffect(() => {
    if (activeTab === 'products') {
      fetchProducts();
    } else {
      fetchReservations();
    }
  }, [activeTab]);

  async function fetchProducts() {
    try {
      console.log('Chargement des produits...');
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      console.log('Produits chargés avec succès:', data?.length);
      setProducts(data || []);
    } catch (error) {
      console.error('Erreur lors du chargement des produits:', error);
    } finally {
      setLoading(false);
    }
  }

  async function fetchReservations() {
    try {
      console.log('Chargement des réservations...');
      const { data, error } = await supabase
        .from('reservation_details_view')
        .select('*')
        .order('reservation_date', { ascending: false });

      if (error) throw error;
      console.log('Réservations chargées avec succès:', data?.length);
      setReservations(data || []);
    } catch (error) {
      console.error('Erreur lors du chargement des réservations:', error);
    } finally {
      setLoading(false);
    }
  }

  const handleConfirmReservation = async (reservationId: string) => {
    try {
      console.log('Confirmation de la réservation ID:', reservationId);

      if (!reservationId) {
        console.error('ID de réservation manquant');
        alert('Erreur: ID de réservation manquant');
        return;
      }

      // IMPORTANT: Mise à jour directe de la table reservations, pas de la vue
      const { error } = await supabase
        .from('reservations')
        .update({ status: 'confirmed' })
        .eq('id', reservationId);

      if (error) {
        console.error('Erreur lors de la confirmation:', error);
        alert('Erreur lors de la confirmation: ' + error.message);
        return;
      }

      console.log('Réservation confirmée avec succès');
      alert('Réservation confirmée avec succès!');
      await fetchReservations();
    } catch (error) {
      console.error('Erreur lors de la confirmation:', error);
      alert('Erreur lors de la confirmation de la réservation');
    }
  };

  const handleDeleteReservation = async (reservationId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette réservation ?')) return;

    try {
      console.log('Suppression de la réservation ID:', reservationId);

      if (!reservationId) {
        console.error('ID de réservation manquant');
        alert('Erreur: ID de réservation manquant');
        return;
      }

      // IMPORTANT: Suppression directe dans la table reservations, pas dans la vue
      const { error } = await supabase
        .from('reservations')
        .delete()
        .eq('id', reservationId);

      if (error) {
        console.error('Erreur lors de la suppression:', error);
        alert('Erreur lors de la suppression: ' + error.message);
        return;
      }

      console.log('Réservation supprimée avec succès');
      alert('Réservation supprimée avec succès!');
      await fetchReservations();
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      alert('Erreur lors de la suppression de la réservation');
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce produit ?')) return;

    try {
      console.log('Suppression du produit ID:', id);

      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Erreur lors de la suppression du produit:', error);
        alert('Erreur lors de la suppression: ' + error.message);
        return;
      }

      console.log('Produit supprimé avec succès');
      alert('Produit supprimé avec succès!');
      fetchProducts();
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
    }
  };

  const handleSubmitProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);

    try {
      if (editingId) {
        // Mise à jour d'un produit existant
        console.log('Mise à jour du produit:', editingId);
        const { error } = await supabase
          .from('products')
          .update({
            name: formData.name,
            description: formData.description,
            price: formData.price,
            image: formData.image,
            category: formData.category,
            minimum_quantity: formData.minimum_quantity
          })
          .eq('id', editingId);

        if (error) {
          console.error('Erreur lors de la mise à jour:', error);
          throw error;
        }

        alert('Produit mis à jour avec succès!');
      } else {
        // Création d'un nouveau produit
        console.log('Création d\'un nouveau produit');
        const { data, error } = await supabase
          .from('products')
          .insert([{
            name: formData.name,
            description: formData.description,
            price: formData.price,
            image: formData.image,
            category: formData.category,
            minimum_quantity: formData.minimum_quantity
          }])
          .select();

        if (error) {
          console.error('Erreur lors de la création:', error);
          throw error;
        }

        console.log('Produit créé:', data);
        alert('Produit ajouté avec succès!');
      }

      // Réinitialiser le formulaire et rafraîchir la liste
      setShowForm(false);
      setEditingId(null);
      setFormData({
        id: '',
        name: '',
        description: '',
        price: 0,
        image: '',
        category: '',
        minimum_quantity: 1
      });
      await fetchProducts();
    } catch (error) {
      console.error('Erreur lors de la soumission du formulaire:', error);
      alert('Une erreur est survenue lors de l\'enregistrement du produit');
    } finally {
      setFormLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">Chargement...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Administration</h1>
          <div className="flex space-x-4">
            <button
              type="button"
              onClick={() => setActiveTab('products')}
              className={`px-4 py-2 rounded-md ${activeTab === 'products'
                  ? 'bg-rose-600 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-100'
                }`}
            >
              Produits
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('reservations')}
              className={`px-4 py-2 rounded-md ${activeTab === 'reservations'
                  ? 'bg-rose-600 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-100'
                }`}
            >
              Réservations
            </button>
          </div>
        </div>

        {activeTab === 'reservations' && (
          <div className="bg-white shadow overflow-hidden rounded-lg">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Client
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Produits
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Adresse
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Statut
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {reservations.map(reservation => (
                  <tr key={reservation.reservation_id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(reservation.reservation_date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">
                        {reservation.customer_name}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-500">
                        <div className="flex items-center">
                          <Mail className="w-4 h-4 mr-1" />
                          {reservation.customer_email}
                        </div>
                        <div className="flex items-center mt-1">
                          <Phone className="w-4 h-4 mr-1" />
                          {reservation.customer_phone}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-500">
                        <div className="flex items-center">
                          <Package className="w-4 h-4 mr-1" />
                          {reservation.products_summary || 'Aucun produit'}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {reservation.total_amount || 0}€
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-500">
                        <div className="flex items-start">
                          <MapPin className="w-4 h-4 mr-1 mt-0.5" />
                          {reservation.adresse || 'Non spécifiée'}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${reservation.reservation_status === 'pending'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-green-100 text-green-800'
                        }`}>
                        {reservation.reservation_status === 'pending' ? 'En attente' : 'Confirmé'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        {reservation.reservation_status === 'pending' && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              console.log('Clic sur le bouton de confirmation pour ID:', reservation.reservation_id);
                              handleConfirmReservation(reservation.reservation_id);
                            }}
                            className="text-green-600 hover:text-green-900 cursor-pointer"
                            title="Confirmer la réservation"
                          >
                            <Check className="w-5 h-5" />
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            console.log('Clic sur le bouton de suppression pour ID:', reservation.reservation_id);
                            handleDeleteReservation(reservation.reservation_id);
                          }}
                          className="text-red-600 hover:text-red-900 cursor-pointer"
                          title="Supprimer la réservation"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'products' && (
          <>
            <div className="flex justify-end mb-4">
              <button
                type="button"
                onClick={() => {
                  setEditingId(null);
                  setFormData({
                    id: '',
                    name: '',
                    description: '',
                    price: 0,
                    image: '',
                    category: '',
                    minimum_quantity: 1
                  });
                  setShowForm(true);
                }}
                className="bg-rose-600 text-white px-4 py-2 rounded-md hover:bg-rose-700 flex items-center"
              >
                <Plus className="w-5 h-5 mr-2" />
                Nouveau Produit
              </button>
            </div>

            <div className="bg-white shadow overflow-hidden rounded-lg">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Image
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Produit
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Catégorie
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Prix
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {products.map(product => (
                    <tr key={product.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <img
                          src={product.image}
                          alt={product.name}
                          className="h-16 w-16 object-cover rounded"
                        />
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">{product.name}</div>
                        <div className="text-sm text-gray-500">{product.description}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {product.category}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {product.price}€
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              setFormData(product);
                              setEditingId(product.id);
                              setShowForm(true);
                            }}
                            className="text-indigo-600 hover:text-indigo-900 cursor-pointer"
                            title="Modifier le produit"
                          >
                            <Edit2 className="w-5 h-5" />
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              handleDeleteProduct(product.id);
                            }}
                            className="text-red-600 hover:text-red-900 cursor-pointer"
                            title="Supprimer le produit"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* Formulaire modal pour ajouter/modifier un produit */}
        {showForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  {editingId ? 'Modifier le produit' : 'Ajouter un produit'}
                </h3>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleSubmitProduct} className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                    Nom du produit
                  </label>
                  <input
                    type="text"
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-rose-300 focus:ring focus:ring-rose-200 focus:ring-opacity-50"
                  />
                </div>

                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                    Description
                  </label>
                  <textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-rose-300 focus:ring focus:ring-rose-200 focus:ring-opacity-50"
                  />
                </div>

                <div>
                  <label htmlFor="price" className="block text-sm font-medium text-gray-700">
                    Prix (€)
                  </label>
                  <input
                    type="number"
                    id="price"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                    min="0"
                    step="0.1"
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-rose-300 focus:ring focus:ring-rose-200 focus:ring-opacity-50"
                  />
                </div>

                // Remplacez la section actuelle pour l'image
                <div>
                  <label htmlFor="image" className="block text-sm font-medium text-gray-700">
                    Image du produit
                  </label>
                  <div className="mt-1 flex items-center">
                    {formData.image && (
                      <div className="mr-3">
                        <img
                          src={formData.image}
                          alt="Aperçu"
                          className="h-16 w-16 object-cover rounded"
                        />
                      </div>
                    )}
                    <label className="cursor-pointer bg-white py-2 px-3 border border-gray-300 rounded-md shadow-sm text-sm leading-4 font-medium text-gray-700 hover:bg-gray-50 focus:outline-none">
                      <span>{formData.image ? 'Changer l\'image' : 'Télécharger une image'}</span>
                      <input
                        type="file"
                        id="image"
                        accept="image/*"
                        className="sr-only"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            try {
                              setFormLoading(true);

                              // Générer un nom de fichier unique
                              const fileExt = file.name.split('.').pop();
                              const fileName = `${Math.random()}.${fileExt}`;
                              const filePath = `products/${fileName}`;

                              // Télécharger le fichier vers Supabase Storage
                              const { error: uploadError } = await supabase.storage
                                .from('products')
                                .upload(filePath, file);

                              if (uploadError) throw uploadError;

                              // Obtenir l'URL publique
                              const { data } = supabase.storage
                                .from('products')
                                .getPublicUrl(filePath);

                              // Mettre à jour le formulaire avec l'URL de l'image
                              setFormData({
                                ...formData,
                                image: data.publicUrl
                              });
                            } catch (error) {
                              console.error('Erreur lors du téléchargement:', error);
                              alert('Erreur lors du téléchargement de l\'image');
                            } finally {
                              setFormLoading(false);
                            }
                          }
                        }}
                      />
                    </label>
                  </div>
                  {formData.image && (
                    <p className="mt-2 text-xs text-gray-500">
                      Image actuelle: {formData.image.split('/').pop()}
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="category" className="block text-sm font-medium text-gray-700">
                    Catégorie
                  </label>
                  <input
                    type="text"
                    id="category"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-rose-300 focus:ring focus:ring-rose-200 focus:ring-opacity-50"
                  />
                </div>

                <div>
                  <label htmlFor="minimum_quantity" className="block text-sm font-medium text-gray-700">
                    Quantité minimum
                  </label>
                  <input
                    type="number"
                    id="minimum_quantity"
                    value={formData.minimum_quantity}
                    onChange={(e) => setFormData({ ...formData, minimum_quantity: parseInt(e.target.value) || 1 })}
                    min="1"
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-rose-300 focus:ring focus:ring-rose-200 focus:ring-opacity-50"
                  />
                </div>

                <div className="pt-4 flex space-x-2">
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    disabled={formLoading}
                    className={`px-4 py-2 bg-rose-600 text-white rounded-md hover:bg-rose-700 flex items-center ${formLoading ? 'opacity-70 cursor-not-allowed' : ''
                      }`}
                  >
                    {formLoading ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Traitement...
                      </>
                    ) : (
                      <>
                        <Save className="w-5 h-5 mr-2" />
                        {editingId ? 'Mettre à jour' : 'Ajouter'}
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Admin;