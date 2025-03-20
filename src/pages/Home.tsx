import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import {
  Instagram,
  Calendar,
  Mail,
  Globe,
  MapPin,
  User,
  QrCode,
  X,
  Send,
  CheckCircle2
} from 'lucide-react';
import { supabase } from '../lib/supabase';

function Home() {
  const navigate = useNavigate();
  const [showQRCode, setShowQRCode] = useState(false);
  const [showContactForm, setShowContactForm] = useState(false);
  const [formStatus, setFormStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  });

  const calendlyUrl = 'https://calendly.com/linouta';

  const handleScheduleMeeting = () => {
    navigate('/order');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormStatus('submitting');

    try {
      const { error } = await supabase
        .from('contacts')
        .insert([formData]);

      if (error) throw error;

      setFormStatus('success');
      setFormData({ name: '', email: '', phone: '', message: '' });
      setTimeout(() => {
        setShowContactForm(false);
        setFormStatus('idle');
      }, 2000);
    } catch (error) {
      console.error('Erreur:', error);
      setFormStatus('error');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-rose-100 flex items-center justify-center p-4 relative overflow-hidden">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden relative">
        {/* Section En-tête/Profil */}
        <div className="relative h-48">
          <div className="absolute inset-0">
            <img
              src="https://images.unsplash.com/photo-1590080875515-8a3a8dc5735e?auto=format&fit=crop&w=800"
              alt="Couverture Pâtisseries Marocaines"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-rose-900 bg-opacity-30"></div>
          </div>
          
          <div className="absolute -bottom-12 left-1/2 -translate-x-1/2">
            <div className="w-24 h-24 rounded-full border-4 border-white overflow-hidden shadow-lg">
              <img
                src="https://i.imgur.com/NHS3V5b.jpeg"
                alt="Linouta"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>

        {/* Section Contenu */}
        <div className="pt-16 pb-8 px-6">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900">Linouta</h1>
            <p className="text-rose-600 font-medium">Pâtissière Créative</p>
            <p className="text-sm text-gray-500 mt-2">
              <MapPin className="inline-block w-4 h-4 mr-1" />
              Paris, France
            </p>
          </div>

          {/* Description */}
          <div className="mt-6 text-center text-gray-600">
            <p className="font-medium">Artisan pâtissière passionnée</p>
            <p className="mt-2 text-sm">Spécialiste en pâtisseries marocaines et buffets sur mesure</p>
          </div>

          {/* Services avec miniatures */}
          <div className="mt-8 space-y-4">
            {/* Pâtisseries Marocaines */}
            <div className="group relative overflow-hidden rounded-xl aspect-video shadow-md hover:shadow-lg transition-all duration-300">
              <img
                src="https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=800"
                alt="Pâtisseries Marocaines"
                className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end p-4">
                <div>
                  <p className="text-lg font-medium text-white">Pâtisseries Marocaines</p>
                  <p className="text-sm text-rose-200">Cornes de gazelle, Briouates, Ghriba</p>
                </div>
              </div>
            </div>

            {/* Buffets */}
            <div className="group relative overflow-hidden rounded-xl aspect-video shadow-md hover:shadow-lg transition-all duration-300">
              <img
                src="https://images.unsplash.com/photo-1533777857889-4be7c70b33f7?auto=format&fit=crop&w=800"
                alt="Buffets"
                className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end p-4">
                <div>
                  <p className="text-lg font-medium text-white">Buffets Événementiels</p>
                  <p className="text-sm text-rose-200">Mariages, Fêtes, Cérémonies</p>
                </div>
              </div>
            </div>

            {/* Gâteaux Personnalisés */}
            <div className="group relative overflow-hidden rounded-xl aspect-video shadow-md hover:shadow-lg transition-all duration-300">
              <img
                src="https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=800"
                alt="Gâteaux Personnalisés"
                className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end p-4">
                <div>
                  <p className="text-lg font-medium text-white">Gâteaux Personnalisés</p>
                  <p className="text-sm text-rose-200">Design unique pour vos occasions</p>
                </div>
              </div>
            </div>
          </div>

          {/* Informations de Contact */}
          <div className="mt-8 space-y-4">
            <a href="mailto:linouta.patisserie@gmail.com" 
               className="flex items-center justify-center space-x-2 text-gray-600 hover:text-rose-600 transition-colors">
              <Mail className="w-5 h-5" />
              <span>linouta.patisserie@gmail.com</span>
            </a>
            <a href="https://linouta.carrd.co"
               className="flex items-center justify-center space-x-2 text-gray-600 hover:text-rose-600 transition-colors">
              <Globe className="w-5 h-5" />
              <span>linouta.carrd.co</span>
            </a>
          </div>

          {/* Réseaux Sociaux */}
          <div className="mt-8 flex justify-center space-x-4">
            <a href="https://instagram.com/linouta" target="_blank" rel="noopener noreferrer"
               className="p-3 bg-gradient-to-br from-rose-100 to-rose-200 rounded-full hover:from-rose-200 hover:to-rose-300 transition-colors shadow-sm">
              <Instagram className="w-6 h-6 text-rose-600" />
            </a>
          </div>

          {/* Boutons de Commande */}
          <div className="mt-8 grid grid-cols-2 gap-4">
            <button
              onClick={handleScheduleMeeting}
              className="bg-gradient-to-r from-rose-500 to-rose-600 text-white py-3 px-4 rounded-lg flex items-center justify-center space-x-2 hover:from-rose-600 hover:to-rose-700 transition-colors shadow-md hover:shadow-lg"
            >
              <Calendar className="w-5 h-5" />
              <span>Commander</span>
            </button>
            <button
              onClick={() => setShowQRCode(true)}
              className="bg-gradient-to-r from-rose-500 to-rose-600 text-white py-3 px-4 rounded-lg flex items-center justify-center space-x-2 hover:from-rose-600 hover:to-rose-700 transition-colors shadow-md hover:shadow-lg"
            >
              <QrCode className="w-5 h-5" />
              <span>QR Code</span>
            </button>
          </div>

          {/* Télécharger vCard */}
          <div className="mt-4">
            <button
              onClick={() => setShowContactForm(true)}
              className="w-full bg-gradient-to-r from-rose-50 to-rose-100 text-rose-600 py-3 px-4 rounded-lg flex items-center justify-center space-x-2 hover:from-rose-100 hover:to-rose-200 transition-colors shadow-sm"
            >
              <User className="w-5 h-5" />
              <span>Me contacter</span>
            </button>
          </div>
        </div>
      </div>

      {/* Modal QR Code */}
      {showQRCode && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Scanner pour commander</h3>
              <button
                onClick={() => setShowQRCode(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="flex justify-center">
              <QRCodeSVG
                value={calendlyUrl}
                size={200}
                level="H"
                includeMargin
                className="border-8 border-white rounded"
              />
            </div>
            <p className="text-center mt-4 text-sm text-gray-600">
              Scannez ce QR code pour accéder directement à la page de réservation
            </p>
          </div>
        </div>
      )}

      {/* Modal Formulaire de Contact */}
      {showContactForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Contactez-moi</h3>
              <button
                onClick={() => {
                  setShowContactForm(false);
                  setFormStatus('idle');
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  Nom complet
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
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
                  value={formData.email}
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
                  value={formData.phone}
                  onChange={handleInputChange}
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-rose-300 focus:ring focus:ring-rose-200 focus:ring-opacity-50"
                />
              </div>
              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700">
                  Message (optionnel)
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  rows={3}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-rose-300 focus:ring focus:ring-rose-200 focus:ring-opacity-50"
                />
              </div>

              <div className="relative">
                <button
                  type="submit"
                  disabled={formStatus === 'submitting'}
                  className={`w-full flex items-center justify-center space-x-2 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-rose-600 hover:bg-rose-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-rose-500 ${
                    formStatus === 'submitting' ? 'opacity-75 cursor-not-allowed' : ''
                  }`}
                >
                  {formStatus === 'success' ? (
                    <CheckCircle2 className="w-5 h-5 success-animation text-white" />
                  ) : (
                    <Send className="w-5 h-5" />
                  )}
                  <span className={formStatus === 'success' ? 'success-message' : ''}>
                    {formStatus === 'submitting' ? 'Envoi en cours...' :
                     formStatus === 'success' ? 'Envoyé !' :
                     formStatus === 'error' ? 'Erreur, réessayer' :
                     'Envoyer'}
                  </span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Home;