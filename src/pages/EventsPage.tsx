import React from 'react';
import WebsauceHeader from "@/components/WebsauceHeader";

const EventsPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <WebsauceHeader />
      <main className="flex-1 container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Events</h1>
        {/* Event listing content will go here */}
        <p className="text-gray-600">Event functionality coming soon...</p>
      </main>
    </div>
  );
};

export default EventsPage; 