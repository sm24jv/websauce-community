
import React from "react";
import { useParams, Link, Navigate } from "react-router-dom";
import { getChapter, getCourse, mockWeeks } from "@/lib/data";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { ChevronLeft, Download } from "lucide-react";

const ChapterDetails: React.FC = () => {
  const { courseId, weekId, chapterId } = useParams<{ 
    courseId: string; 
    weekId: string;
    chapterId: string;
  }>();
  
  if (!courseId || !weekId || !chapterId) {
    return <Navigate to="/" />;
  }

  const course = getCourse(courseId);
  const week = mockWeeks.find(w => w.id === weekId);
  const chapter = getChapter(chapterId);
  
  if (!course || !week || !chapter) {
    return <Navigate to={`/courses/${courseId}/weeks/${weekId}`} />;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="mb-4 flex flex-wrap gap-2">
          <Link to={`/courses/${courseId}/weeks/${weekId}`} className="inline-flex items-center text-websauce-600 hover:text-websauce-700">
            <ChevronLeft size={16} className="mr-1" />
            <span>Back to Week</span>
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          <div className="aspect-video">
            <iframe 
              src={chapter.video_url}
              className="w-full h-full"
              frameBorder="0"
              allow="autoplay; fullscreen; picture-in-picture"
              allowFullScreen
              title={chapter.title}
            ></iframe>
          </div>
          
          <div className="p-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">{chapter.title}</h1>
            
            <div className="mt-6 prose max-w-none">
              <p>{chapter.description}</p>
            </div>
            
            {chapter.pdf_url && (
              <div className="mt-8">
                <a 
                  href={chapter.pdf_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-block"
                >
                  <Button className="flex items-center gap-2">
                    <Download size={16} />
                    <span>Download Resources</span>
                  </Button>
                </a>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default ChapterDetails;
