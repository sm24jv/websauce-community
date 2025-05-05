import React, { useEffect, useState } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { applyActionCode } from 'firebase/auth';
import { auth } from '@/integrations/firebase/firebase'; // Import auth from its source file
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, CheckCircle, Loader2 } from 'lucide-react';

const VerifyEmailPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const oobCode = searchParams.get('oobCode');
    const mode = searchParams.get('mode');

    if (mode !== 'verifyEmail' || !oobCode) {
      setError('Invalid action link. Please request verification again if needed.');
      setLoading(false);
      return;
    }

    const verifyEmail = async () => {
      setLoading(true);
      setError(null);
      setSuccess(false);
      try {
        await applyActionCode(auth, oobCode);
        setSuccess(true);
         // Optional: You could try to sign the user in if you have their context,
         // but typically redirecting to login is standard.
      } catch (err: any) {
        console.error("Email verification failed:", err);
        setError(err.message || 'Failed to verify email. The link may have expired or already been used.');
      } finally {
        setLoading(false);
      }
    };

    verifyEmail();
  }, [searchParams]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 p-4">
      <Card className="w-full max-w-md animate-fade-in border-t-4 border-theme-secondary shadow-xl overflow-hidden rounded-lg">
        <CardHeader className="bg-gray-50 p-6 space-y-2 text-center border-b">
          <CardTitle className="text-2xl font-semibold text-gray-800">Email Verification</CardTitle>
        </CardHeader>
        <CardContent className="p-6 text-center">
          {loading && (
            <div className="flex flex-col items-center space-y-3 text-gray-600">
              <Loader2 className="h-8 w-8 animate-spin" />
              <p>Verifying your email...</p>
            </div>
          )}
          {error && (
            <div className="flex flex-col items-center space-y-3 text-red-600">
               <AlertCircle className="h-8 w-8" />
              <p>{error}</p>
              <Link to="/login">
                <Button variant="outline">Go to Login</Button>
              </Link>
            </div>
          )}
          {success && (
             <div className="flex flex-col items-center space-y-3 text-green-600">
               <CheckCircle className="h-8 w-8" />
              <p>Your email has been successfully verified!</p>
               <Link to="/login">
                <Button>Proceed to Login</Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default VerifyEmailPage; 