
import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Week } from "@/types";
import { getCourse, getWeeksForCourse, deleteWeek } from "@/lib/data";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/components/ui/use-toast";
import { Pencil, Trash, Plus, ChevronLeft, BookOpen } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";

const AdminWeeks: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const { data: course, isLoading: isLoadingCourse } = useQuery({
    queryKey: ['course', courseId],
    queryFn: () => getCourse(courseId!),
    enabled: !!courseId,
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes
  });
  
  const { data: weeks = [], isLoading: isLoadingWeeks } = useQuery({
    queryKey: ['weeks', courseId],
    queryFn: () => getWeeksForCourse(courseId!),
    enabled: !!courseId,
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes
  });

  const handleEdit = (weekId: string) => {
    navigate(`/admin/courses/${courseId}/weeks/edit/${weekId}`);
  };

  const handleDelete = async (weekId: string) => {
    if (window.confirm("Are you sure you want to delete this week? This will also delete all associated chapters.")) {
      const success = await deleteWeek(weekId);
      
      if (success) {
        toast({
          title: "Week Deleted",
          description: "The week has been successfully deleted.",
        });
        
        // Invalidate the weeks query to refresh the data
        queryClient.invalidateQueries({ queryKey: ['weeks', courseId] });
      } else {
        toast({
          title: "Error",
          description: "Failed to delete the week.",
          variant: "destructive",
        });
      }
    }
  };

  const handleViewChapters = (weekId: string) => {
    navigate(`/admin/courses/${courseId}/weeks/${weekId}/chapters`);
  };

  const isLoading = isLoadingCourse || isLoadingWeeks;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      
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
        
        {isLoadingCourse ? (
          <div className="space-y-2 mb-6">
            <Skeleton className="h-8 w-2/3" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        ) : course ? (
          <>
            <div className="flex justify-between items-center mb-6">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Weeks for: {course.title}</h1>
                <p className="text-gray-500 mt-1">Manage the weeks for this course</p>
              </div>
              <Button 
                onClick={() => navigate(`/admin/courses/${courseId}/weeks/new`)} 
                className="flex items-center gap-2"
              >
                <Plus size={16} />
                <span>Add New Week</span>
              </Button>
            </div>
            
            <div className="bg-white shadow-sm rounded-lg border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[70px]">Index</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead className="w-[150px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoadingWeeks ? (
                    <>
                      {[1, 2, 3].map((i) => (
                        <TableRow key={`skeleton-${i}`}>
                          <TableCell><Skeleton className="h-5 w-5" /></TableCell>
                          <TableCell><Skeleton className="h-5 w-full" /></TableCell>
                          <TableCell><Skeleton className="h-5 w-full" /></TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Skeleton className="h-8 w-8" />
                              <Skeleton className="h-8 w-8" />
                              <Skeleton className="h-8 w-8" />
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </>
                  ) : weeks.length > 0 ? (
                    weeks.map((week) => (
                      <TableRow key={week.id}>
                        <TableCell>{week.index}</TableCell>
                        <TableCell className="font-medium">{week.title}</TableCell>
                        <TableCell className="truncate max-w-xs">{week.short_description}</TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button 
                              variant="outline" 
                              size="icon" 
                              onClick={() => handleEdit(week.id)}
                              title="Edit Week"
                            >
                              <Pencil size={16} />
                            </Button>
                            <Button 
                              variant="outline" 
                              size="icon"
                              onClick={() => handleViewChapters(week.id)}
                              title="Manage Chapters"
                            >
                              <BookOpen size={16} />
                            </Button>
                            <Button 
                              variant="outline" 
                              size="icon"
                              onClick={() => handleDelete(week.id)}
                              title="Delete Week"
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
                        No weeks found. Click "Add New Week" to create one.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </>
        ) : (
          <div className="text-center py-8 text-red-500">Course not found</div>
        )}
      </main>
    </div>
  );
};

export default AdminWeeks;
