/**
 * Import function triggers from their respective submodules:
 *
 * import {onCall} from "firebase-functions/v2/https";
 * import {onDocumentWritten} from "firebase-functions/v2/firestore";
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

// Use onCall from v2/https
import {onCall, HttpsError} from "firebase-functions/v2/https";
// Remove unused v2 onRequest import
// import {onRequest} from "firebase-functions/v2/https";
import * as logger from "firebase-functions/logger";
// Remove unused v1 functions import
// import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

// Start writing functions
// https://firebase.google.com/docs/functions/typescript

// export const helloWorld = onRequest((request, response) => {
//   logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });

// Initialize Firebase Admin SDK (ensure this isn't done elsewhere)
// Check if already initialized to prevent errors during deployment/emulation
if (admin.apps.length === 0) {
  admin.initializeApp();
}

// Define the expected structure of the data passed to the function
interface DeleteUserData {
  userId: string;
}

/**
 * Callable Cloud Function to delete a user account and their Firestore profile.
 * Uses v2 onCall handler.
 *
 * @param request - The request object containing data and auth context.
 * @returns {Promise<{success: boolean, message: string}>}
 */
// Use v2 onCall signature: onCall<RequestData>(handler)
export const deleteUserAccount = onCall<DeleteUserData>(async (request) => {
  // 1. Verify caller is authenticated (request.auth)
  if (!request.auth) {
    // Use HttpsError from v2
    throw new HttpsError(
        "unauthenticated",
        "The function must be called while authenticated.",
    );
  }

  // 2. Verify caller is an admin (using custom claims from request.auth)
  // IMPORTANT: Ensure you are setting an 'admin' custom claim for your admin users
  // using the Admin SDK elsewhere (e.g., upon initial admin creation or promotion).
  const isAdmin = request.auth.token.admin === true;
  if (!isAdmin) {
     throw new HttpsError(
        "permission-denied",
        "Only administrators can delete user accounts.",
    );
  }

  // 3. Validate input data (request.data)
  // Use the defined interface for type safety
  const userIdToDelete = request.data.userId;
  if (typeof userIdToDelete !== 'string' || userIdToDelete.length === 0) {
    throw new HttpsError(
        "invalid-argument",
        "The function must be called with a valid 'userId' string argument.",
    );
  }

  // Prevent admin from deleting themselves (optional safeguard - use request.auth.uid)
  if (userIdToDelete === request.auth.uid) {
      throw new HttpsError(
        "permission-denied",
        "Administrators cannot delete their own account.",
    );
  }

  // Use logger directly
  logger.log(`Admin ${request.auth.uid} attempting to delete user ${userIdToDelete}`);

  try {
    // 4. Delete Firebase Auth user
    logger.log(`Deleting Auth user: ${userIdToDelete}`);
    await admin.auth().deleteUser(userIdToDelete);
    logger.log(`Successfully deleted Auth user: ${userIdToDelete}`);

    // 5. Delete Firestore user profile document
    logger.log(`Deleting Firestore profile: users/${userIdToDelete}`);
    const userDocRef = admin.firestore().collection("users").doc(userIdToDelete);
    await userDocRef.delete();
    logger.log(`Successfully deleted Firestore profile: users/${userIdToDelete}`);

    return { success: true, message: `Successfully deleted user ${userIdToDelete}` };

  } catch (error: unknown) { // Use unknown for safer type handling
    logger.error(`Error deleting user ${userIdToDelete}:`, error);

    // Type check before accessing properties like 'code'
    let errorCode: string | undefined;
    if (typeof error === 'object' && error !== null && 'code' in error) {
      errorCode = (error as { code: string }).code;
    }

    // Handle specific errors if needed (e.g., user not found)
    if (errorCode === 'auth/user-not-found') {
         throw new HttpsError(
            "not-found",
            `User with ID ${userIdToDelete} not found in Firebase Authentication.`,
            error, // Pass the original error object
        );
    }

    // Throw a generic internal error for other issues
    throw new HttpsError(
        "internal",
        `An unexpected error occurred while deleting user ${userIdToDelete}.`,
        error, // Pass the original error object
    );
  }
});
