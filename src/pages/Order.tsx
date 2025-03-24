import React, { useState, useEffect } from 'react';
import { ShoppingCart, Minus, Plus, ArrowLeft, Send, Calendar, X, ChevronUp, ChevronDown } from 'lucide-react';
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
  const [showCart, setShowCart] = useState(false);
  const [reservationFormData, setReservationFormData] = useState<ReservationFormData>({
    name: '',
    email: '',
    phone: '',
    adresse: ''
  });
  // Utilisons String au lieu d'union de littéraux pour éviter les erreurs TypeScript
  const [reservationStatus, setReservationStatus] = useState<string>('idle');
  const [verificationCode, setVerificationCode] = useState('');
  const [pendingReservationData, setPendingReservationData] = useState<any>({});

  useEffect(() => {
    fetchProducts();
    emailjs.init("zn0TCnexZP6HKkImQ");
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

  const cartTotal = cart.reduce((sum, item) => sum + item.quantity, 0);
  const cartTotalPrice = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const getQuantityInCart = (productId: string) => {
    const item = cart.find(item => item.id === productId);
    return item ? item.quantity : 0;
  };

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
    setCart(currentCart => {
      if (change < 0) {
        const item = currentCart.find(item => item.id === id);
        if (item && item.quantity + change <= 0) {
          return currentCart.filter(item => item.id !== id);
        }
      }

      return currentCart.map(item => {
        if (item.id === id) {
          return { ...item, quantity: item.quantity + change };
        }
        return item;
      });
    });
  };

  const removeFromCart = (id: string) => {
    setCart(currentCart => currentCart.filter(item => item.id !== id));
  };

  const handleReservationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) {
      alert('Veuillez sélectionner au moins un produit');
      return;
    }

    setReservationStatus('submitting');

    try {
      const { data: existingReservations, error: checkError } = await supabase
        .from('reservations')
        .select('*')
        .eq('customer_email', reservationFormData.email);

      if (checkError) throw checkError;

      if (existingReservations && existingReservations.length > 0) {
        const pendingReservations = existingReservations.filter(r => r.status === 'pending');

        if (pendingReservations.length > 0) {
          alert('Vous avez déjà une réservation en attente. Veuillez la compléter ou contacter le service client.');
          setReservationStatus('idle');
          return;
        }

        const confirmedReservations = existingReservations.filter(r => r.status === 'confirmed');
        if (confirmedReservations.length > 0) {
          setReservationStatus('idle');
          alert('Vous avez déjà des réservations.');
          return;
        }
      }

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
    setReservationStatus('submitting');

    try {
      if (code !== pendingReservationData.code) {
        alert('Code de vérification incorrect');
        setReservationStatus('awaiting_verification');
        return;
      }

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

      try {
        const { data: reservationDetails, error: viewError } = await supabase
          .from('reservation_details_view')
          .select('*')
          .eq('reservation_id', reservationData.id)
          .single();

        if (viewError) throw viewError;

        const webhookResponse = await fetch(
          'https://n8n-7qm2.onrender.com/webhook/b4b58233-dc5d-4cfb-a101-cf84eb19db01', 
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
        console.error('Erreur lors de l\'envoi au webhook:', webhookError);
      }

      // Fermer immédiatement le modal
      setCart([]);
      setShowReservationForm(false);
      setReservationStatus('idle');

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

  // Fonction pour vérifier les états sans utiliser de comparaison stricte
  const isSubmitting = () => reservationStatus === 'submitting';
  const isAwaitingVerification = () => reservationStatus === 'awaiting_verification';

  return (
    <div className="min-h-screen bg-gray-50">
      {/* En-tête avec panier */}
      <div className="bg-white shadow sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <button
                onClick={() => window.history.back()}
                className="mr-4 text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="w-6 h-6" />
              </button>
              <h1 className="text-2xl font-semibold text-gray-900">Réserver</h1>
            </div>

            {/* Bouton du panier avec badge */}
            <button
              onClick={() => setShowCart(!showCart)}
              className="relative p-2 bg-rose-50 text-rose-600 rounded-full hover:bg-rose-100 transition-colors"
            >
              <ShoppingCart className="w-6 h-6" />
              {cartTotal > 0 && (
                <span className="absolute -top-1 -right-1 bg-rose-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {cartTotal}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Panier flottant */}
        {showCart && cart.length > 0 && (
          <div className="fixed right-4 top-20 z-20 bg-white shadow-lg rounded-lg w-80 max-h-96 overflow-auto">
            <div className="p-4 bg-rose-50 flex justify-between items-center sticky top-0">
              <h3 className="font-semibold text-rose-700">Votre panier ({cartTotal})</h3>
              <button onClick={() => setShowCart(false)} className="text-rose-700">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="divide-y divide-gray-100">
              {cart.map(item => (
                <div key={item.id} className="flex items-center justify-between p-3">
                  <div className="flex-1">
                    <p className="font-medium">{item.name}</p>
                    <p className="text-sm text-gray-500">{item.price}€ × {item.quantity}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => updateQuantity(item.id, -1)}
                      className="p-1 bg-gray-100 rounded-full text-gray-700"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="text-sm font-medium w-6 text-center">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.id, 1)}
                      className="p-1 bg-gray-100 rounded-full text-gray-700"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <div className="p-4 bg-white border-t sticky bottom-0">
              <div className="flex justify-between font-semibold mb-4">
                <span>Total</span>
                <span>{cartTotalPrice}€</span>
              </div>
              <button
                onClick={() => {
                  setShowReservationForm(true);
                  setShowCart(false);
                }}
                className="w-full bg-rose-600 text-white py-2 px-4 rounded-md hover:bg-rose-700 transition-colors"
              >
                Passer à la réservation
              </button>
            </div>
          </div>
        )}

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

        {/* Liste des produits avec bouton simplifié */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map(product => {
            const quantityInCart = getQuantityInCart(product.id);

            return (
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

                  {/* Bouton simplifié avec badge de quantité */}
                  <button
                    onClick={() => addToCart(product)}
                    className="mt-4 w-full bg-rose-600 text-white py-2 px-4 rounded-md hover:bg-rose-700 transition-colors flex items-center justify-center"
                  >
                    <div className="relative mr-2">
                      <ShoppingCart className="w-5 h-5" />
                      {quantityInCart > 0 && (
                        <span className="absolute -top-2 -right-2 bg-white text-rose-600 text-xs font-bold rounded-full w-4 h-4 flex items-center justify-center">
                          {quantityInCart}
                        </span>
                      )}
                    </div>
                    Ajouter au panier
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Bouton flottant pour réserver */}
      {cart.length > 0 && !showCart && (
        <div className="fixed bottom-4 right-4 z-20">
          <button
            onClick={() => setShowReservationForm(true)}
            className="bg-rose-600 text-white py-3 px-6 rounded-full shadow-lg hover:bg-rose-700 transition-colors flex items-center space-x-2"
          >
            <Calendar className="w-5 h-5" />
            <span>Réserver ({cartTotal})</span>
            <span className="font-bold">{cartTotalPrice}€</span>
          </button>
        </div>
      )}

      {/* Modal Formulaire de Réservation */}
      {showReservationForm && !isAwaitingVerification() && (
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
                <X className="w-6 h-6" />
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
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-rose-300 focus:ring focus:ring-rose-200 focus:ring-opacity-50"
                  placeholder="Votre adresse de livraison"
                />
              </div>

              <div className="mt-6">
                <div className="flex justify-between items-center">
                  <h4 className="font-medium text-gray-900">Récapitulatif de commande</h4>
                  <span className="text-sm text-gray-500">{cartTotal} article(s)</span>
                </div>
                <div className="mt-2 space-y-2 max-h-40 overflow-auto">
                  {cart.map(item => (
                    <div key={item.id} className="flex justify-between text-sm py-2 border-b">
                      <span>{item.name} × {item.quantity}</span>
                      <span className="font-medium">{(item.price * item.quantity).toFixed(2)}€</span>
                    </div>
                  ))}
                </div>
                <div className="pt-2 mt-2">
                  <div className="flex justify-between font-semibold text-lg">
                    <span>Total</span>
                    <span>{cartTotalPrice.toFixed(2)}€</span>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting()}
                className={`w-full flex items-center justify-center space-x-2 py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-rose-600 hover:bg-rose-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-rose-500 ${isSubmitting() ? 'opacity-75 cursor-not-allowed' : ''
                  }`}
              >
                <Calendar className="w-5 h-5" />
                <span>
                  {isSubmitting() ? 'Traitement en cours...' : 'Confirmer la réservation'}
                </span>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Modal Vérification Email */}
      {showReservationForm && isAwaitingVerification() && (
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
                <X className="w-6 h-6" />
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
                disabled={isSubmitting()}
                className={`w-full flex items-center justify-center space-x-2 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-rose-600 hover:bg-rose-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-rose-500 ${isSubmitting() ? 'opacity-75 cursor-not-allowed' : ''
                  }`}
              >
                <span>
                  {isSubmitting() ? 'Traitement en cours...' : 'Vérifier et confirmer'}
                </span>
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Order;