
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Course } from "@/types";
import { getCourses, deleteCourse } from "@/lib/data";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/components/ui/use-toast";
import { Pencil, Trash, Plus, Layers } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";

const AdminCourses: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const { data: courses = [], isLoading, error } = useQuery({
    queryKey: ['courses'],
    queryFn: getCourses
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
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Course Management</h1>
          <Button onClick={() => navigate("/admin/courses/new")} className="flex items-center gap-2">
            <Plus size={16} />
            <span>Add New Course</span>
          </Button>
        </div>
        
        {isLoading ? (
          <div className="text-center py-8">Loading courses...</div>
        ) : error ? (
          <div className="text-center py-8 text-red-500">Error loading courses</div>
        ) : (
          <div className="bg-white shadow-sm rounded-lg border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="w-[150px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {courses.length > 0 ? (
                  courses.map((course) => (
                    <TableRow key={course.id}>
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
                    <TableCell colSpan={3} className="text-center py-6 text-gray-500">
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
