import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useSettings } from "@/contexts/SettingsContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { requestPasswordReset } from "@/lib/auth";
import { useToast } from "@/components/ui/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { InfoIcon, Loader2, MailCheck } from "lucide-react";

const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const { settings, loadingSettings } = useSettings();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const { success, error: resetError } = await requestPasswordReset(email);

      if (success) {
        setSubmitted(true);
        toast({
          title: "Herstellink verzonden",
          description: "Als er een account bestaat voor dit e-mailadres, is er een link voor het opnieuw instellen van het wachtwoord verzonden.",
        });
      } else if (resetError) {
        setError(resetError);
      }
    } catch (err: any) {
      setError(err.message || "Er is een onverwachte fout opgetreden.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const isDevelopment = import.meta.env.DEV;

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 p-4">
      <Card className="w-full max-w-md animate-fade-in border-t-4 border-theme-secondary shadow-xl overflow-hidden rounded-lg">
        <CardHeader className="bg-gray-50 p-6 space-y-2 text-center border-b">
          <Link to="/">
            <img
              src={settings?.logo_url || "https://websauce.be/wp-content/uploads/2018/02/smallLogoWebsauce_hori-1.jpg"}
              alt={`${settings?.platform_name || "Websauce Community"} Logo`}
              className={`h-12 mx-auto mb-4 ${!(settings?.logo_url) ? 'bg-gray-200 animate-pulse rounded' : ''}`}
              onError={(e) => {
                console.error("Logo image failed to load:", e.currentTarget.src);
                e.currentTarget.src = "https://websauce.be/wp-content/uploads/2018/02/smallLogoWebsauce_hori-1.jpg";
                e.currentTarget.classList.add('bg-gray-200');
              }}
            />
          </Link>
          <CardTitle className="text-2xl font-semibold text-gray-800">
            {submitted ? "Controleer je e-mail" : "Wachtwoord opnieuw instellen"}
          </CardTitle>
          <CardDescription className="text-gray-500">
            {submitted
              ? "Volg de link die naar je inbox is verzonden om je wachtwoord opnieuw in te stellen."
              : "Voer je e-mailadres in om een link voor het opnieuw instellen van je wachtwoord te ontvangen."}
          </CardDescription>
        </CardHeader>

        {error && (
          <div className="p-4">
            <Alert variant="destructive" className="bg-red-50 border-red-200 text-red-800">
              <InfoIcon className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          </div>
        )}

        {submitted ? (
          <CardContent className="p-6 space-y-4 text-center">
            <MailCheck className="mx-auto h-16 w-16 text-green-500" />
            <p className="text-sm text-gray-600">
              Als er een account bestaat voor <strong>{email}</strong>, hebben we een link voor het opnieuw instellen van het wachtwoord verzonden.
              Controleer je inbox (en spammap) en volg de instructies.
            </p>
            {isDevelopment && (
              <Alert className="mt-4 text-left bg-blue-50 border-blue-200 text-blue-800">
                <InfoIcon className="h-4 w-4" />
                <AlertDescription>
                  <p className="font-semibold">Ontwikkelingsnotitie:</p>
                  <p>In een ontwikkelomgeving worden e-mails voor wachtwoordherstel mogelijk niet bezorgd. Controleer de instellingen van je e-mailprovider of gebruik indien nodig ontwikkeltools.</p>
                </AlertDescription>
              </Alert>
            )}
             <div className="pt-4">
                <Link to="/login">
                  <Button
                    className="w-full bg-[#3B82F6] text-white hover:bg-gray-100 hover:text-gray-900 hover:border hover:border-gray-300 transition duration-150 ease-in-out"
                  >
                    Terug naar Inloggen
                  </Button>
                </Link>
              </div>
          </CardContent>
        ) : (
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
                    Link verzenden...
                  </>
                ) : (
                  "Herstellink verzenden"
                )}
              </Button>
              <p className="text-center text-sm text-gray-600">
                Wachtwoord onthouden?{" "}
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

export default ForgotPasswordPage; 