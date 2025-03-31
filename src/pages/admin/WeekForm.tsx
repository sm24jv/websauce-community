
import React, { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { getCourse, getWeek, createWeek, updateWeek, getWeeksForCourse } from "@/lib/data";
import WebsauceHeader from "@/components/WebsauceHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { ChevronLeft } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2 } from "lucide-react";

interface WeekFormData {
  title: string;
  thumbnail_url: string;
  short_description: string;
  index: number;
}

const WeekForm: React.FC = () => {
  const { courseId, weekId } = useParams<{ courseId: string, weekId: string }>();
  const isEditMode = weekId !== "new" && !!weekId;
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const { register, handleSubmit, formState: { errors }, reset, setValue } = useForm<WeekFormData>();
  
  // Fetch course data
  const { data: course, isLoading: isLoadingCourse } = useQuery({
    queryKey: ['course', courseId],
    queryFn: () => getCourse(courseId!),
    enabled: !!courseId,
  });
  
  // Fetch existing weeks to determine next index
  const { data: weeks = [], isLoading: isLoadingWeeks } = useQuery({
    queryKey: ['weeks', courseId],
    queryFn: () => getWeeksForCourse(courseId!),
    enabled: !!courseId && !isEditMode,
  });
  
  // Fetch week data if in edit mode
  const { data: week, isLoading: isLoadingWeek } = useQuery({
    queryKey: ['week', weekId],
    queryFn: () => getWeek(weekId!),
    enabled: isEditMode,
  });
  
  // Set form values when week data is loaded
  useEffect(() => {
    if (week) {
      reset({
        title: week.title,
        thumbnail_url: week.thumbnail_url,
        short_description: week.short_description,
        index: week.index
      });
    } else if (!isEditMode && weeks.length >= 0) {
      // For new weeks, set the next available index
      const maxIndex = weeks.length > 0 ? Math.max(...weeks.map(w => w.index)) : 0;
      setValue('index', maxIndex + 1);
    }
  }, [week, weeks, isEditMode, reset, setValue]);
  
  // Create week mutation
  const createMutation = useMutation({
    mutationFn: (data: WeekFormData) => createWeek({
      ...data,
      course_id: courseId!,
    }),
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Week created successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['weeks', courseId] });
      navigate(`/admin/courses/${courseId}/weeks`);
    },
    onError: (error: any) => {
      console.error("Create week error:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to create week. There might be an issue with database permissions.",
        variant: "destructive",
      });
    }
  });
  
  // Update week mutation
  const updateMutation = useMutation({
    mutationFn: (data: WeekFormData) => updateWeek(weekId!, data),
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Week updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['weeks', courseId] });
      queryClient.invalidateQueries({ queryKey: ['week', weekId] });
      navigate(`/admin/courses/${courseId}/weeks`);
    },
    onError: (error: any) => {
      console.error("Update week error:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to update week. There might be an issue with database permissions.",
        variant: "destructive",
      });
    }
  });
  
  const onSubmit = (data: WeekFormData) => {
    if (isEditMode) {
      updateMutation.mutate(data);
    } else {
      createMutation.mutate(data);
    }
  };

  const isLoading = isLoadingCourse || isLoadingWeeks || isLoadingWeek;
  
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <WebsauceHeader />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="mb-4">
          <Button 
            variant="ghost" 
            className="flex items-center text-websauce-600 hover:text-websauce-700 p-0"
            onClick={() => navigate(`/admin/courses/${courseId}/weeks`)}
          >
            <ChevronLeft size={16} className="mr-1" />
            <span>Back to Weeks</span>
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
            <CardTitle>
              {isEditMode ? "Edit Week" : "Create New Week"}
              {course && <span className="text-gray-500 ml-2 text-sm">for {course.title}</span>}
            </CardTitle>
          </CardHeader>
          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-websauce-600" />
              <span className="ml-3 text-lg text-gray-600">Loading...</span>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="index">Week Number</Label>
                  <Input
                    id="index"
                    type="number"
                    {...register("index", { 
                      required: "Week number is required",
                      valueAsNumber: true,
                      min: { value: 1, message: "Week number must be at least 1" } 
                    })}
                  />
                  {errors.index && <p className="text-red-500 text-sm">{errors.index.message}</p>}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="title">Week Title</Label>
                  <Input
                    id="title"
                    placeholder="Enter week title"
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
                  <Label htmlFor="short_description">Short Description</Label>
                  <Textarea
                    id="short_description"
                    placeholder="Enter short description"
                    className="h-24"
                    {...register("short_description", { required: "Description is required" })}
                  />
                  {errors.short_description && <p className="text-red-500 text-sm">{errors.short_description.message}</p>}
                </div>
              </CardContent>
              <CardFooter className="flex justify-end space-x-4">
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={() => navigate(`/admin/courses/${courseId}/weeks`)}
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
                      ? "Update Week"
                      : "Create Week"
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

export default WeekForm;
