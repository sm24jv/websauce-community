import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import WebsauceHeader from "@/components/WebsauceHeader";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, AlertCircle } from "lucide-react";
import { PlatformSettings } from "@/types";
import { getPlatformSettings, updatePlatformSettings } from "@/lib/data";
import { Alert, AlertDescription } from "@/components/ui/alert";

// Define default settings values
const defaultSettings: PlatformSettings = {
  platform_name: "Websauce Community",
  admin_email: "admin@websauce.com",
  timezone: "UTC",
  date_format: "MM/DD/YYYY",
  email_from: "no-reply@websauce.com",
  email_sender_name: "Websauce Community",
  welcome_subject: "Welcome to Websauce Community!",
  welcome_template: `Hello {{name}},\n\nWelcome to Websauce Community! Your account has been created.\n\nYou can log in at: {{login_url}}\n\nThank you,\nWebsauce Community Team`,
  primary_color: "#3B82F6",
  secondary_color: "#10B981",
  logo_url: "",
  favicon_url: ""
};

const AdminSettings: React.FC = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { 
    register, 
    handleSubmit, 
    reset, 
    formState: { errors, isDirty },
    watch
  } = useForm<PlatformSettings>({
    defaultValues: defaultSettings
  });

  const { data: currentSettings, isLoading, isError, error } = useQuery<PlatformSettings | null>({
    queryKey: ['platformSettings'],
    queryFn: getPlatformSettings,
  });

  useEffect(() => {
    if (currentSettings) {
      console.log("Fetched settings, resetting form:", currentSettings);
      reset(currentSettings);
    } else if (!isLoading && !isError) {
      console.log("No settings fetched, ensuring defaults are set.");
      reset(defaultSettings);
    }
  }, [currentSettings, isLoading, isError, reset]);

  const mutation = useMutation({
    mutationFn: updatePlatformSettings,
    onSuccess: (success) => {
      if (success) {
        toast({
          title: "Settings Saved",
          description: "Your platform settings have been updated successfully.",
        });
        queryClient.invalidateQueries({ queryKey: ['platformSettings'] });
        reset({}, { keepValues: true });
      } else {
        throw new Error("Failed to save settings via mutation.");
      }
    },
    onError: (error: any) => {
      console.error("Failed to save settings:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to save settings. Please check console.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: PlatformSettings) => {
    console.log("Saving settings:", data);
    const { createdAt, updatedAt, ...updateData } = data; 
    mutation.mutate(updateData);
  };

  const primaryColor = watch("primary_color");
  const secondaryColor = watch("secondary_color");

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <WebsauceHeader />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Platform Settings</h1>
          <p className="text-gray-500 mt-1">Configure your community platform</p>
        </div>

        {(isLoading || mutation.isPending) && (
          <div className="flex items-center justify-center p-8">
            <Loader2 className="mr-2 h-6 w-6 animate-spin" /> Loading settings...
          </div>
        )}
        
        {isError && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Error loading settings: {error?.message || "Unknown error"}
            </AlertDescription>
          </Alert>
        )}
        
        {!isLoading && !isError && (
          <form onSubmit={handleSubmit(onSubmit)}>
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
                      <Input id="platform_name" {...register("platform_name", { required: "Platform name is required" })} />
                      {errors.platform_name && <p className="text-sm text-red-600">{errors.platform_name.message}</p>}
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="admin_email">Admin Email</Label>
                      <Input id="admin_email" type="email" {...register("admin_email", { required: "Admin email is required", pattern: { value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i, message: "Invalid email address" } })} />
                      {errors.admin_email && <p className="text-sm text-red-600">{errors.admin_email.message}</p>}
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="timezone">Default Timezone</Label>
                      <select 
                        id="timezone"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-websauce-500 focus:border-websauce-500"
                        {...register("timezone", { required: "Timezone is required" })}
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
                      {errors.timezone && <p className="text-sm text-red-600">{errors.timezone.message}</p>}
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="date_format">Date Format</Label>
                      <select 
                        id="date_format"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-websauce-500 focus:border-websauce-500"
                        {...register("date_format", { required: "Date format is required" })}
                      >
                        <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                        <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                        <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                      </select>
                      {errors.date_format && <p className="text-sm text-red-600">{errors.date_format.message}</p>}
                    </div>
                  </CardContent>
                  <CardFooter>
                    
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
                      <Input id="email_from" type="email" {...register("email_from", { required: "'From' email is required", pattern: { value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i, message: "Invalid email address" } })} />
                      {errors.email_from && <p className="text-sm text-red-600">{errors.email_from.message}</p>}
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="email_sender_name">Sender Name</Label>
                      <Input id="email_sender_name" {...register("email_sender_name", { required: "Sender name is required" })} />
                      {errors.email_sender_name && <p className="text-sm text-red-600">{errors.email_sender_name.message}</p>}
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="welcome_subject">Welcome Email Subject</Label>
                      <Input id="welcome_subject" {...register("welcome_subject", { required: "Welcome subject is required" })} />
                      {errors.welcome_subject && <p className="text-sm text-red-600">{errors.welcome_subject.message}</p>}
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="welcome_template">Welcome Email Template</Label>
                      <Textarea 
                        id="welcome_template" 
                        className="w-full min-h-[200px] px-3 py-2 border border-gray-300 rounded-md focus:ring-websauce-500 focus:border-websauce-500"
                        {...register("welcome_template", { required: "Welcome template is required" })}
                      />
                       {errors.welcome_template && <p className="text-sm text-red-600">{errors.welcome_template.message}</p>}
                       <p className="text-xs text-gray-500">Use placeholders like {'{{name}}'}, {'{{email}}'}, {'{{login_url}}'}.</p>
                    </div>
                  </CardContent>
                  <CardFooter>
                    
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
                      <div className="flex items-center gap-2">
                        <Input id="primary_color" {...register("primary_color", { required: "Primary color is required", pattern: { value: /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, message: "Invalid hex color" } })} />
                        <Input type="color" className="h-10 w-10 p-1 border-none cursor-pointer" {...register("primary_color")} value={primaryColor || "#000000"} />
                      </div>
                       {errors.primary_color && <p className="text-sm text-red-600">{errors.primary_color.message}</p>}
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="secondary_color">Secondary Color</Label>
                      <div className="flex items-center gap-2">
                        <Input id="secondary_color" {...register("secondary_color", { required: "Secondary color is required", pattern: { value: /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, message: "Invalid hex color" } })} />
                         <Input type="color" className="h-10 w-10 p-1 border-none cursor-pointer" {...register("secondary_color")} value={secondaryColor || "#000000"} />
                      </div>
                      {errors.secondary_color && <p className="text-sm text-red-600">{errors.secondary_color.message}</p>}
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="logo_url">Logo URL</Label>
                      <Input id="logo_url" type="url" placeholder="https://.../logo.png" {...register("logo_url")} />
                      {errors.logo_url && <p className="text-sm text-red-600">{errors.logo_url.message}</p>}
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="favicon_url">Favicon URL</Label>
                      <Input id="favicon_url" type="url" placeholder="https://.../favicon.ico" {...register("favicon_url")} />
                       {errors.favicon_url && <p className="text-sm text-red-600">{errors.favicon_url.message}</p>}
                    </div>
                  </CardContent>
                  <CardFooter>
                    
                  </CardFooter>
                </Card>
              </TabsContent>

              <div className="mt-6 flex justify-end">
                <Button 
                  type="submit" 
                  className="bg-theme-primary hover:opacity-90 text-white"
                  disabled={mutation.isPending || !isDirty}
                >
                  {mutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...
                    </>
                  ) : (
                     "Save Settings"
                  )}
                </Button>
              </div>
            </Tabs>
          </form>
        )}
      </main>
    </div>
  );
};

export default AdminSettings;
