const admin = require('firebase-admin');

// Path to your service account key JSON file
const serviceAccount = require('./serviceAccountKey.json');

// Initialize the Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

// Log the project ID to verify
if (admin.instanceId) { // instanceId is a way to check if initialized
  try {
    console.log('Attempting to connect to Firebase project ID:', admin.app().options.projectId);
  } catch (e) {
    console.error('Could not retrieve project ID from admin.app().options:', e);
  }
} else {
  console.error('Firebase Admin SDK not initialized properly.');
}

// UID of the user to make an admin (replace with the actual UID)
const uid = 'wIMr2zk3BbT9TgrziMeR2P7KvRH2'; // MAKE SURE TO REPLACE THIS
const newRole = 'admin';

async function setAdminClaim() {
  if (uid === 'YOUR_USER_UID_HERE' || !uid) {
    console.error('Error: Please replace "YOUR_USER_UID_HERE" with an actual User UID in the script (on line 19 or similar).');
    return;
  }

  try {
    // Set the custom claim
    await admin.auth().setCustomUserClaims(uid, { role: newRole });
    console.log(`Successfully set custom claim for user ${uid}. Role: ${newRole}`);

    // To verify, get the user and check their claims
    const userRecord = await admin.auth().getUser(uid);
    console.log('User claims:', userRecord.customClaims);
  } catch (error) {
    console.error('Error setting custom claims:', error);
  }
}

setAdminClaim().then(() => process.exit(0)).catch(() => process.exit(1)); 