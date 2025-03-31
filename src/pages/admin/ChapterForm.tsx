
import React, { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { getWeek, getChapter, createChapter, updateChapter } from "@/lib/data";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { ChevronLeft } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

interface ChapterFormData {
  title: string;
  thumbnail_url: string;
  video_url: string;
  description: string;
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
  const { data: week } = useQuery({
    queryKey: ['week', weekId],
    queryFn: () => getWeek(weekId!),
    enabled: !!weekId,
  });
  
  // Fetch chapter data if in edit mode
  const { data: chapter } = useQuery({
    queryKey: ['chapter', chapterId],
    queryFn: () => getChapter(chapterId!),
    enabled: isEditMode,
  });
  
  // Set form values when chapter data is loaded
  useEffect(() => {
    if (chapter) {
      reset({
        title: chapter.title,
        thumbnail_url: chapter.thumbnail_url,
        video_url: chapter.video_url,
        description: chapter.description,
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
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create chapter",
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
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update chapter",
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
  
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      
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
        
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>
              {isEditMode ? "Edit Chapter" : "Create New Chapter"}
              {week && <span className="text-gray-500 ml-2 text-sm">for Week {week.index} - {week.title}</span>}
            </CardTitle>
          </CardHeader>
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
                <Label htmlFor="thumbnail_url">Thumbnail URL</Label>
                <Input
                  id="thumbnail_url"
                  placeholder="Enter thumbnail URL"
                  {...register("thumbnail_url", { required: "Thumbnail URL is required" })}
                />
                {errors.thumbnail_url && <p className="text-red-500 text-sm">{errors.thumbnail_url.message}</p>}
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
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Enter chapter description"
                  className="h-32"
                  {...register("description", { required: "Description is required" })}
                />
                {errors.description && <p className="text-red-500 text-sm">{errors.description.message}</p>}
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
        </Card>
      </main>
    </div>
  );
};

export default ChapterForm;
