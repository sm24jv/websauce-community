
import React, { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { getCourse, getWeek, createWeek, updateWeek } from "@/lib/data";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { ChevronLeft } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

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
  const { data: course } = useQuery({
    queryKey: ['course', courseId],
    queryFn: () => getCourse(courseId!),
    enabled: !!courseId,
  });
  
  // Fetch existing weeks to determine next index
  const { data: weeks = [] } = useQuery({
    queryKey: ['weeks', courseId],
    queryFn: () => getWeeksForCourse(courseId!),
    enabled: !!courseId && !isEditMode,
  });
  
  // Fetch week data if in edit mode
  const { data: week } = useQuery({
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
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create week",
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
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update week",
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
  
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      
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
        
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>
              {isEditMode ? "Edit Week" : "Create New Week"}
              {course && <span className="text-gray-500 ml-2 text-sm">for {course.title}</span>}
            </CardTitle>
          </CardHeader>
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
        </Card>
      </main>
    </div>
  );
};

export default WeekForm;
