
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { getCourses } from "@/lib/data";
import { Course } from "@/types";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import Header from "@/components/Header";
import { CalendarDays } from "lucide-react";

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourses = async () => {
      setLoading(true);
      const fetchedCourses = await getCourses();
      setCourses(fetchedCourses);
      setLoading(false);
    };

    fetchCourses();
  }, []);

  // Calculate days since membership start
  const daysSinceMembership = user ? Math.floor(
    (Date.now() - new Date(user.start_date).getTime()) / (1000 * 60 * 60 * 24)
  ) : 0;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Dashboard</h1>
          <div className="mt-2 flex items-center text-sm text-gray-500">
            <CalendarDays size={16} className="mr-1" />
            <span>Member for {daysSinceMembership} days</span>
          </div>
        </div>

        <section className="mb-10">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">My Courses</h2>
          
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-pulse text-websauce-500">Loading courses...</div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {courses.map((course) => (
                <Link to={`/courses/${course.id}`} key={course.id} className="group">
                  <Card className="course-card h-full transition-all border border-gray-200 hover:border-websauce-300">
                    <div className="aspect-video w-full overflow-hidden rounded-t-lg">
                      <img 
                        src={course.thumbnail_url} 
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
          
          {!loading && courses.length === 0 && (
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
