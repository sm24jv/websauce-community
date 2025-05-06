import React, { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react'; // Assuming you use lucide-react for icons

const AuthActionHandlerPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const mode = searchParams.get('mode');
    const oobCode = searchParams.get('oobCode');

    // It's crucial that oobCode is present, otherwise the action cannot be completed.
    if (!oobCode) {
      console.error("Auth Action Handler: oobCode is missing from URL parameters.");
      // Navigate to login with an error or to a generic error page
      navigate('/login?error=invalid_link', { replace: true });
      return;
    }

    let targetPath: string;

    switch (mode) {
      case 'verifyEmail':
        targetPath = '/verify-email';
        break;
      case 'resetPassword':
        targetPath = '/reset-password';
        break;
      // You can add more cases here if you use other Firebase email actions like 'recoverEmail'
      // case 'recoverEmail':
      //   targetPath = '/recover-email'; // Example
      //   break;
      default:
        console.warn(`Auth Action Handler: Unknown or unhandled mode '${mode}'. Redirecting to login.`);
        targetPath = '/login'; // Fallback to login page
        // Optionally, you might want to pass an error indicating an invalid action mode
        // navigate('/login?error=invalid_action_mode', { replace: true });
        // return;
        break;
    }

    // Reconstruct the full query string to pass all original parameters
    const queryString = searchParams.toString();
    
    // Navigate to the target path with all original query parameters
    navigate(`${targetPath}?${queryString}`, { replace: true });

  }, [searchParams, navigate]);

  // Display a loading/redirecting message to the user
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <Loader2 className="h-12 w-12 animate-spin text-websauce-600 mb-4" />
      <p className="text-gray-700 text-lg">Even geduld, we verwerken uw verzoek...</p>
      {/* Dutch: "Please wait, we are processing your request..." */}
    </div>
  );
};

export default AuthActionHandlerPage; 