import React from 'react';
import { X, Instagram, Facebook } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="w-full bg-white border-t border-gray-200">
      <div className="container mx-auto px-4 py-8">
        {/* Main Footer Sections - Horizontal layout for section columns */}
        <div className="flex flex-col sm:flex-row sm:justify-between gap-8">
          {/* SERVICE CLIENT */}
          <div className="flex flex-col">
            <h3 className="font-bold text-lg mb-4">SERVICE CLIENT</h3>
            <a href="#" className="mb-2 hover:underline">Assistance</a>
            <a href="#" className="mb-2 hover:underline">Suivi commande</a>
            <a href="#" className="mb-2 hover:underline">Livraison & retours</a>
            
            <div className="flex mt-4 space-x-4">
              <a href="#" className="hover:opacity-70">
                <X size={24} />
              </a>
              <a href="#" className="hover:opacity-70">
                <Instagram size={24} />
              </a>
              <a href="#" className="hover:opacity-70">
                <Facebook size={24} />
              </a>
            </div>
          </div>
          
          {/* À PROPOS DE NOUS */}
          <div className="flex flex-col">
            <h3 className="font-bold text-lg mb-4">À PROPOS DE NOUS</h3>
            <a href="#" className="mb-2 hover:underline">Confidentialité</a>
            <a href="#" className="mb-2 hover:underline">Paiement sécurisé</a>
            <a href="#" className="mb-2 hover:underline">Gérer les cookies</a>
          </div>
          
          {/* INFORMATIONS LEGALES */}
          <div className="flex flex-col">
            <h3 className="font-bold text-lg mb-4">INFORMATIONS LEGALES</h3>
            <a href="#" className="mb-2 hover:underline">Conditions générales</a>
            <a href="#" className="mb-2 hover:underline">Mentions légales</a>
            <a href="#" className="mb-2 hover:underline">Gérer les cookies</a>
          </div>
        </div>
        
        {/* Bottom Section */}
        <div className="mt-8 pt-4 border-t border-gray-200 flex flex-wrap justify-between items-center text-sm">
          <div className="mr-4">© 2025</div>
          <div className="flex flex-wrap items-center">
            <a href="#" className="hover:underline">Les coordonnées</a>
            <span className="mx-2">|</span>
            <a href="#" className="hover:underline">Confidentialité et cookies</a>
            <span className="mx-2">|</span>
            <a href="#" className="hover:underline">Conditions générales</a>
          </div>
        </div>
      </div>
    </footer>
  );
}