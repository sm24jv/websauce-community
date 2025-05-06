import { Course, Week, Chapter, User, PlatformSettings, MessageCategory, MessagePost, MessageComment } from "@/types";
import { FirebaseUtils } from "@/integrations/firebase";
import { collection, addDoc, serverTimestamp, query, where, orderBy, getDocs, doc, getDoc, runTransaction, increment, updateDoc, writeBatch } from "firebase/firestore";
import { db } from "@/integrations/firebase/firebase";

// Define collection names for consistency
const COLLECTIONS_OBJ = {
  USERS: 'users',
  COURSES: 'courses',
  WEEKS: 'weeks',
  CHAPTERS: 'chapters',
  SETTINGS: 'settings',
  MESSAGE_CATEGORIES: 'message_categories'
};

// Define a constant for the settings document ID
const PLATFORM_SETTINGS_DOC_ID = 'platform';

// --- Platform Settings Functions --- //

export const getPlatformSettings = async (): Promise<PlatformSettings | null> => {
  try {
    console.log("Fetching platform settings from Firestore");
    const settingsDoc = await FirebaseUtils.getDocument<PlatformSettings>(COLLECTIONS_OBJ.SETTINGS, PLATFORM_SETTINGS_DOC_ID);
    
    return settingsDoc;

  } catch (error) {
    console.error("Error fetching platform settings:", error);
    return null; // Return null on error
  }
};

export const updatePlatformSettings = async (settingsData: Partial<Omit<PlatformSettings, 'createdAt' | 'updatedAt'>>): Promise<boolean> => {
  try {
    console.log("Updating platform settings in Firestore", settingsData);
    await FirebaseUtils.updateDocument(COLLECTIONS_OBJ.SETTINGS, PLATFORM_SETTINGS_DOC_ID, settingsData);
    return true;
  } catch (error) {
    console.error("Error updating platform settings:", error);
    try {
       console.log("Update failed, attempting to create/set platform settings document...");
       await FirebaseUtils.createDocumentWithId(COLLECTIONS_OBJ.SETTINGS, PLATFORM_SETTINGS_DOC_ID, settingsData);
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
    const courses = await FirebaseUtils.getCollection(COLLECTIONS_OBJ.COURSES);
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
    const course = await FirebaseUtils.getDocument(COLLECTIONS_OBJ.COURSES, id);
    return course as Course | null;
  } catch (error) {
    console.error(`Error fetching course ${id}:`, error);
    return null;
  }
};

export const createCourse = async (courseData: Omit<Course, 'id' | 'createdAt' | 'updatedAt'>): Promise<Course | null> => {
  try {
    console.log("Creating course in Firestore", courseData);
    const docId = await FirebaseUtils.createDocument(COLLECTIONS_OBJ.COURSES, courseData);
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
    await FirebaseUtils.updateDocument(COLLECTIONS_OBJ.COURSES, id, courseData);
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
    await FirebaseUtils.deleteDocument(COLLECTIONS_OBJ.COURSES, id);
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
    const weeks = await FirebaseUtils.queryCollection(COLLECTIONS_OBJ.WEEKS, 'course_id', courseId);
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
    const week = await FirebaseUtils.getDocument(COLLECTIONS_OBJ.WEEKS, id);
    return week as Week | null;
  } catch (error) {
    console.error(`Error fetching week ${id}:`, error);
    return null;
  }
};

export const createWeek = async (weekData: Omit<Week, 'id' | 'createdAt' | 'updatedAt'>): Promise<Week | null> => {
  try {
    console.log("Creating week in Firestore", weekData);
    const docId = await FirebaseUtils.createDocument(COLLECTIONS_OBJ.WEEKS, weekData);
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
    await FirebaseUtils.updateDocument(COLLECTIONS_OBJ.WEEKS, id, weekData);
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
    await FirebaseUtils.deleteDocument(COLLECTIONS_OBJ.WEEKS, id);
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
    const chapters = await FirebaseUtils.queryCollection(COLLECTIONS_OBJ.CHAPTERS, 'week_id', weekId);
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
    const chapter = await FirebaseUtils.getDocument(COLLECTIONS_OBJ.CHAPTERS, id);
    return chapter as Chapter | null;
  } catch (error) {
    console.error(`Error fetching chapter ${id}:`, error);
    return null;
  }
};

export const createChapter = async (chapterData: Omit<Chapter, 'id' | 'createdAt' | 'updatedAt'>): Promise<Chapter | null> => {
  try {
    console.log("Creating chapter in Firestore", chapterData);
    const docId = await FirebaseUtils.createDocument(COLLECTIONS_OBJ.CHAPTERS, chapterData);
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
    await FirebaseUtils.updateDocument(COLLECTIONS_OBJ.CHAPTERS, id, chapterData);
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
    await FirebaseUtils.deleteDocument(COLLECTIONS_OBJ.CHAPTERS, id);
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
    console.log("Fetching users from Firestore (sorted by createdAt desc)");
    // Call the new function that includes sorting
    const users = await FirebaseUtils.getUsersSortedByCreationDate(); 
    return users as User[];
  } catch (error) {
    console.error("Error fetching sorted users:", error);
    return []; // Return empty array on error
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
    await FirebaseUtils.deleteDocument(COLLECTIONS_OBJ.USERS, id);
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

// --- Message Board Category Functions --- //

export const getMessageCategories = async (): Promise<MessageCategory[]> => {
  try {
    console.log("Fetching message categories from Firestore");
    // Use getCollection and sort client-side for now
    const rawCategories = await FirebaseUtils.getCollection(COLLECTIONS_OBJ.MESSAGE_CATEGORIES);
    // Basic sort in client-side by 'order' field (null/undefined last)
    const sortedCategories = (rawCategories as MessageCategory[]).sort((a, b) => {
      const orderA = a.order === undefined || a.order === null ? Infinity : a.order;
      const orderB = b.order === undefined || b.order === null ? Infinity : b.order;
      return orderA - orderB;
    });
    return sortedCategories;
  } catch (error) {
    console.error("Error fetching message categories:", error);
    return [];
  }
};

export const getMessageCategory = async (id: string): Promise<MessageCategory | null> => {
  if (!id) return null;
  try {
    console.log(`Fetching message category ${id} from Firestore`);
    const category = await FirebaseUtils.getDocument<MessageCategory>(COLLECTIONS_OBJ.MESSAGE_CATEGORIES, id);
    return category;
  } catch (error) {
    console.error(`Error fetching message category ${id}:`, error);
    return null;
  }
};

export const createMessageCategory = async (categoryData: Omit<MessageCategory, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> => {
  try {
    console.log("[data.ts] Attempting to create message category with data:", JSON.stringify(categoryData)); // Log data
    const id = await FirebaseUtils.createDocument(COLLECTIONS_OBJ.MESSAGE_CATEGORIES, categoryData);
    console.log("[data.ts] Message category created successfully with ID:", id);
    return id;
  } catch (error) {
    console.error("[data.ts] Error creating message category:", error); // Log the full error object
    // Try to extract more specific info if available
    if (error instanceof Error) {
        console.error("[data.ts] Error Name:", error.name);
        console.error("[data.ts] Error Message:", error.message);
        console.error("[data.ts] Error Stack:", error.stack);
    }
    if (typeof error === 'object' && error !== null && 'code' in error) {
        console.error("[data.ts] Firestore Error Code:", (error as { code: unknown }).code);
    }
    throw new Error("Failed to create message category."); // Re-throw generic error for UI
  }
};

export const updateMessageCategory = async (id: string, categoryData: Partial<Omit<MessageCategory, 'id' | 'createdAt' | 'updatedAt'>>): Promise<void> => {
  if (!id) throw new Error("Category ID is required for update.");
  try {
    console.log(`Updating message category ${id} in Firestore`, categoryData);
    await FirebaseUtils.updateDocument(COLLECTIONS_OBJ.MESSAGE_CATEGORIES, id, categoryData);
  } catch (error) {
    console.error(`Error updating message category ${id}:`, error);
    throw new Error("Failed to update message category."); // Re-throw for mutation handling
  }
};

export const deleteMessageCategory = async (id: string): Promise<void> => {
  if (!id) throw new Error("Category ID is required for deletion.");
  try {
    console.warn(`Attempting to delete message category ${id} from Firestore.`);
    await FirebaseUtils.deleteDocument(COLLECTIONS_OBJ.MESSAGE_CATEGORIES, id);
  } catch (error) {
    console.error(`Error deleting message category ${id}:`, error);
    throw new Error("Failed to delete message category."); // Re-throw for mutation handling
  }
};

// --- Message Post Functions ---

/**
 * Creates a new message post in Firestore.
 * @param postData - Object containing title, content, categoryId.
 * @param author - Object containing authorId, authorName, authorPhotoURL.
 * @returns The ID of the newly created post or null if an error occurs.
 */
export const createMessagePost = async (
  postData: { title: string; content: string; categoryId: string },
  author: {
    uid: string;
    firstName?: string | null;
    lastName?: string | null;
    photoURL?: string | null;
  }
): Promise<string | null> => {
  if (!author || !author.uid) {
    console.error("Error creating post: Author not provided or missing UID.");
    return null;
  }
  try {
    const postsCollection = collection(db, "message_posts");
    
    let authorFullName = "Anonymous";
    if (author.firstName && author.lastName) {
      authorFullName = `${author.firstName} ${author.lastName}`;
    } else if (author.firstName) {
      authorFullName = author.firstName;
    } else if (author.lastName) { // Less likely, but good to cover
      authorFullName = author.lastName;
    }

    const newPostRef = await addDoc(postsCollection, {
      ...postData,
      authorId: author.uid,
      authorName: authorFullName, // Use the constructed full name
      authorPhotoURL: author.photoURL || null,
      createdAt: serverTimestamp(),
      commentCount: 0, // Initialize commentCount
    });
    console.log("Message post created with ID: ", newPostRef.id);
    return newPostRef.id;
  } catch (error) {
    console.error("Error creating message post: ", error);
    // Consider returning the error object or a more specific error message
    return null;
  }
};

/**
 * Fetches message posts for a specific category from Firestore, ordered by creation date (newest first).
 * If no categoryId is provided, fetches all message posts.
 * @param categoryId The ID of the category to fetch posts for. (Optional)
 * @returns A promise that resolves to an array of MessagePost objects or an empty array if an error occurs or no posts are found.
 */
export const getMessagePostsForCategory = async (categoryId?: string): Promise<MessagePost[]> => {
  try {
    const postsCollection = collection(db, "message_posts");
    let q;

    if (categoryId) {
      console.log(`Fetching posts for category ${categoryId}`);
      // Query for posts matching the categoryId and order by createdAt descending
      q = query(
        postsCollection,
        where("categoryId", "==", categoryId),
        orderBy("createdAt", "desc")
      );
    } else {
      console.log("Fetching all posts");
      // Query for all posts, ordered by createdAt descending
      q = query(
        postsCollection,
        orderBy("createdAt", "desc")
      );
    }

    const querySnapshot = await getDocs(q);
    const posts = querySnapshot.docs.map(doc => {
      const data: Record<string, any> = doc.data();
      return {
        id: doc.id,
        ...data,
      };
    }) as MessagePost[]; // Type assertion after spreading data

    if (categoryId) {
      console.log(`Fetched ${posts.length} posts for category ${categoryId}`);
    } else {
      console.log(`Fetched ${posts.length} total posts`);
    }
    return posts;
  } catch (error) {
    if (categoryId) {
      console.error(`Error fetching posts for category ${categoryId}: `, error);
    } else {
      console.error("Error fetching all posts: ", error);
    }
    return []; // Return empty array on error
  }
};

/**
 * Fetches a single message post by its ID from Firestore.
 * @param postId The ID of the post to fetch.
 * @returns A promise that resolves to the MessagePost object or null if not found or an error occurs.
 */
export const getMessagePostById = async (postId: string): Promise<MessagePost | null> => {
  if (!postId) {
    console.warn("getMessagePostById called without a postId");
    return null;
  }
  try {
    const postDocRef = doc(db, "message_posts", postId);
    const docSnap = await getDoc(postDocRef);

    if (docSnap.exists()) {
      const postData = { id: docSnap.id, ...docSnap.data() } as MessagePost;
      console.log(`Fetched post ${postId}:`, postData);
      return postData;
    } else {
      console.log(`No post found with ID: ${postId}`);
      return null;
    }
  } catch (error) {
    console.error(`Error fetching post ${postId}: `, error);
    return null;
  }
};

/**
 * Updates an existing message post in Firestore.
 * The post author or an admin can update the post.
 * @param postId The ID of the post to update.
 * @param postData Object containing the fields to update (title and content).
 * @param authorId The ID of the current user (for authorization check).
 * @returns A promise that resolves to true if successful, false otherwise.
 */
export const updateMessagePost = async (
  postId: string,
  postData: { title: string; content: string },
  authorId: string
): Promise<boolean> => {
  if (!postId || !authorId) {
    console.error("Error updating post: Post ID and author ID are required.");
    return false;
  }
  try {
    // First check if the post exists
    const postDoc = await getMessagePostById(postId);
    if (!postDoc) {
      console.error(`Post with ID ${postId} not found.`);
      return false;
    }
    
    // Get the user to check if they're an admin
    const userProfile = await FirebaseUtils.getUserProfile(authorId);
    if (!userProfile) {
      console.error(`User ${authorId} not found.`);
      return false;
    }
    
    // Allow update if user is the author or an admin
    if (postDoc.authorId !== authorId && userProfile.role !== 'admin') {
      console.error(`User ${authorId} is not authorized to update post ${postId}.`);
      return false;
    }
    
    // Update the post
    const postRef = doc(db, "message_posts", postId);
    await updateDoc(postRef, {
      ...postData,
      updatedAt: serverTimestamp(),
    });
    
    console.log(`Message post ${postId} updated successfully.`);
    return true;
  } catch (error) {
    console.error(`Error updating message post ${postId}: `, error);
    return false;
  }
};

/**
 * Deletes a message post and all its associated comments from Firestore.
 * Only the post author or an admin can delete a post.
 * @param postId The ID of the post to delete.
 * @param userId The ID of the current user (for authorization check).
 * @returns A promise that resolves to true if successful, false otherwise.
 */
export const deleteMessagePost = async (
  postId: string,
  userId: string
): Promise<boolean> => {
  if (!postId || !userId) {
    console.error("Error deleting post: Post ID and user ID are required.");
    return false;
  }
  
  try {
    // First check if the post exists
    const postDoc = await getMessagePostById(postId);
    if (!postDoc) {
      console.error(`Post with ID ${postId} not found.`);
      return false;
    }
    
    // Get the user to check if they're an admin
    const userProfile = await FirebaseUtils.getUserProfile(userId);
    if (!userProfile) {
      console.error(`User ${userId} not found.`);
      return false;
    }
    
    // Allow deletion if user is the author or an admin
    if (postDoc.authorId !== userId && userProfile.role !== 'admin') {
      console.error(`User ${userId} is not authorized to delete post ${postId}.`);
      return false;
    }
    
    // Get all comments for this post
    const commentsCollection = collection(db, "message_comments");
    const q = query(commentsCollection, where("postId", "==", postId));
    const querySnapshot = await getDocs(q);
    
    // Use a batched write to delete the post and all its comments
    const batch = writeBatch(db);
    
    // Add the post document to the batch
    const postRef = doc(db, "message_posts", postId);
    batch.delete(postRef);
    
    // Add all comment documents to the batch
    querySnapshot.forEach((docSnapshot) => {
      batch.delete(docSnapshot.ref);
    });
    
    // Commit the batched write
    await batch.commit();
    
    console.log(`Message post ${postId} and ${querySnapshot.size} comments deleted successfully.`);
    return true;
  } catch (error) {
    console.error(`Error deleting message post ${postId}: `, error);
    return false;
  }
};

// --- End Message Post Functions ---

// --- Message Comment Functions ---

/**
 * Creates a new message comment in Firestore.
 * @param postId The ID of the post this comment belongs to.
 * @param commentContent The HTML content of the comment.
 * @param author Object containing author's uid, firstName, lastName, and photoURL.
 * @returns The ID of the newly created comment or null if an error occurs.
 */
export const createMessageComment = async (
  postId: string,
  commentContent: string,
  author: {
    uid: string;
    firstName?: string | null;
    lastName?: string | null;
    photoURL?: string | null;
  }
): Promise<string | null> => {
  if (!author || !author.uid) {
    console.error("Error creating comment: Author not provided or missing UID.");
    return null;
  }
  if (!postId) {
    console.error("Error creating comment: Post ID is required.");
    return null;
  }
  if (!commentContent.trim()) {
    console.error("Error creating comment: Content cannot be empty.");
    return null;
  }

  const postRef = doc(db, "message_posts", postId);
  const commentsCollection = collection(db, "message_comments");

  try {
    let authorFullName = "Anonymous";
    if (author.firstName && author.lastName) {
      authorFullName = `${author.firstName} ${author.lastName}`;
    } else if (author.firstName) {
      authorFullName = author.firstName;
    }

    // Run a transaction to create the comment and update the post's commentCount
    const newCommentId = await runTransaction(db, async (transaction) => {
      const postDoc = await transaction.get(postRef);
      if (!postDoc.exists()) {
        throw new Error("Post does not exist!");
      }

      // Create the new comment document within the transaction
      // Firestore automatically generates an ID if we use addDoc logic with a collection ref.
      // For transactions, we need to create a new doc ref first to get an ID.
      const newCommentRef = doc(commentsCollection); // Generate a new ref with an auto ID
      transaction.set(newCommentRef, {
        postId: postId,
        content: commentContent,
        authorId: author.uid,
        authorName: authorFullName,
        authorPhotoURL: author.photoURL || null,
        createdAt: serverTimestamp(), 
      });

      // Increment the commentCount on the post
      transaction.update(postRef, { commentCount: increment(1) });

      return newCommentRef.id;
    });

    console.log("Message comment created with ID: ", newCommentId);
    return newCommentId;
  } catch (error) {
    console.error("Error creating message comment or updating post: ", error);
    return null;
  }
};

/**
 * Fetches comments for a specific message post from Firestore, ordered by creation date (oldest first for typical comment display).
 * @param postId The ID of the post to fetch comments for.
 * @returns A promise that resolves to an array of MessageComment objects or an empty array if an error occurs or no comments are found.
 */
export const getMessageComments = async (postId: string): Promise<MessageComment[]> => {
  if (!postId) {
    console.warn("getMessageComments called without a postId");
    return [];
  }
  try {
    const commentsCollection = collection(db, "message_comments");
    const q = query(
      commentsCollection,
      where("postId", "==", postId),
      orderBy("createdAt", "asc") // Comments usually displayed oldest first
    );
    const querySnapshot = await getDocs(q);
    const comments = querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        // Ensure createdAt is a Timestamp; Firestore SDK should handle this, but good to be aware
        createdAt: data.createdAt, // Assuming data.createdAt is already a Timestamp
      } as MessageComment; 
    });
    
    console.log(`Fetched ${comments.length} comments for post ${postId}`);
    return comments;
  } catch (error) {
    console.error(`Error fetching comments for post ${postId}: `, error);
    return [];
  }
};

/**
 * Updates an existing message comment in Firestore.
 * The comment author or an admin can update the comment.
 * @param commentId The ID of the comment to update.
 * @param content The new HTML content of the comment.
 * @param authorId The ID of the current user (for authorization check).
 * @returns A promise that resolves to true if successful, false otherwise.
 */
export const updateMessageComment = async (
  commentId: string,
  content: string,
  authorId: string
): Promise<boolean> => {
  if (!commentId || !authorId) {
    console.error("Error updating comment: Comment ID and author ID are required.");
    return false;
  }
  try {
    // First check if the comment exists
    const commentRef = doc(db, "message_comments", commentId);
    const commentSnap = await getDoc(commentRef);
    
    if (!commentSnap.exists()) {
      console.error(`Comment with ID ${commentId} not found.`);
      return false;
    }
    
    const commentData = commentSnap.data();
    
    // Get the user to check if they're an admin
    const userProfile = await FirebaseUtils.getUserProfile(authorId);
    if (!userProfile) {
      console.error(`User ${authorId} not found.`);
      return false;
    }
    
    // Allow update if user is the author or an admin
    if (commentData.authorId !== authorId && userProfile.role !== 'admin') {
      console.error(`User ${authorId} is not authorized to update comment ${commentId}.`);
      return false;
    }
    
    // Update the comment
    await updateDoc(commentRef, {
      content: content,
      updatedAt: serverTimestamp(),
    });
    
    console.log(`Message comment ${commentId} updated successfully.`);
    return true;
  } catch (error) {
    console.error(`Error updating message comment ${commentId}: `, error);
    return false;
  }
};

// --- End Message Comment Functions ---

// Removed mock data exports as we are now using Firestore
// export { mockWeeks, mockChapters } from "./mockData";
