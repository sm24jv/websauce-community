# Websauce Community

A private learning community platform for structured video-based courses.

## Tech Stack

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS
- React Router
- React Query
- Firebase (for authentication and data storage)

## Getting Started

Follow these steps to set up the project locally:

```sh
# Clone the repository
git clone <YOUR_REPO_URL>

# Navigate to the project directory
cd websauce-community

# Install dependencies
npm install

# Start the development server
npm run dev
```

## Firebase Setup

1. Create a Firebase project at [https://console.firebase.google.com/](https://console.firebase.google.com/)
2. Enable Authentication with Email/Password provider
3. Create a Firestore database in your preferred region
4. Register a web app in your Firebase project
5. Copy the Firebase configuration from the Firebase console
6. Create a `.env` file in the root directory based on `.env.example`
7. Fill in your Firebase configuration values in the `.env` file

```
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your-messaging-sender-id
VITE_FIREBASE_APP_ID=your-app-id
```

## Project Structure

- `/src/components` - UI components
- `/src/contexts` - React contexts for state management
- `/src/hooks` - Custom React hooks
- `/src/integrations` - Third-party integrations (Firebase)
- `/src/lib` - Utility functions and API calls
- `/src/pages` - Page components
- `/src/types` - TypeScript type definitions

## Building for Production

```sh
# Build the application
npm run build

# Preview the production build
npm run preview
```
