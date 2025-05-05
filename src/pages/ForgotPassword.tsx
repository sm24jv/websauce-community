import React, { useState } from "react";
import { Link } from "react-router-dom";
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const { success, error: resetError } = await requestPasswordReset(email);

      if (success) {
        setSubmitted(true);
        toast({
          title: "Reset Link Sent",
          description: "If an account exists for this email, a password reset link has been sent.",
        });
      } else if (resetError) {
        setError(resetError);
      }
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
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
              src="https://websauce.be/wp-content/themes/websauce/dist/images/logo.svg"
              alt="Websauce Logo"
              className="h-12 mx-auto mb-4"
            />
          </Link>
          <CardTitle className="text-2xl font-semibold text-gray-800">
            {submitted ? "Check Your Email" : "Reset Password"}
          </CardTitle>
          <CardDescription className="text-gray-500">
            {submitted
              ? "Follow the link sent to your inbox to reset your password."
              : "Enter your email to receive a password reset link."}
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
              If an account exists for <strong>{email}</strong>, we've sent a password reset link.
              Please check your inbox (and spam folder) and follow the instructions.
            </p>
            {isDevelopment && (
              <Alert className="mt-4 text-left bg-blue-50 border-blue-200 text-blue-800">
                <InfoIcon className="h-4 w-4" />
                <AlertDescription>
                  <p className="font-semibold">Development Note:</p>
                  <p>In development, password reset emails might not be delivered. Check your email provider settings or use development tools if needed.</p>
                </AlertDescription>
              </Alert>
            )}
             <div className="pt-4">
                <Link to="/login">
                  <Button
                    className="w-full bg-[#3B82F6] text-white hover:bg-gray-100 hover:text-gray-900 hover:border hover:border-gray-300 transition duration-150 ease-in-out"
                  >
                    Back to Login
                  </Button>
                </Link>
              </div>
          </CardContent>
        ) : (
          <form onSubmit={handleSubmit}>
            <CardContent className="p-6 space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-gray-700">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your.email@example.com"
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
                    Sending Link...
                  </>
                ) : (
                  "Send Reset Link"
                )}
              </Button>
              <p className="text-center text-sm text-gray-600">
                Remembered your password?{" "}
                <Link to="/login" className="font-medium text-websauce-600 hover:underline transition duration-150 ease-in-out">
                  Log in
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
