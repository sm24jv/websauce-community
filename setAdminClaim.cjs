const admin = require('firebase-admin');
const path = require('path'); // Import path module

// --- Configuration ---
const serviceAccountPath = path.join(__dirname, './serviceAccountKey.json'); // Use path.join for robustness
const uid = 'wIMr2zk3BbT9TgrziMeR2P7KvRH2';
// ---------------------

let serviceAccount;
try {
  console.log(`Attempting to load service account key from: ${serviceAccountPath}`);
  serviceAccount = require(serviceAccountPath);
  console.log('Service account key loaded successfully.');
} catch (error) {
  console.error(`❌ FATAL: Failed to load service account key from ${serviceAccountPath}`);
  console.error('   Please ensure the file exists and is valid JSON.');
  console.error('   Error details:', error);
  process.exit(1);
}

// Initialize the Firebase Admin SDK
try {
  console.log('Attempting to initialize Firebase Admin SDK...');
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
  console.log('Firebase Admin SDK Initialized successfully.');
} catch (error) {
  console.error('❌ FATAL: Error initializing Firebase Admin SDK:', error);
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