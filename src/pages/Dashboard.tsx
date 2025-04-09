import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { getCourses } from "@/lib/data";
import { Course } from "@/types";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import WebsauceHeader from "@/components/WebsauceHeader";
import { CalendarDays } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";

const Dashboard: React.FC = () => {
  const { user } = useAuth();

  const { data: courses = [], isLoading, error } = useQuery({
    queryKey: ['courses'],
    queryFn: getCourses,
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes
    retry: 3,
    refetchOnWindowFocus: false,
  });

  // Calculate days since membership start
  const daysSinceMembership = user ? Math.floor(
    (Date.now() - new Date(user.start_date).getTime()) / (1000 * 60 * 60 * 24)
  ) : 0;

  if (error) {
    console.error("Error loading courses:", error);
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <WebsauceHeader />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Dashboard</h1>
          {user && (
            <div className="mt-2 flex items-center text-sm text-gray-500">
              <CalendarDays size={16} className="mr-1" />
              <span>Member for {daysSinceMembership} days</span>
            </div>
          )}
        </div>

        <section className="mb-10">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">My Courses</h2>
          
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <Card key={`skeleton-${i}`} className="overflow-hidden">
                  <Skeleton className="h-48 w-full" />
                  <CardHeader className="pb-2">
                    <Skeleton className="h-6 w-3/4" />
                  </CardHeader>
                  <CardContent className="pb-2">
                    <Skeleton className="h-4 w-full mb-2" />
                    <Skeleton className="h-4 w-2/3" />
                  </CardContent>
                  <CardFooter>
                    <Skeleton className="h-4 w-24" />
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-16 bg-red-50 rounded-lg border border-dashed border-red-300">
              <p className="text-red-500">Error loading courses. Please try again later.</p>
              <button 
                onClick={() => window.location.reload()}
                className="mt-4 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                Reload Page
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {courses.map((course) => (
                <Link to={`/courses/${course.id}`} key={course.id} className="group">
                  <Card className="course-card h-full transition-all border border-gray-200 hover:border-websauce-300">
                    <div className="aspect-video w-full overflow-hidden rounded-t-lg">
                      <img 
                        src={course.thumbnail}
                        alt={course.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-xl group-hover:text-websauce-600 transition-colors">
                        {course.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pb-2">
                      <CardDescription>{course.description}</CardDescription>
                    </CardContent>
                    <CardFooter>
                      <div className="text-sm font-medium text-websauce-600">
                        View course
                      </div>
                    </CardFooter>
                  </Card>
                </Link>
              ))}
            </div>
          )}
          
          {!isLoading && !error && courses.length === 0 && (
            <div className="text-center py-16 bg-gray-50 rounded-lg border border-dashed border-gray-300">
              <p className="text-gray-500">No courses available yet.</p>
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default Dashboard;
