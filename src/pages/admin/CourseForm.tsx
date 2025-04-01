import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { getCourse, createCourse, updateCourse } from "@/lib/data";
import WebsauceHeader from "@/components/WebsauceHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { ChevronLeft, Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useAuth } from "@/contexts/AuthContext";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

interface CourseFormData {
  title: string;
  thumbnail_url: string;
  description: string;
}

const CourseForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const isEditMode = id !== "new" && !!id;
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  const form = useForm<CourseFormData>({
    defaultValues: {
      title: "",
      thumbnail_url: "",
      description: ""
    }
  });
  
  // Fetch course data if in edit mode
  const { data: course, isLoading: isLoadingCourse } = useQuery({
    queryKey: ['course', id],
    queryFn: () => getCourse(id!),
    enabled: isEditMode,
  });
  
  // Set form values when course data is loaded
  useEffect(() => {
    if (course) {
      form.reset({
        title: course.title,
        thumbnail_url: course.thumbnail_url,
        description: course.description
      });
    }
  }, [course, form]);
  
  // Create course mutation
  const createMutation = useMutation({
    mutationFn: async (data: CourseFormData) => {
      console.log("Creating course with:", data);
      const newCourse = await createCourse(data);
      if (!newCourse) {
        throw new Error("Failed to create course");
      }
      return newCourse;
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Course created successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      navigate("/admin/courses");
    },
    onError: (error: any) => {
      console.error("Create course error:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to create course",
        variant: "destructive",
      });
    }
  });
  
  // Update course mutation
  const updateMutation = useMutation({
    mutationFn: async (data: CourseFormData) => {
      console.log("Updating course with:", data);
      const updatedCourse = await updateCourse(id!, data);
      if (!updatedCourse) {
        throw new Error("Failed to update course");
      }
      return updatedCourse;
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Course updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      queryClient.invalidateQueries({ queryKey: ['course', id] });
      navigate("/admin/courses");
    },
    onError: (error: any) => {
      console.error("Update course error:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to update course",
        variant: "destructive",
      });
    }
  });
  
  const onSubmit = (data: CourseFormData) => {
    console.log("Submitting form data:", data);
    
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "You must be logged in to perform this action.",
        variant: "destructive",
      });
      return;
    }
    
    if (isEditMode) {
      updateMutation.mutate(data);
    } else {
      createMutation.mutate(data);
    }
  };
  
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <WebsauceHeader />
        <main className="flex-1 container mx-auto px-4 py-8">
          <Alert variant="destructive" className="mb-4">
            <AlertTitle>Authentication Required</AlertTitle>
            <AlertDescription>
              You must be logged in to create or edit courses.
            </AlertDescription>
          </Alert>
        </main>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <WebsauceHeader />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="mb-4">
          <Button 
            variant="ghost" 
            className="flex items-center text-websauce-600 hover:text-websauce-700 p-0"
            onClick={() => navigate("/admin/courses")}
          >
            <ChevronLeft size={16} className="mr-1" />
            <span>Back to Courses</span>
          </Button>
        </div>

        {(createMutation.error || updateMutation.error) && (
          <Alert variant="destructive" className="mb-4">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
              There was an issue saving the data. Please ensure you're logged in with the correct account.
            </AlertDescription>
          </Alert>
        )}
        
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>{isEditMode ? "Edit Course" : "Create New Course"}</CardTitle>
          </CardHeader>
          {isLoadingCourse ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-websauce-600" />
              <span className="ml-3 text-lg text-gray-600">Loading...</span>
            </div>
          ) : (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)}>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="title"
                    rules={{ required: "Title is required" }}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Course Title</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter course title" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="thumbnail_url"
                    rules={{ required: "Thumbnail URL is required" }}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Thumbnail URL</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter thumbnail URL" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="description"
                    rules={{ required: "Description is required" }}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Enter course description" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
                
                <CardFooter className="flex justify-end space-x-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate("/admin/courses")}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={createMutation.isPending || updateMutation.isPending}
                  >
                    {createMutation.isPending || updateMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      "Save Course"
                    )}
                  </Button>
                </CardFooter>
              </form>
            </Form>
          )}
        </Card>
      </main>
    </div>
  );
};

export default CourseForm;
