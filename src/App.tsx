
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import PrivateRoute from "@/components/PrivateRoute";

// Pages
import Login from "./pages/Login";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Dashboard from "./pages/Dashboard";
import CourseDetails from "./pages/CourseDetails";
import WeekDetails from "./pages/WeekDetails";
import ChapterDetails from "./pages/ChapterDetails";
import NotFound from "./pages/NotFound";

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

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password/:token" element={<ResetPassword />} />
            
            {/* Redirect root to dashboard */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            
            {/* User Routes */}
            <Route 
              path="/dashboard" 
              element={
                <PrivateRoute>
                  <Dashboard />
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
            
            {/* Admin Routes */}
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
  </QueryClientProvider>
);

export default App;
