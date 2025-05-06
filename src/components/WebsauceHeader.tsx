import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useSettings } from "@/contexts/SettingsContext";
import { Button } from "@/components/ui/button";

const WebsauceHeader: React.FC = () => {
  const { user, logout } = useAuth();
  const { settings } = useSettings();

  const logoUrl = settings?.logo_url || "https://websauce.be/wp-content/uploads/2018/02/smallLogoWebsauce_hori-1.jpg";
  const platformName = settings?.platform_name || "Websauce Community";

  return (
    <header className="bg-white shadow-sm">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link to="/" className="flex items-center">
          <img 
            src={logoUrl} 
            alt={`${platformName} Logo`} 
            className="h-10 max-h-10 object-contain"
          />
        </Link>
        
        <div className="flex items-center space-x-6">
          {user ? (
            <>
              <nav className="hidden md:flex items-center space-x-6">
                <Link to="/dashboard" className="text-gray-700 hover:text-websauce-600 transition-colors">
                  Dashboard
                </Link>
                <Link to="/events" className="text-gray-700 hover:text-websauce-600 transition-colors">
                  Events
                </Link>
                <Link to="/message-board" className="text-gray-700 hover:text-websauce-600 transition-colors">
                  Message Board
                </Link>
                {user.role === 'admin' && (
                  <Link to="/admin" className="text-gray-700 hover:text-websauce-600 transition-colors">
                    Admin
                  </Link>
                )}
              </nav>
              <Button 
                variant="outline" 
                className="text-gray-700 border-gray-300 hover:bg-gray-100 hover:text-gray-900"
                onClick={() => logout()}
              >
                Sign Out
              </Button>
            </>
          ) : (
            <div className="flex items-center space-x-4">
              <Link to="/login">
                <Button variant="outline" className="text-gray-700 border-gray-300 hover:bg-gray-100 hover:text-gray-900">
                  Login
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default WebsauceHeader;
