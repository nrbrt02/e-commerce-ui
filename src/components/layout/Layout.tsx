import React, { ReactNode } from 'react';
import TopBar from './TopBar';
import Header from './Header';
import Navigation from './Navigation';
import Footer from './Footer';

interface LayoutProps {
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Top components */}
      <TopBar />
      <Header />
      <Navigation />
      
      {/* Main content */}
      <main className="flex-grow">
        {children}
      </main>
      
      {/* Footer */}
      <Footer />
    </div>
  );
};

export default Layout;