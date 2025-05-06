import { useEffect } from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import PrivateRoute from "@/components/PrivateRoute";
import { createUser } from '@/lib/auth';
import { UserRole, UserStatus } from '@/types';

// Pages
import LoginPage from "./pages/Login";
import RegisterPage from "./pages/Register";
import ForgotPasswordPage from "./pages/ForgotPassword";
import VerifyEmailPage from "./pages/VerifyEmail";
import ResetPasswordPage from "./pages/ResetPassword";
import Dashboard from "./pages/Dashboard";
import CourseDetails from "./pages/CourseDetails";
import WeekDetails from "./pages/WeekDetails";
import ChapterDetails from "./pages/ChapterDetails";
import NotFound from "./pages/NotFound";
import AuthActionHandlerPage from "./pages/AuthActionHandlerPage";
import EventsPage from "./pages/EventsPage";
import MessageBoardPage from "./pages/MessageBoardPage";
import SinglePostPage from "./pages/SinglePostPage";

// Admin Pages
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminCourses from "./pages/admin/AdminCourses";
import CourseForm from "./pages/admin/CourseForm";
import AdminWeeks from "./pages/admin/AdminWeeks";
import WeekForm from "./pages/admin/WeekForm";
import AdminChapters from "./pages/admin/AdminChapters";
import ChapterForm from "./pages/admin/ChapterForm";
import AdminUsers from "./pages/admin/AdminUsers";
import UserForm from "./pages/admin/UserForm";
import AdminSettings from "./pages/admin/AdminSettings";
import AdminMessageCategories from "./pages/admin/AdminMessageCategories";
import MessageCategoryForm from "./pages/admin/MessageCategoryForm";

// Helper function to attempt admin creation
const ensureAdminUserExists = async () => {
  // Only run this logic in development environment
  if (import.meta.env.DEV) {
    const adminEmail = "jan@websauce.be";
    const adminPassword = "Websauce123!"; // Ensure this matches what you expect
    console.log(`DEV MODE: Checking/Attempting to create admin user ${adminEmail}...`);

    try {
      // Define admin user data
      const now = new Date();
      const endDate = new Date(now);
      endDate.setFullYear(endDate.getFullYear() + 5); // Give admin 5 years access for dev

      const adminData = {
        role: "admin" as UserRole,
        status: "active" as UserStatus,
        start_date: now.toISOString(),
        end_date: endDate.toISOString(),
      };

      await createUser(adminEmail, adminPassword, adminData);
      console.log(`DEV MODE: Admin user ${adminEmail} ensured/created.`);

    } catch (error: any) {
      if (error.message && error.message.includes('auth/email-already-in-use')) {
        console.log(`DEV MODE: Admin user ${adminEmail} already exists.`);
      } else {
        console.error(`DEV MODE: Error ensuring admin user ${adminEmail} exists:`, error);
      }
    }
  }
};

const App = () => {
  // Run the admin check once when the app mounts
  useEffect(() => {
    ensureAdminUserExists();
  }, []);

  return (
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Public Authentication Routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/verify-email" element={<VerifyEmailPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
            <Route path="/auth/action" element={<AuthActionHandlerPage />} />
            
            {/* Redirect root to dashboard if logged in, otherwise to login */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            
            {/* User Routes (Protected) */}
            <Route 
              path="/dashboard" 
              element={
                <PrivateRoute>
                  <Dashboard />
                </PrivateRoute>
              } 
            />
            <Route 
              path="/events" 
              element={
                <PrivateRoute>
                  <EventsPage />
                </PrivateRoute>
              } 
            />
            <Route 
              path="/message-board" 
              element={
                <PrivateRoute>
                  <MessageBoardPage />
                </PrivateRoute>
              } 
            />
            <Route 
              path="/message-board/:categoryId" 
              element={
                <PrivateRoute>
                  <MessageBoardPage />
                </PrivateRoute>
              } 
            />
            <Route 
              path="/message-board/post/:postId" 
              element={
                <PrivateRoute>
                  <SinglePostPage />
                </PrivateRoute>
              } 
            />
            <Route 
              path="/courses/:courseId" 
              element={
                <PrivateRoute>
                  <CourseDetails />
                </PrivateRoute>
              } 
            />
            <Route 
              path="/courses/:courseId/weeks/:weekId" 
              element={
                <PrivateRoute>
                  <WeekDetails />
                </PrivateRoute>
              } 
            />
            <Route 
              path="/courses/:courseId/weeks/:weekId/chapters/:chapterId" 
              element={
                <PrivateRoute>
                  <ChapterDetails />
                </PrivateRoute>
              } 
            />
            
            {/* Admin Routes (Protected with role check) */}
            <Route 
              path="/admin" 
              element={
                <PrivateRoute requiredRole="admin">
                  <AdminDashboard />
                </PrivateRoute>
              } 
            />
            
            {/* Admin Course Management */}
            <Route 
              path="/admin/courses" 
              element={
                <PrivateRoute requiredRole="admin">
                  <AdminCourses />
                </PrivateRoute>
              } 
            />
            <Route 
              path="/admin/courses/new" 
              element={
                <PrivateRoute requiredRole="admin">
                  <CourseForm />
                </PrivateRoute>
              } 
            />
            <Route 
              path="/admin/courses/edit/:id" 
              element={
                <PrivateRoute requiredRole="admin">
                  <CourseForm />
                </PrivateRoute>
              } 
            />
            <Route 
              path="/admin/courses/:courseId/weeks" 
              element={
                <PrivateRoute requiredRole="admin">
                  <AdminWeeks />
                </PrivateRoute>
              } 
            />
            <Route 
              path="/admin/courses/:courseId/weeks/new" 
              element={
                <PrivateRoute requiredRole="admin">
                  <WeekForm />
                </PrivateRoute>
              } 
            />
            <Route 
              path="/admin/courses/:courseId/weeks/edit/:weekId" 
              element={
                <PrivateRoute requiredRole="admin">
                  <WeekForm />
                </PrivateRoute>
              } 
            />
            <Route 
              path="/admin/courses/:courseId/weeks/:weekId/chapters" 
              element={
                <PrivateRoute requiredRole="admin">
                  <AdminChapters />
                </PrivateRoute>
              } 
            />
            <Route 
              path="/admin/courses/:courseId/weeks/:weekId/chapters/new" 
              element={
                <PrivateRoute requiredRole="admin">
                  <ChapterForm />
                </PrivateRoute>
              } 
            />
            <Route 
              path="/admin/courses/:courseId/weeks/:weekId/chapters/edit/:chapterId" 
              element={
                <PrivateRoute requiredRole="admin">
                  <ChapterForm />
                </PrivateRoute>
              } 
            />
            
            {/* Admin User Management */}
            <Route 
              path="/admin/users" 
              element={
                <PrivateRoute requiredRole="admin">
                  <AdminUsers />
                </PrivateRoute>
              } 
            />
            <Route 
              path="/admin/users/new" 
              element={
                <PrivateRoute requiredRole="admin">
                  <UserForm />
                </PrivateRoute>
              } 
            />
            <Route 
              path="/admin/users/edit/:userId" 
              element={
                <PrivateRoute requiredRole="admin">
                  <UserForm />
                </PrivateRoute>
              } 
            />
            
            {/* Admin Message Board Category Management */}
            <Route 
              path="/admin/message-categories" 
              element={
                <PrivateRoute requiredRole="admin">
                  <AdminMessageCategories />
                </PrivateRoute>
              } 
            />
            <Route 
              path="/admin/message-categories/new" 
              element={
                <PrivateRoute requiredRole="admin">
                  <MessageCategoryForm />
                </PrivateRoute>
              } 
            />
            <Route 
              path="/admin/message-categories/edit/:categoryId" 
              element={
                <PrivateRoute requiredRole="admin">
                  <MessageCategoryForm />
                </PrivateRoute>
              } 
            />
            
            {/* Admin Settings */}
            <Route 
              path="/admin/settings" 
              element={
                <PrivateRoute requiredRole="admin">
                  <AdminSettings />
                </PrivateRoute>
              } 
            />
            
            {/* Catch-all route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  );
}

export default App;
