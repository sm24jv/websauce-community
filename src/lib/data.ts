
import { supabase } from "@/integrations/supabase/client";
import { Course, Week, Chapter, User } from "@/types";

// Course-related functions
export const getCourses = async (): Promise<Course[]> => {
  const { data, error } = await supabase
    .from('courses')
    .select('*')
    .order('title');
  
  if (error) {
    console.error("Error fetching courses:", error);
    return [];
  }
  
  return data || [];
};

export const getCourse = async (id: string): Promise<Course | null> => {
  const { data, error } = await supabase
    .from('courses')
    .select('*')
    .eq('id', id)
    .single();
  
  if (error) {
    console.error("Error fetching course:", error);
    return null;
  }
  
  return data;
};

export const createCourse = async (course: Omit<Course, 'id'>): Promise<Course | null> => {
  const { data, error } = await supabase
    .from('courses')
    .insert([course])
    .select()
    .single();
  
  if (error) {
    console.error("Error creating course:", error);
    return null;
  }
  
  return data;
};

export const updateCourse = async (id: string, course: Partial<Course>): Promise<Course | null> => {
  const { data, error } = await supabase
    .from('courses')
    .update(course)
    .eq('id', id)
    .select()
    .single();
  
  if (error) {
    console.error("Error updating course:", error);
    return null;
  }
  
  return data;
};

export const deleteCourse = async (id: string): Promise<boolean> => {
  const { error } = await supabase
    .from('courses')
    .delete()
    .eq('id', id);
  
  if (error) {
    console.error("Error deleting course:", error);
    return false;
  }
  
  return true;
};

// Week-related functions
export const getWeeksForCourse = async (courseId: string): Promise<Week[]> => {
  const { data, error } = await supabase
    .from('weeks')
    .select('*')
    .eq('course_id', courseId)
    .order('index');
  
  if (error) {
    console.error("Error fetching weeks:", error);
    return [];
  }
  
  return data || [];
};

export const getWeek = async (id: string): Promise<Week | null> => {
  const { data, error } = await supabase
    .from('weeks')
    .select('*')
    .eq('id', id)
    .single();
  
  if (error) {
    console.error("Error fetching week:", error);
    return null;
  }
  
  return data;
};

export const createWeek = async (week: Omit<Week, 'id'>): Promise<Week | null> => {
  const { data, error } = await supabase
    .from('weeks')
    .insert([week])
    .select()
    .single();
  
  if (error) {
    console.error("Error creating week:", error);
    return null;
  }
  
  return data;
};

export const updateWeek = async (id: string, week: Partial<Week>): Promise<Week | null> => {
  const { data, error } = await supabase
    .from('weeks')
    .update(week)
    .eq('id', id)
    .select()
    .single();
  
  if (error) {
    console.error("Error updating week:", error);
    return null;
  }
  
  return data;
};

export const deleteWeek = async (id: string): Promise<boolean> => {
  const { error } = await supabase
    .from('weeks')
    .delete()
    .eq('id', id);
  
  if (error) {
    console.error("Error deleting week:", error);
    return false;
  }
  
  return true;
};

// Chapter-related functions
export const getChaptersForWeek = async (weekId: string): Promise<Chapter[]> => {
  const { data, error } = await supabase
    .from('chapters')
    .select('*')
    .eq('week_id', weekId)
    .order('title');
  
  if (error) {
    console.error("Error fetching chapters:", error);
    return [];
  }
  
  return data || [];
};

export const getChapter = async (id: string): Promise<Chapter | null> => {
  const { data, error } = await supabase
    .from('chapters')
    .select('*')
    .eq('id', id)
    .single();
  
  if (error) {
    console.error("Error fetching chapter:", error);
    return null;
  }
  
  return data;
};

export const createChapter = async (chapter: Omit<Chapter, 'id'>): Promise<Chapter | null> => {
  const { data, error } = await supabase
    .from('chapters')
    .insert([chapter])
    .select()
    .single();
  
  if (error) {
    console.error("Error creating chapter:", error);
    return null;
  }
  
  return data;
};

export const updateChapter = async (id: string, chapter: Partial<Chapter>): Promise<Chapter | null> => {
  const { data, error } = await supabase
    .from('chapters')
    .update(chapter)
    .eq('id', id)
    .select()
    .single();
  
  if (error) {
    console.error("Error updating chapter:", error);
    return null;
  }
  
  return data;
};

export const deleteChapter = async (id: string): Promise<boolean> => {
  const { error } = await supabase
    .from('chapters')
    .delete()
    .eq('id', id);
  
  if (error) {
    console.error("Error deleting chapter:", error);
    return false;
  }
  
  return true;
};

// User-related functions
export const getUsers = async (): Promise<User[]> => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .order('email');
  
  if (error) {
    console.error("Error fetching users:", error);
    return [];
  }
  
  return data || [];
};

export const getUser = async (id: string): Promise<User | null> => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', id)
    .single();
  
  if (error) {
    console.error("Error fetching user:", error);
    return null;
  }
  
  return data;
};

export const createUser = async (email: string, password: string, userData: Omit<User, 'id' | 'email'>): Promise<User | null> => {
  try {
    // Create user in auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        role: userData.role,
        status: userData.status,
        start_date: userData.start_date,
        end_date: userData.end_date
      }
    });

    if (authError || !authData.user) {
      console.error("Error creating user in auth:", authError);
      return null;
    }

    // The profile should be created automatically by the trigger
    // We'll just fetch it to confirm and return
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', authData.user.id)
      .single();

    if (profileError) {
      console.error("Error fetching created user profile:", profileError);
      return null;
    }

    return profile;
  } catch (error) {
    console.error("Error in createUser:", error);
    return null;
  }
};

export const updateUser = async (id: string, userData: Partial<User>): Promise<User | null> => {
  const { data, error } = await supabase
    .from('profiles')
    .update(userData)
    .eq('id', id)
    .select()
    .single();
  
  if (error) {
    console.error("Error updating user:", error);
    return null;
  }
  
  return data;
};

export const deleteUser = async (id: string): Promise<boolean> => {
  // In a real app, you might want to just set status to 'deleted' 
  // instead of actually deleting the user
  try {
    const { error } = await supabase.auth.admin.deleteUser(id);
    
    if (error) {
      console.error("Error deleting user:", error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error("Error in deleteUser:", error);
    return false;
  }
};

// Helper function to get available weeks based on membership start date
export const getAvailableWeeks = async (courseId: string, startDate: string): Promise<Week[]> => {
  const membershipStart = new Date(startDate);
  const today = new Date();
  const daysSinceMembership = Math.floor((today.getTime() - membershipStart.getTime()) / (1000 * 60 * 60 * 24));
  
  // Calculate how many weeks should be available (1 week per 7 days, starting with week 1)
  const availableWeekCount = Math.floor(daysSinceMembership / 7) + 1;
  
  const { data, error } = await supabase
    .from('weeks')
    .select('*')
    .eq('course_id', courseId)
    .lte('index', availableWeekCount)
    .order('index');
  
  if (error) {
    console.error("Error fetching available weeks:", error);
    return [];
  }
  
  return data || [];
};
