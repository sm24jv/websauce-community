
import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";

const WebsauceHeader: React.FC = () => {
  const { user, logout } = useAuth();

  return (
    <header className="bg-white shadow-sm">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link to="/" className="flex items-center">
          <img 
            src="https://websauce.be/wp-content/themes/websauce/dist/images/logo.svg" 
            alt="Websauce Logo" 
            className="h-10" 
          />
        </Link>
        
        <div className="flex items-center space-x-6">
          {user ? (
            <>
              <nav className="hidden md:flex items-center space-x-6">
                <Link to="/dashboard" className="text-gray-700 hover:text-websauce-600 transition-colors">
                  Dashboard
                </Link>
                {user.role === 'admin' && (
                  <Link to="/admin/courses" className="text-gray-700 hover:text-websauce-600 transition-colors">
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
