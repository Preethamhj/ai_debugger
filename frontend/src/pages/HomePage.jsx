import React from 'react';
import { SparklesPreview } from '../components/SparklesPreview.jsx'; 

function HomePage() {
  return (
    // h-full will now fill the entire screen because App.jsx uses h-screen.
    <div className="h-full w-full"> 
      <SparklesPreview />
    </div>
  );
}

export default HomePage;