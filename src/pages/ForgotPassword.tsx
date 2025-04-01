
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { requestPasswordReset } from "@/lib/auth";
import { useToast } from "@/components/ui/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { InfoIcon } from "lucide-react";

const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const { success, error } = await requestPasswordReset(email);
      
      if (success) {
        setSubmitted(true);
        toast({
          title: "Reset Link Sent",
          description: "If this email exists in our system, you'll receive a password reset link.",
        });
      } else if (error) {
        toast({
          title: "Error",
          description: error,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const isDevelopment = window.location.hostname === 'localhost' || 
                        window.location.hostname.includes('lovableproject.com');

  return (
    <div className="flex items-center justify-center min-h-screen bg-secondary">
      <div className="w-full max-w-md p-4 animate-fade-in">
        <Card className="border-websauce-100 shadow-lg">
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-2xl font-bold">Reset Password</CardTitle>
            <CardDescription>
              {!submitted
                ? "Enter your email to receive a password reset link"
                : "Check your email for a password reset link"}
            </CardDescription>
          </CardHeader>
          
          {isDevelopment && !submitted && (
            <div className="px-6 pb-2">
              <Alert>
                <InfoIcon className="h-4 w-4" />
                <AlertDescription>
                  In development environments, password reset emails might not be delivered. 
                  Check Supabase dashboard for the reset link.
                </AlertDescription>
              </Alert>
            </div>
          )}
          
          {!submitted ? (
            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="your.email@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </CardContent>
              <CardFooter className="flex flex-col space-y-3">
                <Button
                  type="submit"
                  className="w-full bg-websauce-600 hover:bg-websauce-700"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Submitting..." : "Send Reset Link"}
                </Button>
                <Link 
                  to="/login" 
                  className="text-sm text-websauce-600 hover:underline self-center"
                >
                  Back to Login
                </Link>
              </CardFooter>
            </form>
          ) : (
            <CardContent className="space-y-4 text-center">
              <p className="text-sm text-muted-foreground">
                We've sent a password reset link to <strong>{email}</strong>. 
                Please check your inbox and follow the instructions to reset your password.
              </p>
              <p className="text-sm text-muted-foreground">
                If you don't see the email, check your spam folder.
              </p>
              {isDevelopment && (
                <Alert className="mt-4">
                  <InfoIcon className="h-4 w-4" />
                  <AlertDescription>
                    <p>In development environments, password reset emails might not be delivered.</p>
                    <p className="font-medium">Check the Supabase dashboard:</p>
                    <p>Authentication → Users → Find your user → "Send reset password email"</p>
                  </AlertDescription>
                </Alert>
              )}
              <div className="pt-4">
                <Link to="/login">
                  <Button
                    variant="outline"
                    className="w-full"
                  >
                    Back to Login
                  </Button>
                </Link>
              </div>
            </CardContent>
          )}
        </Card>
      </div>
    </div>
  );
};

export default ForgotPassword;
