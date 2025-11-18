import React from 'react';
import { Heart, Mail, Phone, MapPin } from 'lucide-react';
import { Link } from '../utils/Link';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center mb-4">
              <Heart className="h-8 w-8 text-purple-400" />
              <span className="ml-2 text-xl font-semibold">OvaCare</span>
            </div>
            <p className="text-gray-300 mb-4">
              Empowering women through PCOS detection, personalized diet plans, and health tracking.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-gray-300 hover:text-white transition-colors">Home</Link>
              </li>
              <li>
                <a href="https://my.clevelandclinic.org/health/diseases/8316-polycystic-ovary-syndrome-pcos" target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-white transition-colors">About PCOS</a>
              </li>
              <li>
                <Link to="/detection" className="text-gray-300 hover:text-white transition-colors">PCOS Detection</Link>
              </li>
              <li>
                <Link to="/diet-plans" className="text-gray-300 hover:text-white transition-colors">Diet Plans</Link>
              </li>
              <li>
                <Link to="/tracker" className="text-gray-300 hover:text-white transition-colors">Period Tracker</Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Contact Us</h3>
            <ul className="space-y-2">
              <li className="flex items-center">
                <Mail className="h-5 w-5 mr-2 text-purple-400" />
                <a href="mailto:ovacare@gmail.com" className="text-gray-300 hover:text-white transition-colors">
                  ovacare@gmail.com
                </a>
              </li>
              <li className="flex items-center">
                <Phone className="h-5 w-5 mr-2 text-purple-400" />
                <a href="tel:+919999988888" className="text-gray-300 hover:text-white transition-colors">
                  +91 9999988888
                </a>
              </li>
              <li className="flex items-start">
                <MapPin className="h-5 w-5 mr-2 mt-1 text-purple-400" />
                <span className="text-gray-300">
                  BMSIT, Bengaluru,<br />
                  Karnataka - 560064
                </span>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-12 pt-8 border-t border-gray-800">
          <p className="text-center text-gray-400">
            &copy; {new Date().getFullYear()} OvaCare. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;