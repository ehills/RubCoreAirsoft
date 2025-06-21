import { MapPin, Mail, Phone } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-black text-white py-12">
      <div className="max-w-6xl mx-auto px-4">
        <div className="grid md:grid-cols-4 gap-8">
          <div className="md:col-span-2">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 bg-tactical-orange flex items-center justify-center">
                <span className="text-black font-bold font-mono text-lg">RC</span>
              </div>
              <div>
                <h1 className="font-bold text-xl">RuB Core Airsoft</h1>
                <p className="text-xs text-gray-300 font-mono">WELLINGTON • NEW ZEALAND</p>
              </div>
            </div>
            <p className="text-gray-300 mb-6 leading-relaxed">
              Wellington's premier airsoft community, delivering tactical excellence and 
              unforgettable combat sports experiences since 2019.
            </p>
          </div>
          
          <div>
            <h3 className="font-bold text-lg mb-4 font-mono">QUICK LINKS</h3>
            <ul className="space-y-2 text-gray-300">
              <li><a href="#about" className="hover:text-tactical-orange transition-colors">About Us</a></li>
              <li><a href="/events" className="hover:text-tactical-orange transition-colors">Events</a></li>
              <li><a href="/gallery" className="hover:text-tactical-orange transition-colors">Gallery</a></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-bold text-lg mb-4 font-mono">CONTACT</h3>
            <ul className="space-y-2 text-gray-300">
              <li className="flex items-center space-x-2">
                <MapPin className="w-4 h-4 tactical-orange" />
                <span>Wellington, NZ</span>
              </li>
              <li className="flex items-center space-x-2">
                <Mail className="w-4 h-4 tactical-orange" />
                <span>info@rubcore.nz</span>
              </li>
              <li className="flex items-center space-x-2">
                <Phone className="w-4 h-4 tactical-orange" />
                <span>+64 4 XXX XXXX</span>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
          <p>&copy; 2024 RuB Core Airsoft. All rights reserved. | <span className="font-mono">TACTICAL • PROFESSIONAL • ELITE</span></p>
        </div>
      </div>
    </footer>
  );
}
