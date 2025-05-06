/**
 * Import function triggers from their respective submodules:
 *
 * import {onCall} from "firebase-functions/v2/https";
 * import {onDocumentWritten} from "firebase-functions/v2/firestore";
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

// Remove unused v2 imports
// import {onCall, HttpsError} from "firebase-functions/v2/https";
// import {onRequest} from "firebase-functions/v2/https";

// Remove unused specific logger import (functions.logger is used)
// import * as logger from "firebase-functions/logger";

import * as functions from "firebase-functions/v1";
import * as admin from "firebase-admin";

// Start writing functions
// https://firebase.google.com/docs/functions/typescript

// export const helloWorld = onRequest((request, response) => {
//   logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });

// Initialize Firebase Admin SDK. Cloud Functions automatically sets credentials.
admin.initializeApp();

// Define allowed roles for validation
const ALLOWED_ROLES = ["admin", "user"]; 

// Define an interface for the expected data structure
interface SetUserRoleData {
  userId: string;
  role: string | null | undefined;
}

/**
 * HTTPS Callable function to set a user's role via custom claims.
 * - Requires the CALLER to be authenticated.
 * - Requires the CALLER to already have the 'admin' custom claim.
 * - Accepts a target userId and the desired role.
 */
export const setUserRole = functions
  .region('europe-west1') // Use .region() with explicit v1 import
  .https.onCall(async (data: SetUserRoleData, context: functions.https.CallableContext) => { 
  // 1. Check if caller is authenticated
  if (!context.auth) {
    throw new functions.https.HttpsError(
      "unauthenticated",
      "The function must be called while authenticated.",
    );
  }

  // 2. Check if caller is an admin (via custom claims)
  const callerClaims = context.auth.token; // context.auth is checked, so token should exist
  if (callerClaims.role !== "admin") {
    functions.logger.warn(`Non-admin user ${context.auth.uid} attempted to set role.`);
    throw new functions.https.HttpsError(
      "permission-denied",
      "Only administrators can set user roles.",
    );
  }

  // 3. Validate input data
  const targetUserId = data.userId;
  const targetRole = data.role;

  if (typeof targetUserId !== "string" || targetUserId.length === 0) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "The function must be called with a valid 'userId' argument.",
    );
  }
  // Allow setting role to null/undefined to remove it, or validate against allowed roles
  if (targetRole !== null && targetRole !== undefined && !ALLOWED_ROLES.includes(targetRole)) {
     throw new functions.https.HttpsError(
      "invalid-argument",
      `Invalid role specified. Must be one of: ${ALLOWED_ROLES.join(", ")} or null.`, 
    );
  }
  
  // 4. Set custom claim for the target user
  try {
    functions.logger.log(`Admin ${context.auth.uid} setting role '${targetRole || 'none'}' for user ${targetUserId}`);
    // Set the custom claim. If targetRole is null/undefined, it removes the claim.
    await admin.auth().setCustomUserClaims(targetUserId, { role: targetRole }); 
    return { result: `Success! User ${targetUserId} role set to ${targetRole || 'none'}.` };
  } catch (error: unknown) { // Changed type from any to unknown
    functions.logger.error(`Error setting custom claims for user ${targetUserId}:`, error);
    throw new functions.https.HttpsError(
      "internal",
      "Failed to set custom claims.",
      error, 
    );
  }
});

// Define allowed origins for CORS
const allowedOrigins = [
  "http://localhost:8080", // For local development
  "https://academy.websauce.be", // Updated with the correct production app domain
];

export const deleteUserAccount = functions
  .region("europe-west1") // Match the region of your other functions
  .https.onRequest(async (request, response) => {
    // Set CORS headers
    const origin = request.headers.origin as string;
    if (allowedOrigins.includes(origin)) {
      response.set("Access-Control-Allow-Origin", origin);
    }
    response.set("Access-Control-Allow-Methods", "POST, OPTIONS");
    response.set("Access-Control-Allow-Headers", "Content-Type, Authorization");

    if (request.method === "OPTIONS") {
      response.status(204).send("");
      return;
    }

    if (request.method !== "POST") {
      response.status(405).send({ error: "Method Not Allowed" });
      return;
    }

    const authorizationHeader = request.headers.authorization;
    if (!authorizationHeader || !authorizationHeader.startsWith("Bearer ")) {
      functions.logger.warn("Unauthorized attempt to delete user: Missing or malformed Authorization header");
      response.status(401).send({ error: "Unauthorized: Missing or malformed Authorization header." });
      return;
    }

    const idToken = authorizationHeader.split("Bearer ")[1];
    let decodedToken;
    try {
      decodedToken = await admin.auth().verifyIdToken(idToken);
    } catch (error) {
      functions.logger.error("Error verifying ID token:", error);
      response.status(401).send({ error: "Unauthorized: Invalid ID token." });
      return;
    }

    if (decodedToken.role !== "admin") {
      functions.logger.warn(`User ${decodedToken.uid} (not admin) attempted to delete user.`);
      response.status(403).send({ error: "Forbidden: Caller is not an admin." });
      return;
    }

    const { userId: targetUserId } = request.body;
    if (!targetUserId || typeof targetUserId !== "string") {
      functions.logger.warn("Invalid request to delete user: Missing or invalid targetUserId");
      response.status(400).send({ error: "Bad Request: Missing or invalid 'userId' in request body." });
      return;
    }

    try {
      functions.logger.log(`Admin ${decodedToken.uid} attempting to delete user ${targetUserId}`);
      await admin.auth().deleteUser(targetUserId);
      functions.logger.log(`Successfully deleted user ${targetUserId} from Firebase Auth.`);

      const userDocRef = admin.firestore().collection("users").doc(targetUserId);
      await userDocRef.delete();
      functions.logger.log(`Successfully deleted Firestore document for user ${targetUserId}.`);

      response.status(200).send({ message: `User ${targetUserId} and their data deleted successfully.` });
    } catch (error: unknown) { // Changed from any to unknown
      functions.logger.error(`Error deleting user ${targetUserId}:`, error);
      // Check if error is an instance of Error to safely access message property
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
      // Check if error has a code property (common in Firebase errors)
      const errorCode = typeof error === 'object' && error !== null && 'code' in error ? (error as {code: string}).code : undefined;

      if (errorCode === "auth/user-not-found") {
        response.status(404).send({ error: "User not found." });
      } else {
        response.status(500).send({ error: "Internal Server Error: Failed to delete user.", details: errorMessage });
      }
    }
  });

// You can add other Cloud Functions here if needed
