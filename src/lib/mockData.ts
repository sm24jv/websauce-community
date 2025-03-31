
import { Course, Week, Chapter } from "@/types";

export const mockWeeks: Week[] = [
  {
    id: "1",
    course_id: "1",
    index: 1,
    title: "Introduction to Web Development",
    thumbnail_url: "https://via.placeholder.com/300x200?text=Week+1",
    short_description: "Learn the basics of HTML, CSS and JavaScript"
  },
  {
    id: "2",
    course_id: "1",
    index: 2,
    title: "Advanced JavaScript",
    thumbnail_url: "https://via.placeholder.com/300x200?text=Week+2",
    short_description: "Deep dive into modern JavaScript features"
  },
  {
    id: "3",
    course_id: "1",
    index: 3,
    title: "React Fundamentals",
    thumbnail_url: "https://via.placeholder.com/300x200?text=Week+3",
    short_description: "Learn the basics of React"
  }
];

export const mockChapters: Chapter[] = [
  {
    id: "1",
    week_id: "1",
    title: "HTML Basics",
    thumbnail_url: "https://via.placeholder.com/300x200?text=HTML+Basics",
    video_url: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    description: "Learn the basics of HTML including tags, attributes and document structure",
    pdf_url: "https://example.com/html-basics.pdf"
  },
  {
    id: "2",
    week_id: "1",
    title: "CSS Fundamentals",
    thumbnail_url: "https://via.placeholder.com/300x200?text=CSS+Fundamentals",
    video_url: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    description: "Learn CSS selectors, properties, and layout techniques",
    pdf_url: "https://example.com/css-fundamentals.pdf"
  }
];

export const mockCourses: Course[] = [
  {
    id: "1",
    title: "Web Development Bootcamp",
    thumbnail_url: "https://via.placeholder.com/400x300?text=Web+Dev+Bootcamp",
    description: "A comprehensive course covering HTML, CSS, JavaScript, and React"
  },
  {
    id: "2",
    title: "Data Science Fundamentals",
    thumbnail_url: "https://via.placeholder.com/400x300?text=Data+Science",
    description: "Learn the basics of data science, statistics, and machine learning"
  }
];
