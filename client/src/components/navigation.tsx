import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Menu, X, User } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

export default function Navigation() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [location] = useLocation();
  const { user } = useAuth();

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
      window.location.href = "/";
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const navItems = [
    { href: "/", label: "About", isActive: location === "/" },
    { href: "/events", label: "Events", isActive: location === "/events" },
    { href: "/gallery", label: "Gallery", isActive: location === "/gallery" },
  ];

  return (
    <nav className="bg-black text-white shadow-lg sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-tactical-orange flex items-center justify-center">
              <span className="text-black font-bold font-mono text-lg">RC</span>
            </div>
            <div>
              <h1 className="font-bold text-xl">RuB Core Airsoft</h1>
              <p className="text-xs text-gray-300 font-mono">WELLINGTON • NZ</p>
            </div>
          </Link>
          
          <div className="hidden md:flex items-center space-x-6">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`hover:text-tactical-orange transition-colors ${
                  item.isActive ? "border-b-2 border-tactical-orange" : ""
                }`}
              >
                {item.label}
              </Link>
            ))}
            
            {user && (
              <div className="flex items-center space-x-3 text-sm">
                <div className="flex items-center space-x-2 bg-gray-800 px-3 py-1 rounded">
                  <User className="w-4 h-4 text-tactical-orange" />
                  <span className="text-white">{user.email}</span>
                </div>
                <Button
                  onClick={handleLogout}
                  variant="ghost"
                  className="hover:text-tactical-orange transition-colors"
                >
                  Logout
                </Button>
              </div>
            )}
          </div>

          <div className="md:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-white hover:text-tactical-orange"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </Button>
          </div>
        </div>

        {/* Mobile menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-800">
            <div className="space-y-2">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`block py-2 px-4 hover:text-tactical-orange transition-colors ${
                    item.isActive ? "text-tactical-orange" : ""
                  }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
              <button
                onClick={handleLogout}
                className="block w-full text-left py-2 px-4 hover:text-tactical-orange transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
