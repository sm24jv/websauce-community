import React from "react";
import { useNavigate } from "react-router-dom";
import { Course } from "@/types";
import { getCourses, deleteCourse } from "@/lib/data";
import WebsauceHeader from "@/components/WebsauceHeader";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/components/ui/use-toast";
import { Pencil, Trash, Plus, Layers } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";

const AdminCourses: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const { data: courses = [], isLoading, error } = useQuery({
    queryKey: ['courses'],
    queryFn: getCourses,
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes
  });

  const handleEdit = (courseId: string) => {
    navigate(`/admin/courses/edit/${courseId}`);
  };

  const handleDelete = async (courseId: string) => {
    if (window.confirm("Are you sure you want to delete this course? This will also delete all associated weeks and chapters.")) {
      const success = await deleteCourse(courseId);
      
      if (success) {
        toast({
          title: "Course Deleted",
          description: "The course has been successfully deleted.",
        });
        
        // Invalidate the courses query to refresh the data
        queryClient.invalidateQueries({ queryKey: ['courses'] });
      } else {
        toast({
          title: "Error",
          description: "Failed to delete the course.",
          variant: "destructive",
        });
      }
    }
  };

  const handleViewWeeks = (courseId: string) => {
    navigate(`/admin/courses/${courseId}/weeks`);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <WebsauceHeader />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Course Management</h1>
          <Button onClick={() => navigate("/admin/courses/new")} className="flex items-center gap-2">
            <Plus size={16} />
            <span>Add New Course</span>
          </Button>
        </div>
        
        {isLoading ? (
          <div className="bg-white shadow-sm rounded-lg border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[80px]">Image</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="w-[150px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {[1, 2, 3].map((i) => (
                  <TableRow key={`skeleton-${i}`}>
                    <TableCell><Skeleton className="h-5 w-full" /></TableCell>
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
              </TableBody>
            </Table>
          </div>
        ) : error ? (
          <div className="text-center py-8 text-red-500">Error loading courses</div>
        ) : (
          <div className="bg-white shadow-sm rounded-lg border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[80px]">Image</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="w-[150px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {courses.length > 0 ? (
                  courses.map((course) => (
                    <TableRow key={course.id}>
                      <TableCell>
                        {course.thumbnail ? (
                          <img 
                            src={course.thumbnail}
                            alt={course.title}
                            className="h-12 w-12 object-cover rounded-sm"
                          />
                        ) : (
                          <div className="h-12 w-12 bg-gray-200 rounded-sm flex items-center justify-center text-xs text-gray-500">
                            No img
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="font-medium">{course.title}</TableCell>
                      <TableCell className="truncate max-w-xs">{course.description}</TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button 
                            variant="outline" 
                            size="icon" 
                            onClick={() => handleEdit(course.id)}
                            title="Edit Course"
                          >
                            <Pencil size={16} />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="icon"
                            onClick={() => handleViewWeeks(course.id)}
                            title="Manage Weeks"
                          >
                            <Layers size={16} />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="icon"
                            onClick={() => handleDelete(course.id)}
                            title="Delete Course"
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
                      No courses found. Click "Add New Course" to create one.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminCourses;
