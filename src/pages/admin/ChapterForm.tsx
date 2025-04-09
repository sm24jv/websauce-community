import React, { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { getWeek, getChapter, createChapter, updateChapter } from "@/lib/data";
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

interface ChapterFormData {
  title: string;
  video_url: string;
  content: string;
  pdf_url?: string;
}

const ChapterForm: React.FC = () => {
  const { courseId, weekId, chapterId } = useParams<{ courseId: string, weekId: string, chapterId: string }>();
  const isEditMode = chapterId !== "new" && !!chapterId;
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const { register, handleSubmit, formState: { errors }, reset } = useForm<ChapterFormData>();
  
  // Fetch week data
  const { data: week, isLoading: isLoadingWeek } = useQuery({
    queryKey: ['week', weekId],
    queryFn: () => getWeek(weekId!),
    enabled: !!weekId,
  });
  
  // Fetch chapter data if in edit mode
  const { data: chapter, isLoading: isLoadingChapter } = useQuery({
    queryKey: ['chapter', chapterId],
    queryFn: () => getChapter(chapterId!),
    enabled: isEditMode,
  });
  
  // Set form values when chapter data is loaded
  useEffect(() => {
    if (chapter) {
      reset({
        title: chapter.title,
        video_url: chapter.video_url,
        content: chapter.content,
        pdf_url: chapter.pdf_url
      });
    }
  }, [chapter, reset]);
  
  // Create chapter mutation
  const createMutation = useMutation({
    mutationFn: (data: ChapterFormData) => createChapter({
      ...data,
      week_id: weekId!,
    }),
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Chapter created successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['chapters', weekId] });
      navigate(`/admin/courses/${courseId}/weeks/${weekId}/chapters`);
    },
    onError: (error: any) => {
      console.error("Create chapter error:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to create chapter. There might be an issue with database permissions.",
        variant: "destructive",
      });
    }
  });
  
  // Update chapter mutation
  const updateMutation = useMutation({
    mutationFn: (data: ChapterFormData) => updateChapter(chapterId!, data),
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Chapter updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['chapters', weekId] });
      queryClient.invalidateQueries({ queryKey: ['chapter', chapterId] });
      navigate(`/admin/courses/${courseId}/weeks/${weekId}/chapters`);
    },
    onError: (error: any) => {
      console.error("Update chapter error:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to update chapter. There might be an issue with database permissions.",
        variant: "destructive",
      });
    }
  });
  
  const onSubmit = (data: ChapterFormData) => {
    if (isEditMode) {
      updateMutation.mutate(data);
    } else {
      createMutation.mutate(data);
    }
  };

  const isLoading = isLoadingWeek || isLoadingChapter;
  
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <WebsauceHeader />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="mb-4">
          <Button 
            variant="ghost" 
            className="flex items-center text-websauce-600 hover:text-websauce-700 p-0"
            onClick={() => navigate(`/admin/courses/${courseId}/weeks/${weekId}/chapters`)}
          >
            <ChevronLeft size={16} className="mr-1" />
            <span>Back to Chapters</span>
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
              {isEditMode ? "Edit Chapter" : "Create New Chapter"}
              {week && <span className="text-gray-500 ml-2 text-sm">for Week {week.week_number} - {week.title}</span>}
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
                  <Label htmlFor="title">Chapter Title</Label>
                  <Input
                    id="title"
                    placeholder="Enter chapter title"
                    {...register("title", { required: "Title is required" })}
                  />
                  {errors.title && <p className="text-red-500 text-sm">{errors.title.message}</p>}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="video_url">Video URL</Label>
                  <Input
                    id="video_url"
                    placeholder="Enter Vimeo video URL"
                    {...register("video_url", { required: "Video URL is required" })}
                  />
                  {errors.video_url && <p className="text-red-500 text-sm">{errors.video_url.message}</p>}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="content">Content/Description</Label>
                  <Textarea
                    id="content"
                    placeholder="Enter chapter content/description"
                    className="h-32"
                    {...register("content", { required: "Content is required" })}
                  />
                  {errors.content && <p className="text-red-500 text-sm">{errors.content.message}</p>}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="pdf_url">PDF URL (optional)</Label>
                  <Input
                    id="pdf_url"
                    placeholder="Enter PDF URL"
                    {...register("pdf_url")}
                  />
                </div>
              </CardContent>
              <CardFooter className="flex justify-end space-x-4">
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={() => navigate(`/admin/courses/${courseId}/weeks/${weekId}/chapters`)}
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
                      ? "Update Chapter"
                      : "Create Chapter"
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

export default ChapterForm;
