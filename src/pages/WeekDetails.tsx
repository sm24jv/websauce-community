import React, { useState, useEffect } from "react";
import { useParams, Link, Navigate } from "react-router-dom";
import { getCourse, getChaptersForWeek, getWeek } from "@/lib/data";
import { Course, Week, Chapter } from "@/types";
import WebsauceHeader from "@/components/WebsauceHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronLeft } from "lucide-react";

const WeekDetails: React.FC = () => {
  const { courseId, weekId } = useParams<{ courseId: string; weekId: string }>();
  
  const [course, setCourse] = useState<Course | null>(null);
  const [week, setWeek] = useState<Week | null>(null);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchData = async () => {
      if (!courseId || !weekId) return;
      
      setLoading(true);
      const [courseData, weekData, chaptersData] = await Promise.all([
        getCourse(courseId),
        getWeek(weekId),
        getChaptersForWeek(weekId)
      ]);
      
      setCourse(courseData);
      setWeek(weekData);
      setChapters(chaptersData);
      setLoading(false);
    };
    
    fetchData();
  }, [courseId, weekId]);
  
  if (!courseId || !weekId) {
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
  
  if (!course || !week) {
    return <Navigate to={`/courses/${courseId}`} />;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <WebsauceHeader />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="mb-4">
          <Link to={`/courses/${courseId}`} className="inline-flex items-center text-websauce-600 hover:text-websauce-700">
            <ChevronLeft size={16} className="mr-1" />
            <span>Back to Course</span>
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="md:w-1/3">
              <div className="rounded-lg overflow-hidden">
                <img 
                  src={week.thumbnail}
                  alt={week.title}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
            
            <div className="md:w-2/3">
              <div className="text-sm font-medium text-websauce-600 mb-1">Week {week.week_number}</div>
              <h1 className="text-3xl font-bold text-gray-900 mb-3">{week.title}</h1>
              <p className="text-gray-600">{week.description}</p>
            </div>
          </div>
        </div>

        <section>
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">Chapters</h2>
          
          <div className="space-y-4">
            {chapters.length > 0 ? (
              chapters.map((chapter, index) => (
                <Link to={`/courses/${courseId}/weeks/${weekId}/chapters/${chapter.id}`} key={chapter.id}>
                  <Card className="border border-gray-200 hover:border-websauce-300 hover:shadow-md transition-all overflow-hidden">
                    <div className="flex items-center p-4">
                      <div className="mr-4 flex-shrink-0 w-12 h-12 rounded-full bg-websauce-100 text-websauce-700 flex items-center justify-center font-bold">
                        {index + 1}
                      </div>
                      <div>
                        <h3 className="font-medium">{chapter.title}</h3>
                        <p className="text-sm text-gray-500 line-clamp-1">{chapter.content ? chapter.content.substring(0, 100) + '...' : 'No description'}</p>
                      </div>
                    </div>
                  </Card>
                </Link>
              ))
            ) : (
              <div className="text-center py-16 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                <p className="text-gray-500">No chapters available for this week.</p>
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
};

export default WeekDetails;
