
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { createUser } from "@/lib/auth";
import { UserRole, UserStatus } from "@/types";

const Login: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [adminCreated, setAdminCreated] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || "/";

  // Create standard admin user if it doesn't exist
  useEffect(() => {
    const createAdminUser = async () => {
      try {
        // Check if admin user exists by trying to login
        const adminEmail = "jan@websauce.be";
        const adminPassword = "Websauce123!";
        
        // Create the admin user
        const userData = {
          role: "admin" as UserRole,
          status: "active" as UserStatus,
          start_date: new Date().toISOString(),
          end_date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(), // 1 year from now
        };
        
        const user = await createUser(adminEmail, adminPassword, userData);
        if (user) {
          console.log("Admin user created successfully:", user);
          setAdminCreated(true);
        } else {
          console.log("Admin user already exists or couldn't be created");
        }
      } catch (error) {
        console.error("Error creating admin user:", error);
      }
    };

    if (!adminCreated) {
      createAdminUser();
    }
  }, [adminCreated]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      console.log("Attempting login:", email);
      await login(email, password);
      console.log("Login successful, navigating to:", from);
      navigate(from, { replace: true });
    } catch (err: any) {
      console.error("Login failed:", err);
      setError(err.message || "Login failed. Please check your credentials.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const fillAdminCredentials = () => {
    setEmail("jan@websauce.be");
    setPassword("Websauce123!");
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-secondary">
      <div className="w-full max-w-md p-4 animate-fade-in">
        <Card className="border-websauce-100 shadow-lg">
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-2xl font-bold">
              Welcome to <span className="text-websauce-600">Websauce</span>Community
            </CardTitle>
            <CardDescription>
              Enter your credentials to access your account
            </CardDescription>
          </CardHeader>
          {error && (
            <div className="px-6 pb-2">
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            </div>
          )}
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
                  autoComplete="email"
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  <Link to="/forgot-password" className="text-xs text-websauce-600 hover:underline">
                    Forgot Password?
                  </Link>
                </div>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                />
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-2">
              <Button
                type="submit"
                className="w-full bg-websauce-600 hover:bg-websauce-700"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Logging in..." : "Log in"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={fillAdminCredentials}
                className="w-full"
              >
                Use Admin Credentials
              </Button>
            </CardFooter>
          </form>
        </Card>
        <div className="mt-6 text-center text-sm">
          <p className="text-muted-foreground">
            Admin Login:
          </p>
          <div className="mt-2 text-xs">
            <p><strong>Email:</strong> jan@websauce.be</p>
            <p><strong>Password:</strong> Websauce123!</p>
          </div>
          <p className="mt-2 text-xs text-gray-500">
            Note: For development environments, password reset emails may not be delivered.
            Check Supabase dashboard &gt; Authentication &gt; Users
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
