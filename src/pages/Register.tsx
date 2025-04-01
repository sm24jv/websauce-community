import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Loader2 } from "lucide-react";
import { createUser } from "@/lib/auth"; // Using the updated createUser from auth.ts
import { UserRole, UserStatus } from "@/types";
import { useToast } from "@/components/ui/use-toast";

const RegisterPage: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (password.length < 6) {
        setError("Password must be at least 6 characters long.");
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
        role: "user" as UserRole, // Default role
        status: "active" as UserStatus, // Default status
        start_date: now.toISOString(),
        end_date: endDate.toISOString(),
      };

      console.log("Attempting to create user:", email, userData);
      const newUser = await createUser(email, password, userData);

      if (newUser) {
        console.log("User created successfully:", newUser);
        toast({
          title: "Registration Successful",
          description: "Your account has been created. Please log in.",
        });
        navigate("/login"); // Redirect to login page after successful registration
      } else {
        // This case might not be reached if createUser throws on error
        setError("Registration failed. Please try again.");
      }
    } catch (err: any) {
      console.error("Registration failed:", err);
      // Use the error message thrown by the createUser function (which includes Firebase error handling)
      setError(err.message || "An unexpected error occurred during registration.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 p-4">
      <Card className="w-full max-w-md animate-fade-in border-t-4 border-websauce-600 shadow-xl overflow-hidden rounded-lg">
        <CardHeader className="bg-gray-50 p-6 space-y-2 text-center border-b">
           <Link to="/">
            <img
              src="https://websauce.be/wp-content/themes/websauce/dist/images/logo.svg"
              alt="Websauce Logo"
              className="h-12 mx-auto mb-4"
            />
          </Link>
          <CardTitle className="text-2xl font-semibold text-gray-800">Create Account</CardTitle>
          <CardDescription className="text-gray-500">
            Join the Websauce Community
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
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium text-gray-700">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="•••••••• (min. 6 characters)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="new-password"
                className="transition duration-150 ease-in-out focus:ring-websauce-500 focus:border-websauce-500"
              />
            </div>
             <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700">Confirm Password</Label>
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
              className="w-full bg-websauce-600 hover:bg-websauce-700 text-white transition duration-150 ease-in-out disabled:opacity-75"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating Account...
                </>
              ) : (
                "Sign Up"
              )}
            </Button>
             <p className="text-center text-sm text-gray-600">
              Already have an account?{" "}
              <Link to="/login" className="font-medium text-websauce-600 hover:underline transition duration-150 ease-in-out">
                Log in
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default RegisterPage; 