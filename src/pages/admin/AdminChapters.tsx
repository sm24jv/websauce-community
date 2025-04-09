import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getWeek, getChaptersForWeek, deleteChapter } from "@/lib/data";
import WebsauceHeader from "@/components/WebsauceHeader";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/components/ui/use-toast";
import { Pencil, Trash, Plus, ChevronLeft, FileText } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";

const AdminChapters: React.FC = () => {
  const { courseId, weekId } = useParams<{ courseId: string, weekId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const { data: week, isLoading: isLoadingWeek } = useQuery({
    queryKey: ['week', weekId],
    queryFn: () => getWeek(weekId!),
    enabled: !!weekId,
  });
  
  const { data: chapters = [], isLoading: isLoadingChapters } = useQuery({
    queryKey: ['chapters', weekId],
    queryFn: () => getChaptersForWeek(weekId!),
    enabled: !!weekId,
  });

  const handleEdit = (chapterId: string) => {
    navigate(`/admin/courses/${courseId}/weeks/${weekId}/chapters/edit/${chapterId}`);
  };

  const handleDelete = async (chapterId: string) => {
    if (window.confirm("Are you sure you want to delete this chapter?")) {
      const success = await deleteChapter(chapterId);
      
      if (success) {
        toast({
          title: "Chapter Deleted",
          description: "The chapter has been successfully deleted.",
        });
        
        // Invalidate the chapters query to refresh the data
        queryClient.invalidateQueries({ queryKey: ['chapters', weekId] });
      } else {
        toast({
          title: "Error",
          description: "Failed to delete the chapter.",
          variant: "destructive",
        });
      }
    }
  };

  const isLoading = isLoadingWeek || isLoadingChapters;

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
        
        {isLoading ? (
          <div className="text-center py-8">Loading...</div>
        ) : week ? (
          <>
            <div className="flex justify-between items-center mb-6">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Chapters for: Week {week.week_number} - {week.title}</h1>
                <p className="text-gray-500 mt-1">Manage the chapters for this week</p>
              </div>
              <Button 
                onClick={() => navigate(`/admin/courses/${courseId}/weeks/${weekId}/chapters/new`)} 
                className="flex items-center gap-2"
              >
                <Plus size={16} />
                <span>Add New Chapter</span>
              </Button>
            </div>
            
            <div className="bg-white shadow-sm rounded-lg border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Video URL</TableHead>
                    <TableHead>PDF</TableHead>
                    <TableHead className="w-[120px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {chapters.length > 0 ? (
                    chapters.map((chapter) => (
                      <TableRow key={chapter.id}>
                        <TableCell className="font-medium">{chapter.title}</TableCell>
                        <TableCell className="truncate max-w-xs">{chapter.video_url}</TableCell>
                        <TableCell>
                          {chapter.pdf_url ? (
                            <span className="flex items-center text-websauce-600">
                              <FileText size={16} className="mr-1" />
                              <span>Available</span>
                            </span>
                          ) : (
                            <span className="text-gray-400">None</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button 
                              variant="outline" 
                              size="icon" 
                              onClick={() => handleEdit(chapter.id)}
                              title="Edit Chapter"
                            >
                              <Pencil size={16} />
                            </Button>
                            <Button 
                              variant="outline" 
                              size="icon"
                              onClick={() => handleDelete(chapter.id)}
                              title="Delete Chapter"
                            >
                              <Trash size={16} />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-6 text-gray-500">
                        No chapters found. Click "Add New Chapter" to create one.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </>
        ) : (
          <div className="text-center py-8 text-red-500">Week not found</div>
        )}
      </main>
    </div>
  );
};

export default AdminChapters;
