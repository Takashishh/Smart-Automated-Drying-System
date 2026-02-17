import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, Server, Ticket, LogOut, CloudRain, Shield, Mail, FileText, Settings, ChevronRight } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
interface SidebarProps {
  onClose?: () => void;
  onLogoutRequest?: () => void;
}
export function Sidebar({
  onClose,
  onLogoutRequest
}: SidebarProps) {
  const location = useLocation();
  const {
    isSuperAdmin,
    user
  } = useAuth();
  const navItems = [{
    name: 'Dashboard',
    path: '/dashboard',
    icon: LayoutDashboard,
    description: 'Overview & Analytics'
  }, {
    name: 'Users',
    path: '/users',
    icon: Users,
    description: 'Manage Users'
  }, {
    name: 'Devices',
    path: '/devices',
    icon: Server,
    description: 'Device Management'
  }, {
    name: 'Tickets',
    path: '/tickets',
    icon: Ticket,
    description: 'Support Tickets'
  }, {
    name: 'Email Templates',
    path: '/emails',
    icon: Mail,
    description: 'Email Notifications'
  }];
  const superAdminItems = [{
    name: 'Admin Management',
    path: '/admins',
    icon: Shield,
    description: 'Manage Admins'
  }, {
    name: 'Audit Logs',
    path: '/audit-logs',
    icon: FileText,
    description: 'System Activity'
  }];
  const isActive = (path: string) => {
    return location.pathname.startsWith(path);
  };
  const handleNavClick = () => {
    if (onClose) onClose();
  };
  return <div className="flex flex-col w-64 bg-white border-r border-gray-200 h-screen shadow-xl">
      {/* Logo & Brand */}
      <div className="p-5 flex items-center space-x-3 border-b border-gray-100">
        <div className="h-10 w-10 rounded-xl overflow-hidden shadow-lg">
          <img src="/Iconi.png" alt="WeatherSmart Logo" className="h-full w-full object-cover" />
        </div>
        <div className="min-w-0">
          <h1 className="text-base font-bold leading-tight truncate text-gray-900">
            Smart Rack
          </h1>
          <p className="text-xs text-gray-500 truncate">Admin Portal</p>
        </div>
      </div>
z
      {/* User Profile Card */}
      <div className="mx-4 mt-4 p-3 bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-xl border border-blue-100">
        <div className="flex items-center space-x-3">
          <div className="h-10 w-10 rounded-lg bg-blue-600 flex items-center justify-center text-white font-semibold text-sm flex-shrink-0 shadow-md shadow-blue-200">
            {user?.firstName?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'A'}{user?.lastName?.[0]?.toUpperCase() || user?.email?.[1]?.toUpperCase() || 'D'}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-gray-900 truncate">
              {user?.firstName && user?.lastName 
                ? `${user.firstName} ${user.lastName}` 
                : user?.email?.split('@')[0] || 'Admin'}
            </p>
            <p className="text-xs text-gray-600 truncate flex items-center mt-1">
              {isSuperAdmin && <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700 border border-blue-200">
                  Super Admin
                </span>}
              {!isSuperAdmin && <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700 border border-blue-200">
                  Admin
                </span>}
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <p className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
          Main Menu
        </p>
        {navItems.map(item => <Link key={item.name} to={item.path} onClick={handleNavClick} className={`
              group flex items-center justify-between px-3 py-2.5 text-sm font-medium rounded-xl transition-all duration-200 mb-1
              ${isActive(item.path) 
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' 
                : 'text-gray-700 hover:bg-blue-50 hover:text-blue-600'}
            `}>
            <div className="flex items-center min-w-0">
              <item.icon className={`mr-3 h-5 w-5 flex-shrink-0 transition-transform group-hover:scale-110 ${isActive(item.path) ? 'text-white' : 'text-gray-500'}`} />
              <div className="min-w-0">
                <span className="truncate block font-medium">{item.name}</span>
                {!isActive(item.path) && <span className="text-xs text-gray-500 truncate block">{item.description}</span>}
              </div>
            </div>
            {isActive(item.path) && <ChevronRight className="h-4 w-4 flex-shrink-0 ml-2" />}
          </Link>)}

        {isSuperAdmin && <>
            <div className="pt-4 pb-3">
              <div className="h-px bg-gray-200"></div>
            </div>
            <p className="px-3 text-xs font-semibold text-blue-600 uppercase tracking-wider mb-3 flex items-center">
              <Shield className="h-3.5 w-3.5 mr-1.5" />
              Super Admin
            </p>
            {superAdminItems.map(item => <Link key={item.name} to={item.path} onClick={handleNavClick} className={`
                  group flex items-center justify-between px-3 py-2.5 text-sm font-medium rounded-xl transition-all duration-200 mb-1
                  ${isActive(item.path) 
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' 
                    : 'text-gray-700 hover:bg-blue-50 hover:text-blue-600'}
                `}>
                <div className="flex items-center min-w-0">
                  <item.icon className={`mr-3 h-5 w-5 flex-shrink-0 transition-transform group-hover:scale-110 ${isActive(item.path) ? 'text-white' : 'text-blue-600'}`} />
                  <div className="min-w-0">
                    <span className="truncate block font-medium">{item.name}</span>
                    {!isActive(item.path) && <span className="text-xs text-gray-500 truncate block">{item.description}</span>}
                  </div>
                </div>
                {isActive(item.path) && <ChevronRight className="h-4 w-4 flex-shrink-0 ml-2" />}
              </Link>)}
          </>}

        <div className="pt-4 pb-3">
          <div className="h-px bg-gray-200"></div>
        </div>
        <p className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
          Preferences
        </p>
        <Link to="/settings" onClick={handleNavClick} className={`
            group flex items-center justify-between px-3 py-2.5 text-sm font-medium rounded-xl transition-all duration-200 mb-1
            ${isActive('/settings') 
              ? 'bg-gray-900 text-white shadow-lg shadow-gray-300' 
              : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'}
          `}>
          <div className="flex items-center min-w-0">
            <Settings className={`mr-3 h-5 w-5 flex-shrink-0 transition-transform group-hover:rotate-90 duration-300 ${isActive('/settings') ? 'text-white' : 'text-gray-500'}`} />
            <div className="min-w-0">
              <span className="truncate block font-medium">Account Settings</span>
              {!isActive('/settings') && <span className="text-xs text-gray-500 truncate block">Preferences & Profile</span>}
            </div>
          </div>
          {isActive('/settings') && <ChevronRight className="h-4 w-4 flex-shrink-0 ml-2" />}
        </Link>
      </nav>

      {/* Logout Button */}
      <div className="p-3 border-t border-gray-100">
        <button onClick={() => {
        if (onLogoutRequest) {
          onLogoutRequest();
        }
        if (onClose) onClose();
      }} className="group flex items-center justify-between w-full px-3 py-2.5 text-sm font-medium text-gray-700 hover:text-red-600 hover:bg-red-50 border border-gray-200 hover:border-red-200 rounded-xl transition-all duration-200">
          <div className="flex items-center">
            <LogOut className="mr-3 h-5 w-5 flex-shrink-0 transition-transform group-hover:scale-110" />
            <span className="truncate font-medium">Sign Out</span>
          </div>
          <ChevronRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
        </button>
      </div>
    </div>;
}