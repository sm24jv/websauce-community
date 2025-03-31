
import React from "react";
import { Link } from "react-router-dom";
import Header from "@/components/Header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, BookOpen, Settings } from "lucide-react";

const AdminDashboard: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-500 mt-2">Manage your community platform</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link to="/admin/users">
            <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
              <CardHeader>
                <Users className="h-8 w-8 text-websauce-600 mb-2" />
                <CardTitle>User Management</CardTitle>
                <CardDescription>Manage users, add new members, set permissions</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-500">
                  Create, edit, and manage user accounts, set membership start and end dates, 
                  and control access to your platform.
                </p>
              </CardContent>
            </Card>
          </Link>
          
          <Link to="/admin/courses">
            <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
              <CardHeader>
                <BookOpen className="h-8 w-8 text-websauce-600 mb-2" />
                <CardTitle>Course Management</CardTitle>
                <CardDescription>Create and manage courses, weeks, and chapters</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-500">
                  Build your curriculum by creating courses, organizing content into weeks and chapters,
                  and uploading videos and resources.
                </p>
              </CardContent>
            </Card>
          </Link>
          
          <Link to="/admin/settings">
            <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
              <CardHeader>
                <Settings className="h-8 w-8 text-websauce-600 mb-2" />
                <CardTitle>Platform Settings</CardTitle>
                <CardDescription>Configure system-wide settings</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-500">
                  Manage global platform settings, customize email templates, 
                  and adjust system parameters.
                </p>
              </CardContent>
            </Card>
          </Link>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
