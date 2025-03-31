
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
  
  const { register, handleSubmit, formState: { errors }, reset } = useForm<CourseFormData>();
  
  // Fetch course data if in edit mode
  const { data: course, isLoading: isLoadingCourse } = useQuery({
    queryKey: ['course', id],
    queryFn: () => getCourse(id!),
    enabled: isEditMode,
  });
  
  // Set form values when course data is loaded
  useEffect(() => {
    if (course) {
      reset({
        title: course.title,
        thumbnail_url: course.thumbnail_url,
        description: course.description
      });
    }
  }, [course, reset]);
  
  // Create course mutation
  const createMutation = useMutation({
    mutationFn: (data: CourseFormData) => createCourse(data),
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
        description: error.message || "Failed to create course. There might be an issue with database permissions.",
        variant: "destructive",
      });
    }
  });
  
  // Update course mutation
  const updateMutation = useMutation({
    mutationFn: (data: CourseFormData) => updateCourse(id!, data),
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
        description: error.message || "Failed to update course. There might be an issue with database permissions.",
        variant: "destructive",
      });
    }
  });
  
  const onSubmit = (data: CourseFormData) => {
    if (isEditMode) {
      updateMutation.mutate(data);
    } else {
      createMutation.mutate(data);
    }
  };
  
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
              There was an issue saving the data to Supabase. This could be related to database permissions or Row Level Security policies.
              Please ensure you're logged in with the correct account.
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
            <form onSubmit={handleSubmit(onSubmit)}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Course Title</Label>
                  <Input
                    id="title"
                    placeholder="Enter course title"
                    {...register("title", { required: "Title is required" })}
                  />
                  {errors.title && <p className="text-red-500 text-sm">{errors.title.message}</p>}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="thumbnail_url">Thumbnail URL</Label>
                  <Input
                    id="thumbnail_url"
                    placeholder="Enter thumbnail URL"
                    {...register("thumbnail_url", { required: "Thumbnail URL is required" })}
                  />
                  {errors.thumbnail_url && <p className="text-red-500 text-sm">{errors.thumbnail_url.message}</p>}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Enter course description"
                    className="h-32"
                    {...register("description", { required: "Description is required" })}
                  />
                  {errors.description && <p className="text-red-500 text-sm">{errors.description.message}</p>}
                </div>
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
                  className="bg-websauce-600 hover:bg-websauce-700"
                >
                  {createMutation.isPending || updateMutation.isPending
                    ? "Saving..."
                    : isEditMode
                      ? "Update Course"
                      : "Create Course"
                  }
                </Button>
              </CardFooter>
            </form>
          )}
        </Card>
      </main>
    </div>
  );
};

export default CourseForm;
