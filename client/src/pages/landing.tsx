import { Button } from "@/components/ui/button";
import { MapPin, Mail, Phone, Clock, Users, Target, Calendar } from "lucide-react";

export default function Landing() {
  const handleLogin = () => {
    window.location.href = "/api/login";
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-black text-white shadow-lg sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-tactical-orange flex items-center justify-center">
                <span className="text-black font-bold font-mono text-lg">RC</span>
              </div>
              <div>
                <h1 className="font-bold text-xl">RuB Core Airsoft</h1>
                <p className="text-xs text-gray-300 font-mono">WELLINGTON • NZ</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <Button 
                onClick={handleLogin}
                className="bg-tactical-orange text-black hover:bg-orange-600 font-semibold"
              >
                LOGIN
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="bg-black text-white py-20">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <span className="px-3 py-1 bg-tactical-orange text-black text-sm font-mono font-medium">ESTABLISHED 2019</span>
                <span className="px-3 py-1 border border-gray-600 text-gray-300 text-sm font-mono">WELLINGTON</span>
              </div>
              <h1 className="text-5xl font-bold mb-6 leading-tight">
                Elite Airsoft<br/>
                <span className="tactical-orange">Community</span>
              </h1>
              <p className="text-xl text-gray-300 mb-8 leading-relaxed">
                Join Wellington's premier airsoft club. Experience tactical gameplay, 
                professional training, and camaraderie in New Zealand's most dynamic airsoft community.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  onClick={handleLogin}
                  className="bg-tactical-orange text-black px-8 py-3 font-semibold hover:bg-orange-600"
                >
                  JOIN THE SQUAD
                </Button>
                <Button 
                  variant="outline"
                  className="border-white text-white px-8 py-3 font-semibold hover:bg-white hover:text-black"
                  onClick={() => document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' })}
                >
                  LEARN MORE
                </Button>
              </div>
            </div>
            <div className="relative">
              <img 
                src="https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=600" 
                alt="Airsoft team in tactical gear" 
                className="rounded-lg shadow-2xl w-full h-auto object-cover"
              />
              <div className="absolute -bottom-6 -right-6 bg-tactical-orange text-black p-4 font-mono font-bold">
                <div className="text-2xl">50+</div>
                <div className="text-sm">ACTIVE MEMBERS</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-20 bg-white" id="about">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-12">
            <div className="md:col-span-2">
              <h2 className="text-4xl font-bold text-black mb-8">About RuB Core</h2>
              <div className="space-y-6 text-gray-700 text-lg leading-relaxed">
                <p>
                  Founded in 2019, RuB Core Airsoft has established itself as Wellington's premier airsoft community. 
                  We combine tactical simulation with cutting-edge equipment to deliver an unparalleled combat sports experience.
                </p>
                <p>
                  Our club operates across multiple venues throughout the Wellington region, offering diverse 
                  terrain challenges from urban CQB facilities to expansive outdoor fields. Whether you're 
                  a seasoned operator or new to the sport, our community welcomes all skill levels.
                </p>
                <p>
                  Safety, sportsmanship, and tactical excellence drive everything we do. Join us for weekly 
                  training sessions, competitive tournaments, and unforgettable field operations.
                </p>
              </div>
              
              <div className="grid grid-cols-2 gap-6 mt-10">
                <div className="text-center">
                  <div className="text-3xl font-bold tactical-orange mb-2">50+</div>
                  <div className="text-gray-600 font-medium">Active Members</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold tactical-orange mb-2">25+</div>
                  <div className="text-gray-600 font-medium">Events Per Year</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold tactical-orange mb-2">5</div>
                  <div className="text-gray-600 font-medium">Partner Venues</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold tactical-orange mb-2">4</div>
                  <div className="text-gray-600 font-medium">Years Strong</div>
                </div>
              </div>
            </div>
            
            <div className="space-y-6">
              <div className="bg-black text-white p-6">
                <h3 className="font-bold text-xl mb-4 font-mono">CONTACT INFO</h3>
                <div className="space-y-3 text-gray-300">
                  <div className="flex items-center space-x-3">
                    <MapPin className="w-5 h-5 tactical-orange" />
                    <span>Wellington, New Zealand</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Mail className="w-5 h-5 tactical-orange" />
                    <span>info@rubcore.nz</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Phone className="w-5 h-5 tactical-orange" />
                    <span>+64 4 XXX XXXX</span>
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-100 p-6">
                <h3 className="font-bold text-xl mb-4">Training Schedule</h3>
                <div className="space-y-2 text-gray-700">
                  <div className="flex justify-between">
                    <span className="font-medium">Saturdays</span>
                    <span className="font-mono">1400-1800</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Sundays</span>
                    <span className="font-mono">1000-1600</span>
                  </div>
                  <div className="text-sm text-gray-600 mt-3">
                    * Weather dependent. Check events for updates.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
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
                <li><button onClick={handleLogin} className="hover:text-tactical-orange transition-colors">Join Club</button></li>
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
    </div>
  );
}
