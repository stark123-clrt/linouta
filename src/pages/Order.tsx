import React, { useState, useEffect } from 'react';
import { ShoppingCart, Minus, Plus, ArrowLeft, Send, Calendar } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Product } from '../types/database';
import emailjs from '@emailjs/browser';

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

interface ReservationFormData {
  name: string;
  email: string;
  phone: string;
  adresse: string;
}

function Order() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [activeCategory, setActiveCategory] = useState('Tous');
  const [showReservationForm, setShowReservationForm] = useState(false);
  const [reservationFormData, setReservationFormData] = useState<ReservationFormData>({
    name: '',
    email: '',
    phone: '',
    adresse: ''
  });
  const [reservationStatus, setReservationStatus] = useState<'idle' | 'submitting' | 'awaiting_verification' | 'success' | 'error'>('idle');
  const [verificationCode, setVerificationCode] = useState('');
  const [pendingReservationData, setPendingReservationData] = useState<any>({});

  useEffect(() => {
    fetchProducts();
  }, []);

  async function fetchProducts() {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*');

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error('Erreur lors du chargement des produits:', error);
    } finally {
      setLoading(false);
    }
  }

  const categories = ['Tous', ...new Set(products.map(p => p.category))];

  const filteredProducts = activeCategory === 'Tous'
    ? products
    : products.filter(p => p.category === activeCategory);

  const addToCart = (product: Product) => {
    setCart(currentCart => {
      const existingItem = currentCart.find(item => item.id === product.id);
      if (existingItem) {
        return currentCart.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...currentCart, {
        id: product.id,
        name: product.name,
        price: product.price,
        quantity: 1
      }];
    });
  };

  const updateQuantity = (id: string, change: number) => {
    setCart(currentCart =>
      currentCart.map(item => {
        if (item.id === id) {
          const newQuantity = item.quantity + change;
          if (newQuantity < 1) {
            return item;
          }
          return { ...item, quantity: newQuantity };
        }
        return item;
      })
    );
  };

  const removeFromCart = (id: string) => {
    setCart(currentCart => currentCart.filter(item => item.id !== id));
  };

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  emailjs.init("zn0TCnexZP6HKkImQ");

  const handleReservationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) {
      alert('Veuillez sélectionner au moins un produit');
      return;
    }

    setReservationStatus('submitting');

    try {
      // Vérifier les réservations existantes
      const { data: existingReservations, error: checkError } = await supabase
        .from('reservations')
        .select('*')
        .eq('customer_email', reservationFormData.email);

      if (checkError) throw checkError;

      // IMPORTANT: Vérifier d'abord s'il y a des réservations en attente
      if (existingReservations && existingReservations.length > 0) {
        const pendingReservations = existingReservations.filter(r => r.status === 'pending');

        if (pendingReservations.length > 0) {
          alert('Vous avez déjà une réservation en attente. Veuillez la compléter ou contacter le service client.');
          setReservationStatus('idle');
          return; // Arrête l'exécution ici
        }

        // Vérifier les réservations confirmées
        // Vérifier les réservations confirmées
        // Vérifier les réservations confirmées
        // Vérifier les réservations confirmées
        const confirmedReservations = existingReservations.filter(r => r.status === 'confirmed');
        if (confirmedReservations.length > 0) {
          setReservationStatus('idle');

          // Simple alerte avec un seul bouton (OK)
          alert('Vous avez déjà des réservations.');

          // On arrête le processus ici, sans offrir d'option pour continuer
          return;
        }
      }

      // On ne génère le code et on n'envoie l'email que si toutes les vérifications sont passées
      const vCode = Math.floor(100000 + Math.random() * 900000).toString();

      const tempData = {
        customer_name: reservationFormData.name,
        customer_email: reservationFormData.email,
        customer_phone: reservationFormData.phone,
        adresse: reservationFormData.adresse,
        cart: cart,
        code: vCode
      };

      setPendingReservationData(tempData);

      const emailParams = {
        passcode: vCode,
        time: new Date().toLocaleString(),
        email: reservationFormData.email
      };

      // Envoi de l'email
      const result = await emailjs.send(
        'service_ukh8sto',
        'template_ka849g7',
        emailParams,
        'zn0TCnexZP6HKkImQ'
      );

      setVerificationCode('');
      setReservationStatus('awaiting_verification');

    } catch (error) {
      console.error('Erreur:', error);
      setReservationStatus('error');
      alert('Une erreur est survenue. Veuillez réessayer.');
    }
  };


  const handleVerifyCode = async (code: string) => {
    try {
      // Vérifier que le code entré correspond au code généré
      if (code !== pendingReservationData.code) {
        alert('Code de vérification incorrect');
        return;
      }
      
      // Créer la réservation dans la base de données
      const { data: reservationData, error: reservationError } = await supabase
        .from('reservations')
        .insert([{
          customer_name: pendingReservationData.customer_name,
          customer_email: pendingReservationData.customer_email,
          customer_phone: pendingReservationData.customer_phone,
          adresse: pendingReservationData.adresse,
          status: 'pending'
        }])
        .select()
        .single();
  
      if (reservationError) throw reservationError;
  
      // Ajouter les produits à la réservation
      const reservationItems = pendingReservationData.cart.map((item: CartItem) => ({
        reservation_id: reservationData.id,
        product_id: item.id,
        quantity: item.quantity,
        unit_price: item.price
      }));
  
      const { error: itemsError } = await supabase
        .from('reservation_items')
        .insert(reservationItems);
  
      if (itemsError) throw itemsError;
  
      // NOUVEAU: Envoyer les données au webhook n8n
      try {
        // Récupérer les détails complets de la réservation depuis la vue
        const { data: reservationDetails, error: viewError } = await supabase
          .from('reservation_details_view')
          .select('*')
          .eq('reservation_id', reservationData.id)
          .single();
          
        if (viewError) throw viewError;
        
        // Envoyer les données au webhook n8n
        const webhookResponse = await fetch(
          'https://n8n-tt17.onrender.com/webhook-test/66813848-e352-4d07-a50e-1ce071aad641', 
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(reservationDetails)
          }
        );
        
        console.log('Réponse du webhook:', await webhookResponse.text());
        
        if (!webhookResponse.ok) {
          console.error('Erreur lors de l\'envoi au webhook:', webhookResponse.statusText);
        }
      } catch (webhookError) {
        // On ne bloque pas le flux principal si le webhook échoue
        console.error('Erreur lors de l\'envoi au webhook:', webhookError);
      }
  
      // Réussite
      setReservationStatus('success');
      setCart([]);
      setTimeout(() => {
        setShowReservationForm(false);
        setReservationStatus('idle');
      }, 2000);
      
    } catch (error) {
      console.error('Erreur lors de la vérification:', error);
      setReservationStatus('error');
    }
  };


  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setReservationFormData(prev => ({ ...prev, [name]: value }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">Chargement des produits...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* En-tête */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center">
            <button
              onClick={() => window.history.back()}
              className="mr-4 text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <h1 className="text-2xl font-semibold text-gray-900">Réserver</h1>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Catégories */}
        <div className="flex space-x-4 mb-8 overflow-x-auto pb-2">
          {categories.map(category => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`px-4 py-2 rounded-full text-sm font-medium ${activeCategory === category
                ? 'bg-rose-600 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-100'
                } transition-colors duration-200 shadow-sm`}
            >
              {category}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Liste des produits */}
          <div className="col-span-1 md:col-span-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {filteredProducts.map(product => (
                <div key={product.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-48 object-cover"
                    crossOrigin="anonymous"
                  />
                  <div className="p-4">
                    <h3 className="text-lg font-semibold text-gray-900">{product.name}</h3>
                    <p className="mt-1 text-sm text-gray-500">{product.description}</p>
                    <p className="mt-2 text-rose-600 font-medium">{product.price}€ / pièce</p>
                    <button
                      onClick={() => addToCart(product)}
                      className="mt-4 w-full bg-rose-600 text-white py-2 px-4 rounded-md hover:bg-rose-700 transition-colors duration-200"
                    >
                      Ajouter au panier
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Panier */}
          <div className="col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                <ShoppingCart className="inline-block w-5 h-5 mr-2" />
                Votre sélection
              </h2>

              {cart.length === 0 ? (
                <p className="text-gray-500 text-center py-6">Votre panier est vide</p>
              ) : (
                <>
                  <div className="space-y-4">
                    {cart.map(item => (
                      <div key={item.id} className="flex items-center justify-between">
                        <div className="flex-1">
                          <h3 className="text-sm font-medium text-gray-900">{item.name}</h3>
                          <p className="text-sm text-gray-500">{item.price}€ × {item.quantity}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => updateQuantity(item.id, -1)}
                            className="p-1 text-gray-500 hover:text-gray-700"
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <span className="text-sm font-medium w-8 text-center">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.id, 1)}
                            className="p-1 text-gray-500 hover:text-gray-700"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-6 pt-6 border-t">
                    <div className="flex justify-between text-base font-medium text-gray-900">
                      <p>Total</p>
                      <p>{total}€</p>
                    </div>
                    <button
                      onClick={() => setShowReservationForm(true)}
                      className="mt-6 w-full bg-rose-600 text-white py-3 px-4 rounded-md hover:bg-rose-700 transition-colors duration-200 flex items-center justify-center"
                    >
                      <Calendar className="w-5 h-5 mr-2" />
                      Réserver
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal Formulaire de Réservation */}
      {showReservationForm && reservationStatus !== 'awaiting_verification' && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Finaliser la réservation</h3>
              <button
                onClick={() => {
                  setShowReservationForm(false);
                  setReservationStatus('idle');
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <ArrowLeft className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleReservationSubmit} className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  Nom complet
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={reservationFormData.name}
                  onChange={handleInputChange}
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-rose-300 focus:ring focus:ring-rose-200 focus:ring-opacity-50"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={reservationFormData.email}
                  onChange={handleInputChange}
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-rose-300 focus:ring focus:ring-rose-200 focus:ring-opacity-50"
                />
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                  Téléphone
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={reservationFormData.phone}
                  onChange={handleInputChange}
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-rose-300 focus:ring focus:ring-rose-200 focus:ring-opacity-50"
                />
              </div>

              <div>
                <label htmlFor="adresse" className="block text-sm font-medium text-gray-700">
                  Adresse
                </label>
                <textarea
                  id="adresse"
                  name="adresse"
                  value={reservationFormData.adresse}
                  onChange={handleInputChange}
                  rows={4}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-rose-300 focus:ring focus:ring-rose-200 focus:ring-opacity-50"
                  placeholder="Votre Adresse"
                />
              </div>

              <div className="mt-6">
                <h4 className="font-medium text-gray-900">Récapitulatif de votre sélection</h4>
                <div className="mt-2 space-y-2">
                  {cart.map(item => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span>{item.name} × {item.quantity}</span>
                      <span>{item.price * item.quantity}€</span>
                    </div>
                  ))}
                  <div className="pt-2 border-t border-gray-200">
                    <div className="flex justify-between font-medium">
                      <span>Total</span>
                      <span>{total}€</span>
                    </div>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={reservationStatus === 'submitting'}
                className={`w-full flex items-center justify-center space-x-2 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-rose-600 hover:bg-rose-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-rose-500 ${reservationStatus === 'submitting' ? 'opacity-75 cursor-not-allowed' : ''
                  }`}
              >
                <Send className="w-5 h-5" />
                <span>
                  {reservationStatus === 'submitting' ? 'Envoi en cours...' :
                    reservationStatus === 'success' ? 'Réservation envoyée !' :
                      reservationStatus === 'error' ? 'Erreur, réessayer' :
                        'Confirmer la réservation'}
                </span>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Modal Vérification Email */}
      {showReservationForm && reservationStatus === 'awaiting_verification' && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Vérifier votre email</h3>
              <button
                onClick={() => {
                  setShowReservationForm(false);
                  setReservationStatus('idle');
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <ArrowLeft className="w-6 h-6" />
              </button>
            </div>
            <div className="text-center mb-6">
              <p className="text-gray-600">
                Nous avons envoyé un code de vérification à votre email.
                Veuillez entrer ce code pour confirmer votre réservation.
              </p>
            </div>
            <form onSubmit={(e) => {
              e.preventDefault();
              handleVerifyCode(verificationCode);
            }} className="space-y-4">
              <div>
                <label htmlFor="code" className="block text-sm font-medium text-gray-700">
                  Code de vérification
                </label>
                <input
                  type="text"
                  id="code"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  placeholder="Entrez le code à 6 chiffres"
                  maxLength={6}
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-rose-300 focus:ring focus:ring-rose-200 focus:ring-opacity-50 text-center text-2xl tracking-widest"
                />
              </div>
              <button
                type="submit"
                className="w-full flex items-center justify-center space-x-2 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-rose-600 hover:bg-rose-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-rose-500"
              >
                <span>Vérifier et confirmer</span>
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Order;