import React, { useEffect, useState } from 'react';
import { Droplets, Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
interface HeaderProps {
  currentPage: string;
  onNavigate: (page: string) => void;
  onLogout?: () => void;
  user?: {
    displayName?: string;
  } | null;
  isAuthenticated: boolean;
}
export function Header({
  currentPage,
  onNavigate,
  onLogout,
  user,
  isAuthenticated
}: HeaderProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  const allNavItems = [{
    id: 'home',
    label: 'Home'
  }, {
    id: 'about',
    label: 'About'
  }, {
    id: 'contact',
    label: 'Contact'
  }, {
    id: 'features',
    label: 'Features'
  }, {
    id: 'manuals',
    label: 'Manuals'
  }, {
    id: 'tickets',
    label: 'Submit Ticket'
  }, {
    id: 'view-tickets',
    label: 'My Tickets'
  }];

  // Filter nav items based on authentication status
  const navItems = isAuthenticated 
    ? allNavItems 
    : allNavItems.filter(item => ['home', 'about', 'contact', 'features', 'manuals'].includes(item.id));

  const handleNavClick = (id: string) => {
    if (id === 'logout') {
      onLogout?.();
    } else {
      onNavigate(id);
    }
  };

  return <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-white/80 backdrop-blur-md shadow-sm py-3' : 'bg-transparent py-5'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => onNavigate('home')}>
            <div className="p-2 bg-blue-600 rounded-xl">
              <Droplets className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900 tracking-tight">
              Smart Laundry
            </span>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            {navItems.map(item => <button key={item.id} onClick={() => handleNavClick(item.id)} className={`text-sm font-medium transition-colors hover:text-blue-600 ${currentPage === item.id ? 'text-blue-600' : 'text-gray-600'}`}>
                {item.label}
              </button>)}
            {!isAuthenticated && <button onClick={() => onNavigate('login')} className="text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors">
                Login
              </button>}
            {user?.displayName && <button onClick={() => onNavigate('account')} className="text-sm font-semibold text-gray-700 hover:text-blue-600 transition-colors cursor-pointer">{user.displayName}</button>}
            {onLogout && <button onClick={onLogout} className="text-sm font-medium text-red-600 hover:text-red-700 transition-colors">
                Logout
              </button>}
          </nav>

          {/* Mobile Menu Button */}
          <button className="md:hidden p-2 text-gray-600" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
            {isMobileMenuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && <motion.div initial={{
        opacity: 0,
        height: 0
      }} animate={{
        opacity: 1,
        height: 'auto'
      }} exit={{
        opacity: 0,
        height: 0
      }} className="md:hidden bg-white border-t border-gray-100 overflow-hidden">
            <div className="px-4 py-6 space-y-4">
              {navItems.map(item => <button key={item.id} onClick={() => {
            handleNavClick(item.id);
            setIsMobileMenuOpen(false);
          }} className={`block w-full text-left text-lg font-medium ${currentPage === item.id ? 'text-blue-600' : 'text-gray-600'}`}>
                  {item.label}
                </button>)}
              {!isAuthenticated && <button onClick={() => {
            onNavigate('login');
            setIsMobileMenuOpen(false);
          }} className="block w-full text-left text-lg font-medium text-blue-600">
                  Login
                </button>}
              {user?.displayName && <button onClick={() => {
            onNavigate('account');
            setIsMobileMenuOpen(false);
          }} className="block w-full text-left text-lg font-semibold text-gray-700 hover:text-blue-600 transition-colors">{user.displayName}</button>}
              {onLogout && <button onClick={() => {
            onLogout();
            setIsMobileMenuOpen(false);
          }} className="block w-full text-left text-lg font-medium text-red-600">
                  Logout
                </button>}
            </div>
          </motion.div>}
      </AnimatePresence>
    </header>;
}