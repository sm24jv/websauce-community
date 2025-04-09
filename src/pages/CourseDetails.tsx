import React, { useState, useEffect } from "react";
import { useParams, Link, Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { getCourse, getAvailableWeeks } from "@/lib/data";
import { Course, Week } from "@/types";
import WebsauceHeader from "@/components/WebsauceHeader";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, ChevronLeft, Lock } from "lucide-react";

const CourseDetails: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const { user } = useAuth();
  
  const [course, setCourse] = useState<Course | null>(null);
  const [availableWeeks, setAvailableWeeks] = useState<Week[]>([]);
  const [allWeeks, setAllWeeks] = useState<Week[]>([]);
  const [lockedWeeks, setLockedWeeks] = useState<Week[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchData = async () => {
      if (!courseId) return;
      
      setLoading(true);
      const courseData = await getCourse(courseId);
      setCourse(courseData);
      
      if (user) {
        // Fetch all weeks data once, regardless of role
        const allWeeksData = await getAvailableWeeks(courseId, new Date(0).toISOString());
        setAllWeeks(allWeeksData);

        if (user.role === 'admin') {
          // Admin sees all weeks as available
          setAvailableWeeks(allWeeksData);
          setLockedWeeks([]);
        } else {
          // Regular user: filter based on start_date
          const userAvailableWeeks = await getAvailableWeeks(courseId, user.start_date);
          setAvailableWeeks(userAvailableWeeks);
          
          // Calculate locked weeks
          const locked = allWeeksData.filter(
            week => !userAvailableWeeks.some(availableWeek => availableWeek.id === week.id)
          );
          setLockedWeeks(locked);
        }
      } else {
        // Non-logged in user sees no available weeks
        const allWeeksData = await getAvailableWeeks(courseId, new Date(0).toISOString());
        setAllWeeks(allWeeksData);
        setAvailableWeeks([]); // Set available to empty for non-logged-in
        setLockedWeeks(allWeeksData);
      }
      
      setLoading(false);
    };
    
    fetchData();
  }, [courseId, user]);
  
  if (!courseId) {
    return <Navigate to="/" />;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <WebsauceHeader />
        <div className="flex-1 container mx-auto px-4 py-8 flex items-center justify-center">
          <div className="animate-pulse text-websauce-500">Loading...</div>
        </div>
      </div>
    );
  }

  if (!course) {
    return <Navigate to="/" />;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <WebsauceHeader />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="mb-4">
          <Link to="/" className="inline-flex items-center text-websauce-600 hover:text-websauce-700">
            <ChevronLeft size={16} className="mr-1" />
            <span>Back to Dashboard</span>
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="md:w-1/3">
              <div className="rounded-lg overflow-hidden">
                <img 
                  src={course.thumbnail}
                  alt={course.title}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
            
            <div className="md:w-2/3">
              <h1 className="text-3xl font-bold text-gray-900 mb-3">{course.title}</h1>
              <p className="text-gray-600">{course.description}</p>
              
              <div className="mt-4 flex items-center text-sm text-gray-500">
                <Calendar size={16} className="mr-1" />
                <span>{availableWeeks.length} of {allWeeks.length} weeks available</span>
              </div>
            </div>
          </div>
        </div>

        <section>
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">Course Content</h2>
          
          <div className="space-y-6">
            {availableWeeks.length > 0 ? (
              availableWeeks.map((week) => (
                <Link to={`/courses/${courseId}/weeks/${week.id}`} key={week.id}>
                  <Card className="border border-gray-200 hover:border-websauce-300 hover:shadow-md transition-all">
                    <div className="flex flex-col md:flex-row">
                      <div className="md:w-1/4 aspect-video md:aspect-square overflow-hidden rounded-t-lg md:rounded-l-lg md:rounded-tr-none">
                        <img 
                          src={week.thumbnail}
                          alt={week.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="md:w-3/4 flex flex-col">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-xl group-hover:text-websauce-600 transition-colors">
                            Week {week.week_number}: {week.title}
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="flex-grow pb-2">
                          <CardDescription>{week.description}</CardDescription>
                        </CardContent>
                        <CardFooter>
                          <Button variant="ghost" className="text-websauce-600 p-0 hover:text-websauce-700 hover:bg-transparent">
                            View content
                          </Button>
                        </CardFooter>
                      </div>
                    </div>
                  </Card>
                </Link>
              ))
            ) : (
              <div className="text-center py-16 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                <p className="text-gray-500">No content available yet.</p>
              </div>
            )}
            
            {lockedWeeks.length > 0 && (
              <>
                <h3 className="text-xl font-medium text-gray-700 mt-10 mb-4">Coming Soon</h3>
                
                {lockedWeeks.map((week) => (
                  <Card key={week.id} className="border border-gray-200 opacity-70">
                    <div className="flex flex-col md:flex-row">
                      <div className="md:w-1/4 aspect-video md:aspect-square overflow-hidden rounded-t-lg md:rounded-l-lg md:rounded-tr-none bg-gray-200 relative">
                        <img 
                          src={week.thumbnail}
                          alt={week.title}
                          className="w-full h-full object-cover filter grayscale"
                        />
                        <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                          <Lock size={32} className="text-white" />
                        </div>
                      </div>
                      <div className="md:w-3/4 flex flex-col">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-xl text-gray-500">
                            Week {week.week_number}: {week.title}
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="flex-grow pb-2">
                          <CardDescription>{week.description}</CardDescription>
                        </CardContent>
                        <CardFooter>
                          <div className="text-sm text-muted-foreground flex items-center">
                            <Lock size={14} className="mr-1" />
                            <span>Unlocks in {Math.max(0, 7 * (week.week_number - availableWeeks.length))} days</span>
                          </div>
                        </CardFooter>
                      </div>
                    </div>
                  </Card>
                ))}
              </>
            )}
          </div>
        </section>
      </main>
    </div>
  );
};

export default CourseDetails;
