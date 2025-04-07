import { Course, Week, Chapter, User, PlatformSettings } from "@/types";
import { FirebaseUtils } from "@/integrations/firebase";

// Define collection names for consistency
const COLLECTIONS = {
  USERS: 'users',
  COURSES: 'courses',
  WEEKS: 'weeks',
  CHAPTERS: 'chapters',
  SETTINGS: 'settings'
};

// Define a constant for the settings document ID
const PLATFORM_SETTINGS_DOC_ID = 'platform';

// --- Platform Settings Functions --- //

export const getPlatformSettings = async (): Promise<PlatformSettings | null> => {
  try {
    console.log("Fetching platform settings from Firestore");
    const settingsDoc = await FirebaseUtils.getDocument<PlatformSettings>(COLLECTIONS.SETTINGS, PLATFORM_SETTINGS_DOC_ID);
    
    return settingsDoc;

  } catch (error) {
    console.error("Error fetching platform settings:", error);
    return null; // Return null on error
  }
};

export const updatePlatformSettings = async (settingsData: Partial<Omit<PlatformSettings, 'createdAt' | 'updatedAt'>>): Promise<boolean> => {
  try {
    console.log("Updating platform settings in Firestore", settingsData);
    await FirebaseUtils.updateDocument(COLLECTIONS.SETTINGS, PLATFORM_SETTINGS_DOC_ID, settingsData);
    return true;
  } catch (error) {
    console.error("Error updating platform settings:", error);
    try {
       console.log("Update failed, attempting to create/set platform settings document...");
       await FirebaseUtils.createDocumentWithId(COLLECTIONS.SETTINGS, PLATFORM_SETTINGS_DOC_ID, settingsData);
       console.log("Platform settings document created/set successfully.");
       return true;
    } catch (setError) {
       console.error("Error creating/setting platform settings document after update failed:", setError);
       return false;
    }
  }
};

// --- Course Functions --- //

export const getCourses = async (): Promise<Course[]> => {
  try {
    console.log("Fetching courses from Firestore");
    const courses = await FirebaseUtils.getCollection(COLLECTIONS.COURSES);
    // TODO: Add ordering if needed, e.g., by title or createdAt
    return courses as Course[];
  } catch (error) {
    console.error("Error fetching courses:", error);
    return []; // Return empty array on error
  }
};

export const getCourse = async (id: string): Promise<Course | null> => {
  if (!id) return null;
  try {
    console.log(`Fetching course ${id} from Firestore`);
    const course = await FirebaseUtils.getDocument(COLLECTIONS.COURSES, id);
    return course as Course | null;
  } catch (error) {
    console.error(`Error fetching course ${id}:`, error);
    return null;
  }
};

export const createCourse = async (courseData: Omit<Course, 'id' | 'createdAt' | 'updatedAt'>): Promise<Course | null> => {
  try {
    console.log("Creating course in Firestore", courseData);
    const docId = await FirebaseUtils.createDocument(COLLECTIONS.COURSES, courseData);
    const newCourse = await getCourse(docId);
    return newCourse;
  } catch (error) {
    console.error("Error creating course:", error);
    return null;
  }
};

export const updateCourse = async (id: string, courseData: Partial<Omit<Course, 'id' | 'createdAt' | 'updatedAt'>>): Promise<Course | null> => {
  if (!id) return null;
  try {
    console.log(`Updating course ${id} in Firestore`, courseData);
    await FirebaseUtils.updateDocument(COLLECTIONS.COURSES, id, courseData);
    const updatedCourse = await getCourse(id);
    return updatedCourse;
  } catch (error) {
    console.error(`Error updating course ${id}:`, error);
    return null;
  }
};

export const deleteCourse = async (id: string): Promise<boolean> => {
  if (!id) return false;
  try {
    console.log(`Deleting course ${id} from Firestore`);
    // TODO: Consider deleting associated weeks and chapters (cascade delete)
    await FirebaseUtils.deleteDocument(COLLECTIONS.COURSES, id);
    return true;
  } catch (error) {
    console.error(`Error deleting course ${id}:`, error);
    return false;
  }
};

// --- Week Functions --- //

export const getWeeksForCourse = async (courseId: string): Promise<Week[]> => {
  if (!courseId) return [];
  try {
    console.log(`Fetching weeks for course ${courseId} from Firestore`);
    const weeks = await FirebaseUtils.queryCollection(COLLECTIONS.WEEKS, 'course_id', courseId);
    // TODO: Add ordering by week_number
    // weeks.sort((a, b) => a.week_number - b.week_number);
    return weeks as Week[];
  } catch (error) {
    console.error(`Error fetching weeks for course ${courseId}:`, error);
    return [];
  }
};

export const getWeek = async (id: string): Promise<Week | null> => {
  if (!id) return null;
  try {
    console.log(`Fetching week ${id} from Firestore`);
    const week = await FirebaseUtils.getDocument(COLLECTIONS.WEEKS, id);
    return week as Week | null;
  } catch (error) {
    console.error(`Error fetching week ${id}:`, error);
    return null;
  }
};

export const createWeek = async (weekData: Omit<Week, 'id' | 'createdAt' | 'updatedAt'>): Promise<Week | null> => {
  try {
    console.log("Creating week in Firestore", weekData);
    const docId = await FirebaseUtils.createDocument(COLLECTIONS.WEEKS, weekData);
    const newWeek = await getWeek(docId);
    return newWeek;
  } catch (error) {
    console.error("Error creating week:", error);
    return null;
  }
};

export const updateWeek = async (id: string, weekData: Partial<Omit<Week, 'id' | 'createdAt' | 'updatedAt'>>): Promise<Week | null> => {
  if (!id) return null;
  try {
    console.log(`Updating week ${id} in Firestore`, weekData);
    await FirebaseUtils.updateDocument(COLLECTIONS.WEEKS, id, weekData);
    const updatedWeek = await getWeek(id);
    return updatedWeek;
  } catch (error) {
    console.error(`Error updating week ${id}:`, error);
    return null;
  }
};

export const deleteWeek = async (id: string): Promise<boolean> => {
  if (!id) return false;
  try {
    console.log(`Deleting week ${id} from Firestore`);
    // TODO: Consider deleting associated chapters (cascade delete)
    await FirebaseUtils.deleteDocument(COLLECTIONS.WEEKS, id);
    return true;
  } catch (error) {
    console.error(`Error deleting week ${id}:`, error);
    return false;
  }
};

// --- Chapter Functions --- //

export const getChaptersForWeek = async (weekId: string): Promise<Chapter[]> => {
  if (!weekId) return [];
  try {
    console.log(`Fetching chapters for week ${weekId} from Firestore`);
    const chapters = await FirebaseUtils.queryCollection(COLLECTIONS.CHAPTERS, 'week_id', weekId);
    // TODO: Add ordering if needed, e.g., by title or a specific order field
    return chapters as Chapter[];
  } catch (error) {
    console.error(`Error fetching chapters for week ${weekId}:`, error);
    return [];
  }
};

export const getChapter = async (id: string): Promise<Chapter | null> => {
  if (!id) return null;
  try {
    console.log(`Fetching chapter ${id} from Firestore`);
    const chapter = await FirebaseUtils.getDocument(COLLECTIONS.CHAPTERS, id);
    return chapter as Chapter | null;
  } catch (error) {
    console.error(`Error fetching chapter ${id}:`, error);
    return null;
  }
};

export const createChapter = async (chapterData: Omit<Chapter, 'id' | 'createdAt' | 'updatedAt'>): Promise<Chapter | null> => {
  try {
    console.log("Creating chapter in Firestore", chapterData);
    const docId = await FirebaseUtils.createDocument(COLLECTIONS.CHAPTERS, chapterData);
    const newChapter = await getChapter(docId);
    return newChapter;
  } catch (error) {
    console.error("Error creating chapter:", error);
    return null;
  }
};

export const updateChapter = async (id: string, chapterData: Partial<Omit<Chapter, 'id' | 'createdAt' | 'updatedAt'>>): Promise<Chapter | null> => {
  if (!id) return null;
  try {
    console.log(`Updating chapter ${id} in Firestore`, chapterData);
    await FirebaseUtils.updateDocument(COLLECTIONS.CHAPTERS, id, chapterData);
    const updatedChapter = await getChapter(id);
    return updatedChapter;
  } catch (error) {
    console.error(`Error updating chapter ${id}:`, error);
    return null;
  }
};

export const deleteChapter = async (id: string): Promise<boolean> => {
  if (!id) return false;
  try {
    console.log(`Deleting chapter ${id} from Firestore`);
    await FirebaseUtils.deleteDocument(COLLECTIONS.CHAPTERS, id);
    return true;
  } catch (error) {
    console.error(`Error deleting chapter ${id}:`, error);
    return false;
  }
};

// --- User Functions (Profile Data) --- //

// Note: User creation is handled in auth.ts to link Auth and Firestore

export const getUsers = async (): Promise<User[]> => {
  try {
    console.log("Fetching users from Firestore");
    const users = await FirebaseUtils.getCollection(COLLECTIONS.USERS);
    return users as User[];
  } catch (error) {
    console.error("Error fetching users:", error);
    return [];
  }
};

export const getUser = async (id: string): Promise<User | null> => {
  // getUserProfile from FirebaseUtils already handles this
  if (!id) return null;
  try {
    console.log(`Fetching user profile ${id} from Firestore`);
    const user = await FirebaseUtils.getUserProfile(id);
    return user; // Already correctly typed
  } catch (error) {
    console.error(`Error fetching user profile ${id}:`, error);
    return null;
  }
};

export const updateUser = async (id: string, userData: Partial<Omit<User, 'id' | 'createdAt' | 'updatedAt'>>): Promise<User | null> => {
  // updateUserProfile from FirebaseUtils handles this
  if (!id) return null;
  try {
    console.log(`Updating user profile ${id} in Firestore`, userData);
    await FirebaseUtils.updateUserProfile(id, userData);
    const updatedUser = await getUser(id);
    return updatedUser;
  } catch (error) {
    console.error(`Error updating user profile ${id}:`, error);
    return null;
  }
};

export const deleteUser = async (id: string): Promise<boolean> => {
  // Deleting a user should involve more: deleting Auth user, maybe anonymizing data.
  // For now, just deleting the Firestore profile document.
  // Consider marking as deleted instead.
  if (!id) return false;
  try {
    console.warn(`Attempting to delete user profile ${id} from Firestore. Auth user is NOT deleted.`);
    await FirebaseUtils.deleteDocument(COLLECTIONS.USERS, id);
    // TODO: Implement Firebase Auth user deletion (requires Admin SDK or re-authentication)
    return true;
  } catch (error) {
    console.error(`Error deleting user profile ${id}:`, error);
    return false;
  }
};

// --- Helper Functions --- //

// Example: Get available weeks based on membership start date
// Needs adaptation for Firestore timestamps if start_date is stored differently.
export const getAvailableWeeks = async (courseId: string, userStartDate: string): Promise<Week[]> => {
  if (!courseId || !userStartDate) return [];
  try {
    const membershipStart = new Date(userStartDate);
    const today = new Date();
    const daysSinceMembership = Math.floor((today.getTime() - membershipStart.getTime()) / (1000 * 60 * 60 * 24));
    const availableWeekCount = Math.max(0, Math.floor(daysSinceMembership / 7) + 1);

    console.log(`Fetching available weeks for course ${courseId}, up to week ${availableWeekCount}`);

    const allWeeks = await getWeeksForCourse(courseId);
    // Assumes weeks are fetched and sorted by week_number elsewhere or here
    // Example sorting (if not handled by query):
    allWeeks.sort((a, b) => a.week_number - b.week_number);

    return allWeeks.filter(week => week.week_number <= availableWeekCount);

  } catch (error) {
    console.error("Error fetching available weeks:", error);
    return [];
  }
};

// Removed mock data exports as we are now using Firestore
// export { mockWeeks, mockChapters } from "./mockData";
