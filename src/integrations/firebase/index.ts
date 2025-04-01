import app, { auth, db } from './firebase';
import * as FirebaseUtils from './utils';

export { 
  app as firebaseApp, 
  auth as firebaseAuth, 
  db as firebaseDb,
  FirebaseUtils 
}; 