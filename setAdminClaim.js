// setAdminClaim.cjs
const admin = require('firebase-admin');

// --- Configuration ---
// Path to your downloaded service account key JSON file
const serviceAccount = require('./serviceAccountKey.json'); // Make sure this path is correct!
// The UID of the user you want to make an admin
const uid = 'wIMr2zk3BbT9TgrziMeR2P7KvRH2'; // The UID you provided
// ---------------------

// Initialize the Firebase Admin SDK
try {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
  console.log('Firebase Admin SDK Initialized.');
} catch (error) {
  console.error('Error initializing Firebase Admin SDK:', error);
  process.exit(1); // Exit if initialization fails
}


// Set the custom claim { admin: true } for the specified user
console.log(`Attempting to set admin claim for UID: ${uid}`);
admin.auth().setCustomUserClaims(uid, { admin: true })
  .then(() => {
    console.log(`✅ Successfully set custom claim { admin: true } for user ${uid}`);
    console.log('ℹ️  The user must log out and log back in for the claim to take effect in their ID token.');
    process.exit(0); // Exit successfully
  })
  .catch(error => {
    console.error(`❌ Error setting custom claim for user ${uid}:`, error);
    process.exit(1); // Exit with error
  }); 