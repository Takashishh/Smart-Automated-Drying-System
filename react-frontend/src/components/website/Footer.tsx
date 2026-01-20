import React from 'react';
import { Droplets, Github, Linkedin, Mail, MapPin } from 'lucide-react';
interface FooterProps {
  onNavigate: (page: string) => void;
}
export function Footer({
  onNavigate
}: FooterProps) {
  return <footer className="bg-gray-50 pt-16 pb-8 border-t border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          {/* Brand */}
          <div className="col-span-1 md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-1.5 bg-blue-600 rounded-lg">
                <Droplets className="w-5 h-5 text-white" />
              </div>
              <span className="text-lg font-bold text-gray-900">
                Smart Laundry
              </span>
            </div>
            <p className="text-gray-500 text-sm leading-relaxed mb-6">
              Revolutionizing laundry care with intelligent, automated drying
              solutions for modern homes.
            </p>
            <div className="flex gap-4">
              <a href="#" className="text-gray-400 hover:text-blue-600 transition-colors">
                <Github size={20} />
              </a>
              <a href="#" className="text-gray-400 hover:text-blue-600 transition-colors">
                <Linkedin size={20} />
              </a>
              <a href="#" className="text-gray-400 hover:text-blue-600 transition-colors">
                <Mail size={20} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-4">Quick Links</h3>
            <ul className="space-y-3">
              {['Home', 'About', 'Features', 'Manuals', 'Login'].map(item => <li key={item}>
                  <button onClick={() => onNavigate(item.toLowerCase())} className="text-gray-500 hover:text-blue-600 text-sm transition-colors">
                    {item}
                  </button>
                </li>)}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-4">Support</h3>
            <ul className="space-y-3">
              {['Contact', 'Privacy Policy', 'Terms of Service'].map(item => <li key={item}>
                  <button onClick={() => onNavigate(item.toLowerCase().split(' ')[0])} className="text-gray-500 hover:text-blue-600 text-sm transition-colors">
                    {item}
                  </button>
                </li>)}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-4">Contact Us</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-3 text-sm text-gray-500">
                <MapPin size={18} className="shrink-0 mt-0.5" />
                <span>
                  Innovation Lab,
                  <br />
                  Tech University
                </span>
              </li>
              <li className="flex items-center gap-3 text-sm text-gray-500">
                <Mail size={18} className="shrink-0" />
                <span>support@smartlaundry.com</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-gray-200 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-gray-400">
            © 2024 Smart Automated Laundry Drying System. All rights reserved.
          </p>
          <p className="text-sm text-gray-400">
            Designed for convenience and efficiency.
          </p>
        </div>
      </div>
    </footer>;
}