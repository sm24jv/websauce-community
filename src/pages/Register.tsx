import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSettings } from "@/contexts/SettingsContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Loader2, CheckCircle2 } from "lucide-react";
import { createUser } from "@/lib/auth"; // Using the updated createUser from auth.ts
import { UserRole, UserStatus } from "@/types";

const RegisterPage: React.FC = () => {
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showVerificationMessage, setShowVerificationMessage] = useState(false);
  const navigate = useNavigate();
  const { settings, loadingSettings } = useSettings();

  // Determine logo URL - Update the fallback URL
  const logoUrl = settings?.logo_url || "https://websauce.be/wp-content/uploads/2018/02/smallLogoWebsauce_hori-1.jpg"; // Fallback
  const platformName = settings?.platform_name || "Websauce Community"; // Fallback for alt text

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("De wachtwoorden komen niet overeen.");
      return;
    }

    if (password.length < 6) {
        setError("Wachtwoord moet minimaal 6 tekens lang zijn.");
        return;
    }

    setIsSubmitting(true);

    try {
      // Define default user data for registration
      // TODO: Adjust these defaults or get them from a form/admin setting
      const now = new Date();
      const endDate = new Date(now);
      endDate.setDate(endDate.getDate() + 30); // Default 30-day access

      const userData = {
        firstName,
        lastName,
        role: "user" as UserRole, // Default role
        status: "active" as UserStatus, // Default status
        start_date: now.toISOString(),
        end_date: endDate.toISOString(),
      };

      console.log("Attempting to create user:", email, userData);
      const response = await createUser(email, password, userData);

      if (response.error) {
        setError(response.error);
      } else if (response.user) {
        console.log("User created successfully:", response.user);
        setShowVerificationMessage(true);
      } else {
        // This case should ideally not be reached if createUser always returns an error or a user.
        setError("Registratie mislukt. Probeer het opnieuw.");
      }
    } catch (err: any) {
      // This catch block is for unexpected errors not handled by createUser's return type.
      console.error("Registration failed (unexpected exception in handleSubmit):", err);
      setError(err.message || "Een onverwachte fout is opgetreden tijdens de registratie.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 p-4">
      <Card className="w-full max-w-md animate-fade-in border-t-4 border-theme-secondary shadow-xl overflow-hidden rounded-lg">
        <CardHeader className="bg-gray-50 p-6 space-y-2 text-center border-b">
           <Link to="/">
            {/* Conditionally render logo or placeholder */}
            {!loadingSettings && logoUrl ? (
              <img
                src={logoUrl}
                alt={`${platformName} Logo`}
                className="h-12 mx-auto mb-4"
              />
            ) : (
              <div className="h-12 w-32 mx-auto mb-4 bg-gray-200 animate-pulse rounded"></div> // Placeholder for logo
            )}
          </Link>
          <CardTitle className="text-2xl font-semibold text-gray-800">Account aanmaken</CardTitle>
          {!showVerificationMessage && (
            <CardDescription className="text-gray-500">
              Word lid van de Websauce Community
            </CardDescription>
          )}
        </CardHeader>

        {error && !showVerificationMessage && (
          <div className="p-4">
            <Alert variant="destructive" className="bg-red-50 border-red-200 text-red-800">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          </div>
        )}

        {showVerificationMessage ? (
          <CardContent className="p-6 text-center space-y-4">
            <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto" />
            <h2 className="text-xl font-semibold text-gray-800">Registratie succesvol!</h2>
            <p className="text-gray-600">
              Er is een e-mail met een verificatielink naar <strong className="text-gray-700">{email}</strong> verzonden.
              Controleer uw inbox en spamfolder om uw account te activeren.
            </p>
            <Button asChild className="w-full bg-[#3B82F6] text-white hover:bg-gray-100 hover:text-gray-900 hover:border hover:border-gray-300 transition duration-150 ease-in-out">
                <Link to="/login">Naar Inloggen</Link>
            </Button>
          </CardContent>
        ) : (
          <form onSubmit={handleSubmit}>
            <CardContent className="p-6 space-y-5">
              <div className="space-y-2">
                <Label htmlFor="firstName" className="text-sm font-medium text-gray-700">Voornaam</Label>
                <Input
                  id="firstName"
                  type="text"
                  placeholder="Jan"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                  autoComplete="given-name"
                  className="transition duration-150 ease-in-out focus:ring-websauce-500 focus:border-websauce-500"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName" className="text-sm font-medium text-gray-700">Achternaam</Label>
                <Input
                  id="lastName"
                  type="text"
                  placeholder="Peeters"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                  autoComplete="family-name"
                  className="transition duration-150 ease-in-out focus:ring-websauce-500 focus:border-websauce-500"
                />
              </div>
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
                <Label htmlFor="password" className="text-sm font-medium text-gray-700">Wachtwoord</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="•••••••• (min. 6 tekens)"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="new-password"
                  className="transition duration-150 ease-in-out focus:ring-websauce-500 focus:border-websauce-500"
                />
              </div>
               <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700">Bevestig wachtwoord</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  autoComplete="new-password"
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
                    Account aanmaken...
                  </>
                ) : (
                  "Registreren"
                )}
              </Button>
               <p className="text-center text-sm text-gray-600">
                Heb je al een account?{" "}
                <Link to="/login" className="font-medium text-websauce-600 hover:underline transition duration-150 ease-in-out">
                  Inloggen
                </Link>
              </p>
            </CardFooter>
          </form>
        )}
      </Card>
    </div>
  );
};

export default RegisterPage; 