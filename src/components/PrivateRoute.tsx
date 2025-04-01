
import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { UserRole } from "@/types";
import { Skeleton } from "@/components/ui/skeleton";

interface PrivateRouteProps {
  children: React.ReactNode;
  requiredRole?: UserRole;
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ 
  children, 
  requiredRole 
}) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  // Show a loading indicator while checking authentication
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
        <div className="w-full max-w-md space-y-4">
          <Skeleton className="h-8 w-3/4 mx-auto" />
          <Skeleton className="h-64 w-full" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-4/6" />
          </div>
          <div className="flex justify-center">
            <div className="animate-pulse text-websauce-500 font-medium">Loading...</div>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    // Redirect to login if not authenticated
    console.log("User not authenticated, redirecting to login");
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requiredRole && user.role !== requiredRole) {
    // Redirect to dashboard if role doesn't match
    console.log(`Required role ${requiredRole} not matched with user role ${user.role}, redirecting to dashboard`);
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default PrivateRoute;
