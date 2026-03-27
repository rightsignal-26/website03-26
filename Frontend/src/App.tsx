// src/App.tsx
import { useState } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';

// Context
import { PostProvider } from './context/PostContext';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import { SocialProvider } from './context/SocialContext';

// Layout Components
import { Sidebar } from './components/layout/Sidebar';
import { BottomNav } from './components/layout/BottomNav';
import { MobileDrawer } from './components/layout/MobileDrawer';
import { RightSidebar } from './components/layout/RightSidebar';
import { PostModal } from './components/shared/PostModal'; // <-- Import the new modal

// Pages
import { Home } from './pages/Home';
import { Profile } from './pages/Profile';
import Notifications from './pages/Notifications';
import { Placeholder } from './pages/PlaceHolder';
import Messages from './pages/Messages';
import HelpCenter from './pages/HelpCenter';
import Settings from './pages/Settings';
import Login from './pages/Login';
import Signup from './pages/Signup';

// Protected Route Component
import { useAuth } from './context/AuthContext';
import { Navigate } from 'react-router-dom';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-dark text-white">Loading...</div>;
  }

  return user ? <>{children}</> : <Navigate to="/login" />;
}

function App() {
  const location = useLocation();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isPostModalOpen, setIsPostModalOpen] = useState(false); // <-- Modal State

  const getHeaderTitle = () => {
    switch (location.pathname) {
      case '/':
        return 'Home';
      case '/messages':
        return 'Messages';
      case '/notifications':
        return 'Notifications';
      case '/profile':
        return 'Profile';
      case '/settings':
        return 'Settings';
      default:
        return 'Community';
    }
  };

  return (
    <AuthProvider>
      <ThemeProvider>
        <SocialProvider>
          <PostProvider>
            <div className="flex min-h-screen bg-dark w-full max-w-7xl mx-auto relative">
        
        {/* Pass the function to open the modal to the Sidebar */}
        <Sidebar onOpenPostModal={() => setIsPostModalOpen(true)} />
        
        <BottomNav />
        <MobileDrawer isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} />
        
        {/* Render the Global Post Modal */}
        <PostModal isOpen={isPostModalOpen} onClose={() => setIsPostModalOpen(false)} />

        <main className="flex-1 sm:ml-20 xl:ml-40 border-r border-gray-800 min-h-screen pb-20 sm:pb-0 overflow-x-hidden">
          
          <header className="sticky top-0 bg-dark/80 backdrop-blur-md border-b border-gray-800 p-4 z-40 flex items-center gap-4">
            <button 
              className="sm:hidden flex-shrink-0"
              onClick={() => setIsDrawerOpen(true)}
            >
              <img 
                src="https://api.dicebear.com/7.x/avataaars/svg?seed=Narayan" 
                alt="Menu" 
                className="w-8 h-8 rounded-full bg-gray-800"
              />
            </button>
            <h1 className="text-xl font-bold">{getHeaderTitle()}</h1>
          </header>

                <AnimatePresence mode="wait">
                  <Routes location={location} key={location.pathname}>
                    <Route path="/login" element={<Login />} />
                    <Route path="/signup" element={<Signup />} />
                    <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
                    <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                    <Route path="/notifications" element={<ProtectedRoute><Notifications/></ProtectedRoute>} />
                    <Route path="/messages" element={<ProtectedRoute><Messages/></ProtectedRoute>} />
                    <Route path="/help" element={<ProtectedRoute><HelpCenter/></ProtectedRoute>} />
                    <Route path="/settings" element={<ProtectedRoute><Settings/></ProtectedRoute>} />
                    <Route path="*" element={<ProtectedRoute><Placeholder title="Page not found" /></ProtectedRoute>} />
                  </Routes>
                </AnimatePresence>

        </main>

        <RightSidebar />

      </div>
          </PostProvider>
        </SocialProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;