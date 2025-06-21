import { Button } from "@/components/ui/button";

export default function HeroSection() {
  return (
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
                className="bg-tactical-orange text-black px-8 py-3 font-semibold hover:bg-orange-600"
                onClick={() => document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' })}
              >
                EXPLORE CLUB
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
  );
}
