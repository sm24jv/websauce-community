
import React from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";

const AdminSettings: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSave = () => {
    toast({
      title: "Settings Saved",
      description: "Your platform settings have been updated successfully.",
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Platform Settings</h1>
          <p className="text-gray-500 mt-1">Configure your community platform</p>
        </div>
        
        <Tabs defaultValue="general" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="email">Email</TabsTrigger>
            <TabsTrigger value="appearance">Appearance</TabsTrigger>
          </TabsList>
          
          <TabsContent value="general">
            <Card>
              <CardHeader>
                <CardTitle>General Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="platform_name">Platform Name</Label>
                  <Input id="platform_name" defaultValue="Websauce Community" />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="admin_email">Admin Email</Label>
                  <Input id="admin_email" type="email" defaultValue="admin@websauce.com" />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="timezone">Default Timezone</Label>
                  <select 
                    id="timezone"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    defaultValue="UTC"
                  >
                    <option value="UTC">UTC</option>
                    <option value="America/New_York">Eastern Time (ET)</option>
                    <option value="America/Chicago">Central Time (CT)</option>
                    <option value="America/Denver">Mountain Time (MT)</option>
                    <option value="America/Los_Angeles">Pacific Time (PT)</option>
                    <option value="Europe/London">London</option>
                    <option value="Europe/Paris">Paris</option>
                    <option value="Asia/Tokyo">Tokyo</option>
                  </select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="date_format">Date Format</Label>
                  <select 
                    id="date_format"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    defaultValue="MM/DD/YYYY"
                  >
                    <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                    <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                    <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                  </select>
                </div>
              </CardContent>
              <CardFooter>
                <Button onClick={handleSave}>Save Settings</Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          <TabsContent value="email">
            <Card>
              <CardHeader>
                <CardTitle>Email Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email_from">From Email</Label>
                  <Input id="email_from" type="email" defaultValue="no-reply@websauce.com" />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email_sender_name">Sender Name</Label>
                  <Input id="email_sender_name" defaultValue="Websauce Community" />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="welcome_subject">Welcome Email Subject</Label>
                  <Input id="welcome_subject" defaultValue="Welcome to Websauce Community!" />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="welcome_template">Welcome Email Template</Label>
                  <textarea 
                    id="welcome_template" 
                    className="w-full min-h-[200px] px-3 py-2 border border-gray-300 rounded-md"
                    defaultValue={`Hello {{name}},\n\nWelcome to Websauce Community! Your account has been created.\n\nUsername: {{email}}\nPassword: {{password}}\n\nYou can log in at: {{login_url}}\n\nThank you,\nWebsauce Community Team`}
                  />
                </div>
              </CardContent>
              <CardFooter>
                <Button onClick={handleSave}>Save Settings</Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          <TabsContent value="appearance">
            <Card>
              <CardHeader>
                <CardTitle>Appearance Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="primary_color">Primary Color</Label>
                  <div className="flex gap-2">
                    <Input id="primary_color" defaultValue="#3B82F6" />
                    <input type="color" value="#3B82F6" className="h-10 w-10" />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="secondary_color">Secondary Color</Label>
                  <div className="flex gap-2">
                    <Input id="secondary_color" defaultValue="#10B981" />
                    <input type="color" value="#10B981" className="h-10 w-10" />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="logo_url">Logo URL</Label>
                  <Input id="logo_url" defaultValue="" placeholder="Enter logo URL" />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="favicon_url">Favicon URL</Label>
                  <Input id="favicon_url" defaultValue="" placeholder="Enter favicon URL" />
                </div>
              </CardContent>
              <CardFooter>
                <Button onClick={handleSave}>Save Settings</Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default AdminSettings;
