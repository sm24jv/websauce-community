import React, { useEffect, useState } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { verifyPasswordResetCode, confirmPasswordReset } from 'firebase/auth';
import { auth } from '@/integrations/firebase/firebase'; // Import auth from its source
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

const ResetPasswordPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [email, setEmail] = useState<string | null>(null); // Store email after code verification
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");

  const oobCode = searchParams.get('oobCode');
  const mode = searchParams.get('mode');

  useEffect(() => {
    if (mode !== 'resetPassword' || !oobCode) {
      setError('Ongeldige actielink. Vraag opnieuw een wachtwoordherstel aan.');
      setLoading(false);
      setVerifying(false);
      return;
    }

    const verifyCode = async () => {
      setLoading(true);
      setVerifying(true);
      setError(null);
      try {
        const userEmail = await verifyPasswordResetCode(auth, oobCode);
        setEmail(userEmail); // Code is valid, store email
        setVerifying(false); // Show password form
      } catch (err: any) {
        console.error("Password reset code verification failed:", err);
        setError(err.message || 'Ongeldige of verlopen wachtwoordherstellink.');
        setVerifying(false);
      } finally {
        setLoading(false);
      }
    };

    verifyCode();
  }, [oobCode, mode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (newPassword !== confirmNewPassword) {
      setError("De nieuwe wachtwoorden komen niet overeen.");
      return;
    }
    if (newPassword.length < 6) {
        setError("Wachtwoord moet minimaal 6 tekens lang zijn.");
        return;
    }
    if (!oobCode) { // Should not happen if form is displayed, but good check
        setError("Actiecode ontbreekt. Probeer het opnieuw.");
        return;
    }

    setIsSubmitting(true);
    try {
      await confirmPasswordReset(auth, oobCode, newPassword);
      setSuccess(true);
      toast({ title: "Succes", description: "Je wachtwoord is succesvol opnieuw ingesteld." });
      // Delay navigation slightly to allow user to see success message
      setTimeout(() => navigate('/login'), 2000); 
    } catch (err: any) {
      console.error("Password reset confirmation failed:", err);
      setError(err.message || 'Kon wachtwoord niet opnieuw instellen. Probeer het opnieuw.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex flex-col items-center space-y-3 text-gray-600">
          <Loader2 className="h-8 w-8 animate-spin" />
          <p>Laden...</p>
        </div>
      );
    }
    if (error && verifying) { // Error during initial verification
       return (
        <div className="flex flex-col items-center space-y-3 text-red-600">
          <AlertCircle className="h-8 w-8" />
          <p>{error}</p>
          <Link to="/forgot-password">
            <Button variant="outline">Vraag opnieuw herstel aan</Button>
          </Link>
        </div>
      );
    }
     if (success) {
      return (
        <div className="flex flex-col items-center space-y-3 text-green-600">
          <CheckCircle className="h-8 w-8" />
          <p>Wachtwoord succesvol opnieuw ingesteld! Wordt doorgestuurd naar inloggen...</p>
        </div>
      );
    }
    if (email && !verifying) { // Code verified, show password form
      return (
        <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="text-red-600 text-sm text-center">{error}</div>
            )}
           <p className="text-sm text-gray-600 text-center">Voer een nieuw wachtwoord in voor {email}.</p>
           <div className="space-y-2">
              <Label htmlFor="newPassword">Nieuw wachtwoord</Label>
              <Input
                id="newPassword"
                type="password"
                placeholder="•••••••• (min. 6 tekens)"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                className="transition duration-150 ease-in-out focus:ring-websauce-500 focus:border-websauce-500"
              />
            </div>
             <div className="space-y-2">
              <Label htmlFor="confirmNewPassword">Bevestig nieuw wachtwoord</Label>
              <Input
                id="confirmNewPassword"
                type="password"
                placeholder="••••••••"
                value={confirmNewPassword}
                onChange={(e) => setConfirmNewPassword(e.target.value)}
                required
                className="transition duration-150 ease-in-out focus:ring-websauce-500 focus:border-websauce-500"
              />
            </div>
            <Button
              type="submit"
              className="w-full bg-[#3B82F6] text-white hover:bg-gray-100 hover:text-gray-900 hover:border hover:border-gray-300 transition duration-150 ease-in-out disabled:opacity-75"
              disabled={isSubmitting}
            >
              {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Wachtwoord opnieuw instellen'}
            </Button>
        </form>
      );
    }
     // Fallback for unexpected states
     return <p className="text-center text-gray-600">Er is iets misgegaan.</p>;
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 p-4">
      <Card className="w-full max-w-md animate-fade-in border-t-4 border-theme-secondary shadow-xl overflow-hidden rounded-lg">
        <CardHeader className="bg-gray-50 p-6 space-y-2 text-center border-b">
          <CardTitle className="text-2xl font-semibold text-gray-800">Wachtwoord opnieuw instellen</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          {renderContent()}
        </CardContent>
      </Card>
    </div>
  );
};

export default ResetPasswordPage;
