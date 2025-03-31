
import { Course, Week, Chapter } from "@/types";

// Mock data service (will be replaced with Supabase integration)
export const mockCourses: Course[] = [
  {
    id: "1",
    title: "Web Development Fundamentals",
    thumbnail_url: "https://images.unsplash.com/photo-1517180102446-f3ece451e9d8?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
    description: "Learn the core fundamentals of web development including HTML, CSS, and JavaScript."
  },
  {
    id: "2",
    title: "Advanced React Techniques",
    thumbnail_url: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
    description: "Take your React skills to the next level with advanced patterns and techniques."
  },
  {
    id: "3",
    title: "Backend Development with Node.js",
    thumbnail_url: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
    description: "Build robust backend systems with Node.js, Express, and MongoDB."
  }
];

export const mockWeeks: Week[] = [
  {
    id: "1",
    course_id: "1",
    index: 1,
    title: "Introduction to HTML",
    thumbnail_url: "https://images.unsplash.com/photo-1542831371-29b0f74f9713?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
    short_description: "Learn the basics of HTML tags and document structure."
  },
  {
    id: "2",
    course_id: "1",
    index: 2,
    title: "CSS Styling",
    thumbnail_url: "https://images.unsplash.com/photo-1523437113738-bbd3cc89fb19?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
    short_description: "Master the art of styling web pages with CSS."
  },
  {
    id: "3",
    course_id: "1",
    index: 3,
    title: "JavaScript Basics",
    thumbnail_url: "https://images.unsplash.com/photo-1627398242454-45a1465c2479?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
    short_description: "Introduction to JavaScript programming and DOM manipulation."
  },
  {
    id: "4",
    course_id: "2",
    index: 1,
    title: "React Hooks Deep Dive",
    thumbnail_url: "https://images.unsplash.com/photo-1624377632657-3902bfd35958?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
    short_description: "Master the use of React Hooks for state management and side effects."
  }
];

export const mockChapters: Chapter[] = [
  {
    id: "1",
    week_id: "1",
    title: "HTML Document Structure",
    thumbnail_url: "https://images.unsplash.com/photo-1621839673705-6617adf9e890?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
    video_url: "https://player.vimeo.com/video/76979871",
    description: "Learn about the basic structure of HTML documents, including DOCTYPE, head, and body elements."
  },
  {
    id: "2",
    week_id: "1",
    title: "Working with Text Tags",
    thumbnail_url: "https://images.unsplash.com/photo-1516259762381-22954d7d3ad2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
    video_url: "https://player.vimeo.com/video/76979871",
    description: "Explore various HTML tags for text formatting and organization.",
    pdf_url: "https://www.w3.org/WAI/demos/bad/after/documents/cheatsheet.pdf"
  }
];

// Helper function to get available weeks based on membership start date
export const getAvailableWeeks = (courseId: string, startDate: string): Week[] => {
  const membershipStart = new Date(startDate);
  const today = new Date();
  const daysSinceMembership = Math.floor((today.getTime() - membershipStart.getTime()) / (1000 * 60 * 60 * 24));
  
  // Calculate how many weeks should be available (1 week per 7 days, starting with week 1)
  const availableWeekCount = Math.floor(daysSinceMembership / 7) + 1;
  
  return mockWeeks
    .filter(week => week.course_id === courseId)
    .filter(week => week.index <= availableWeekCount)
    .sort((a, b) => a.index - b.index);
};

export const getCourses = (): Course[] => {
  return [...mockCourses];
};

export const getCourse = (id: string): Course | undefined => {
  return mockCourses.find(course => course.id === id);
};

export const getWeeksForCourse = (courseId: string): Week[] => {
  return mockWeeks.filter(week => week.course_id === courseId).sort((a, b) => a.index - b.index);
};

export const getChaptersForWeek = (weekId: string): Chapter[] => {
  return mockChapters.filter(chapter => chapter.week_id === weekId);
};

export const getChapter = (id: string): Chapter | undefined => {
  return mockChapters.find(chapter => chapter.id === id);
};
