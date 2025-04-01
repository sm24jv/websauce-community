import { Course, Week, Chapter, User, UserRole, UserStatus } from "@/types";
import { mockCourses, mockWeeks, mockChapters } from "./mockData";

// Course-related functions
export const getCourses = async (): Promise<Course[]> => {
  console.log("Fetching courses");
  try {
    // TODO: Implement Firebase fetch courses
    return mockCourses;
  } catch (error) {
    console.error("Unexpected error fetching courses:", error);
    return mockCourses;
  }
};

export const getCourse = async (id: string): Promise<Course | null> => {
  console.log("Fetching course:", id);
  if (!id) {
    console.warn("getCourse called without an id");
    return null;
  }
  
  try {
    // TODO: Implement Firebase fetch course
    return mockCourses.find(c => c.id === id) || null;
  } catch (error) {
    console.error("Unexpected error fetching course:", error);
    return mockCourses.find(c => c.id === id) || null;
  }
};

export const createCourse = async (course: Omit<Course, 'id'>): Promise<Course | null> => {
  try {
    // TODO: Implement Firebase create course
    return null;
  } catch (error) {
    console.error("Unexpected error creating course:", error);
    return null;
  }
};

export const updateCourse = async (id: string, course: Partial<Course>): Promise<Course | null> => {
  try {
    // TODO: Implement Firebase update course
    return null;
  } catch (error) {
    console.error("Unexpected error updating course:", error);
    return null;
  }
};

export const deleteCourse = async (id: string): Promise<boolean> => {
  try {
    // TODO: Implement Firebase delete course
    return false;
  } catch (error) {
    console.error("Unexpected error deleting course:", error);
    return false;
  }
};

// Week-related functions
export const getWeeksForCourse = async (courseId: string): Promise<Week[]> => {
  console.log("Fetching weeks for course:", courseId);
  if (!courseId) {
    console.warn("getWeeksForCourse called without a courseId");
    return [];
  }
  
  try {
    // TODO: Implement Firebase fetch weeks
    return mockWeeks.filter(w => w.course_id === courseId);
  } catch (error) {
    console.error("Unexpected error fetching weeks:", error);
    return mockWeeks.filter(w => w.course_id === courseId);
  }
};

export const getWeek = async (id: string): Promise<Week | null> => {
  console.log("Fetching week:", id);
  if (!id) {
    console.warn("getWeek called without an id");
    return null;
  }
  
  try {
    // TODO: Implement Firebase fetch week
    return mockWeeks.find(w => w.id === id) || null;
  } catch (error) {
    console.error("Unexpected error fetching week:", error);
    return mockWeeks.find(w => w.id === id) || null;
  }
};

export const createWeek = async (week: Omit<Week, 'id'>): Promise<Week | null> => {
  try {
    // TODO: Implement Firebase create week
    return null;
  } catch (error) {
    console.error("Unexpected error creating week:", error);
    return null;
  }
};

export const updateWeek = async (id: string, week: Partial<Week>): Promise<Week | null> => {
  try {
    // TODO: Implement Firebase update week
    return null;
  } catch (error) {
    console.error("Unexpected error updating week:", error);
    return null;
  }
};

export const deleteWeek = async (id: string): Promise<boolean> => {
  try {
    // TODO: Implement Firebase delete week
    return false;
  } catch (error) {
    console.error("Unexpected error deleting week:", error);
    return false;
  }
};

// Chapter-related functions
export const getChaptersForWeek = async (weekId: string): Promise<Chapter[]> => {
  try {
    // TODO: Implement Firebase fetch chapters
    return mockChapters.filter(c => c.week_id === weekId);
  } catch (error) {
    console.error("Unexpected error fetching chapters:", error);
    return mockChapters.filter(c => c.week_id === weekId);
  }
};

export const getChapter = async (id: string): Promise<Chapter | null> => {
  try {
    // TODO: Implement Firebase fetch chapter
    return mockChapters.find(c => c.id === id) || null;
  } catch (error) {
    console.error("Unexpected error fetching chapter:", error);
    return mockChapters.find(c => c.id === id) || null;
  }
};

export const createChapter = async (chapter: Omit<Chapter, 'id'>): Promise<Chapter | null> => {
  try {
    // TODO: Implement Firebase create chapter
    return null;
  } catch (error) {
    console.error("Unexpected error creating chapter:", error);
    return null;
  }
};

export const updateChapter = async (id: string, chapter: Partial<Chapter>): Promise<Chapter | null> => {
  try {
    // TODO: Implement Firebase update chapter
    return null;
  } catch (error) {
    console.error("Unexpected error updating chapter:", error);
    return null;
  }
};

export const deleteChapter = async (id: string): Promise<boolean> => {
  try {
    // TODO: Implement Firebase delete chapter
    return false;
  } catch (error) {
    console.error("Unexpected error deleting chapter:", error);
    return false;
  }
};

// User-related functions
export const getUsers = async (): Promise<User[]> => {
  try {
    // TODO: Implement Firebase fetch users
    return [];
  } catch (error) {
    console.error("Unexpected error fetching users:", error);
    return [];
  }
};

export const getUser = async (id: string): Promise<User | null> => {
  try {
    // TODO: Implement Firebase fetch user
    return null;
  } catch (error) {
    console.error("Unexpected error fetching user:", error);
    return null;
  }
};

export const updateUser = async (id: string, userData: Partial<User>): Promise<User | null> => {
  try {
    // TODO: Implement Firebase update user
    return null;
  } catch (error) {
    console.error("Unexpected error updating user:", error);
    return null;
  }
};

export const deleteUser = async (id: string): Promise<boolean> => {
  try {
    // TODO: Implement Firebase delete user
    return false;
  } catch (error) {
    console.error("Unexpected error deleting user:", error);
    return false;
  }
};

// Helper functions
export const getAvailableWeeks = async (courseId: string, startDate: string): Promise<Week[]> => {
  try {
    // TODO: Implement Firebase fetch available weeks
    return [];
  } catch (error) {
    console.error("Unexpected error fetching available weeks:", error);
    return [];
  }
};

// Export mock data for development
export { mockWeeks, mockChapters } from "./mockData";
