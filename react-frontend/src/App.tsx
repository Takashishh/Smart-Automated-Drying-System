import React, { useState, useEffect } from 'react';
import { Header } from './components/website/Header';
import { Footer } from './components/website/Footer';
import { HomePage } from './pages/website/HomePage';
import { AboutPage } from './pages/website/AboutPage';
import { FeaturesPage } from './pages/website/FeaturesPage';
import { ManualsPage } from './pages/website/ManualsPage';
import { ContactPage } from './pages/website/ContactPage';
import { LoginPage } from './pages/website/LoginPage';
import { AccountSettingsPage } from './pages/website/AccountSettingsPage';
import { TicketsPage } from './pages/website/TicketsPage';
import { ViewTicketsPage } from './pages/website/ViewTicketsPage';
interface StoredUser {
  uid?: string;
  email?: string;
  displayName?: string;
  firstName?: string;
  lastName?: string;
}

export function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentPage, setCurrentPage] = useState('home');
  const [user, setUser] = useState<StoredUser | null>(null);

  // Check authentication on mount
  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    const storedUser = localStorage.getItem('auth_user');
    if (token) {
      setIsAuthenticated(true);
      setCurrentPage('home');
    }
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (err) {
        console.error('Failed to parse stored user', err);
      }
    }
  }, []);

  const handleLogin = (token: string, userInfo?: StoredUser) => {
    setIsAuthenticated(true);
    setCurrentPage('home');
    if (userInfo) {
      setUser(userInfo);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('remember_user');
    localStorage.removeItem('auth_user');
    setIsAuthenticated(false);
    setCurrentPage('login');
    setUser(null);
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <HomePage onNavigate={setCurrentPage} />;
      case 'about':
        return <AboutPage />;
      case 'features':
        return <FeaturesPage />;
      case 'manuals':
        return <ManualsPage />;
      case 'contact':
        return <ContactPage />;
      case 'tickets':
        return <TicketsPage user={user} onNavigate={handleNavigate} />;
      case 'view-tickets':
        return <ViewTicketsPage user={user} />;
      case 'account':
        return <AccountSettingsPage onNavigate={setCurrentPage} user={user} />;
      case 'login':
        return <LoginPage onLoggedIn={handleLogin} />;
      default:
        return <HomePage onNavigate={setCurrentPage} />;
    }
  };

  const handleNavigate = (page: string) => {
    // Restrict navigation for unauthenticated users
    const publicPages = ['home', 'about', 'contact', 'features', 'manuals', 'login'];
    if (!isAuthenticated && !publicPages.includes(page)) {
      setCurrentPage('login');
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
      return;
    }
    
    setCurrentPage(page);
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  return <div className="min-h-screen bg-white font-sans text-gray-900">
      <Header currentPage={currentPage} onNavigate={handleNavigate} onLogout={isAuthenticated ? handleLogout : undefined} user={user} isAuthenticated={isAuthenticated} />
      <main>{renderPage()}</main>
      <Footer onNavigate={handleNavigate} />
    </div>;
}