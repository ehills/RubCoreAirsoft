import { MapPin, Mail, Phone } from "lucide-react";

export default function AboutSection() {
  return (
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
  );
}
