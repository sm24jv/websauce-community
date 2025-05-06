import React, { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useSettings } from "@/contexts/SettingsContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Loader2 } from "lucide-react";

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { login } = useAuth();
  const { settings, loadingSettings } = useSettings();
  const navigate = useNavigate();
  const location = useLocation();

  // Determine redirect path after login
  const from = location.state?.from?.pathname || "/";

  // Determine logo URL - Update the fallback URL
  const logoUrl = settings?.logo_url || "https://websauce.be/wp-content/uploads/2018/02/smallLogoWebsauce_hori-1.jpg"; // Fallback
  const platformName = settings?.platform_name || "Websauce Community"; // Fallback for alt text

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      console.log("Attempting login via context:", email);
      // Call the context login function which handles Firebase auth and profile fetching
      await login(email, password);
      // The AuthContext listener will handle the user state update
      // If login is successful (no error thrown by context login), navigate
      console.log("Login call successful via context, navigating to:", from);
      navigate(from, { replace: true });
    } catch (err: any) {
      // The login function in context now catches errors and toasts them.
      // We set local error state here primarily to display it in the form UI.
      console.error("Login failed via context:", err);
      // Use the error message potentially passed up, or a default
      setError(err.message || "Inloggen mislukt. Controleer je gegevens.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Helper function to fill admin credentials for testing
  const fillAdminCredentials = () => {
    setEmail("jan@websauce.be");
    setPassword("Websauce123!");
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 p-4">
      <Card className="w-full max-w-md animate-fade-in border-t-4 border-theme-secondary shadow-xl overflow-hidden rounded-lg">
        <CardHeader className="bg-gray-50 p-6 space-y-2 text-center border-b">
          <Link to="/">
            {!loadingSettings && logoUrl ? (
              <img
                src={logoUrl}
                alt={`${platformName} Logo`}
                className="h-12 mx-auto mb-4"
              />
            ) : (
              <div className="h-12 w-32 mx-auto mb-4 bg-gray-200 animate-pulse rounded"></div>
            )}
          </Link>
          <CardTitle className="text-2xl font-semibold text-gray-800">Inloggen</CardTitle>
          <CardDescription className="text-gray-500">
            Krijg toegang tot je Websauce Community-account
          </CardDescription>
        </CardHeader>

        {error && (
          <div className="p-4">
            <Alert variant="destructive" className="bg-red-50 border-red-200 text-red-800">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <CardContent className="p-6 space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-gray-700">E-mailadres</Label>
              <Input
                id="email"
                type="email"
                placeholder="jouw.email@voorbeeld.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                className="transition duration-150 ease-in-out focus:ring-websauce-500 focus:border-websauce-500"
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-sm font-medium text-gray-700">Wachtwoord</Label>
                <Link to="/forgot-password" className="text-xs text-websauce-600 hover:underline transition duration-150 ease-in-out">
                  Wachtwoord vergeten?
                </Link>
              </div>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                className="transition duration-150 ease-in-out focus:ring-websauce-500 focus:border-websauce-500"
              />
            </div>
          </CardContent>
          <CardFooter className="bg-gray-50 p-6 flex flex-col gap-4 border-t">
            <Button
              type="submit"
              className="w-full bg-[#3B82F6] text-white hover:bg-gray-100 hover:text-gray-900 hover:border hover:border-gray-300 transition duration-150 ease-in-out disabled:opacity-75"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Bezig met inloggen...
                </>
              ) : (
                "Inloggen"
              )}
            </Button>
            {/* Link to Register Page - Assuming one will be created */}
            <p className="text-center text-sm text-gray-600">
              Heb je nog geen account?{" "}
              <Link to="/register" className="font-medium text-websauce-600 hover:underline transition duration-150 ease-in-out">
                Registreer
              </Link>
            </p>
            {/* Button for testing admin credentials */}
            {import.meta.env.DEV && (
              <Button
                type="button"
                variant="outline"
                onClick={fillAdminCredentials}
                className="w-full text-xs text-gray-600 border-gray-300 hover:bg-gray-100 transition duration-150 ease-in-out"
              >
                Gebruik admin-gegevens (Alleen voor ontwikkeling)
              </Button>
            )}
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default LoginPage;
