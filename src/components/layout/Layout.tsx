import React from 'react';
import TopBar from './TopBar';
import Header from './Header';
import Navigation from './Navigation';
import Footer from './Footer';
import AuthModal from '../auth/AuthModal';
import { useAuth } from '../../context/AuthContext';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { isAuthModalOpen, closeAuthModal } = useAuth();

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <TopBar />
      <Header />
      <Navigation />
      
      <main className="flex-grow">
        {children}
      </main>
      
      <Footer />
      
      {/* Auth Modal */}
      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={closeAuthModal} 
      />
    </div>
  );
};

export default Layout;