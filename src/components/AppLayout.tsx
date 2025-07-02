"use client";

import { useState, useEffect, useRef } from "react";
import { Menu, User, LogOut } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import Sidebar from "./Sidebar";
import { useAuth } from "./AuthProvider";

interface AppLayoutProps {
  children: React.ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  const { user: currentUser, logout, loading } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const getUserInitials = (user: { firstName?: string; lastName?: string }) => {
    return `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}`.toUpperCase();
  };

  const getUserRole = (user: { roles: string[] }) => {
    if (user.roles.includes('super-admin')) return 'Super Admin';
    if (user.roles.includes('admin')) return 'Administrator';
    if (user.roles.includes('manager')) return 'Manager';
    if (user.roles.includes('sales')) return 'Sales';
    if (user.roles.includes('accountant')) return 'Accountant';
    return 'User';
  };

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // If not authenticated, show authentication required message
  if (!currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Authentication Required</h2>
          <p className="text-gray-600 mb-4">Please log in to access this application.</p>
          <Link 
            href="/login"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

      {/* Main content area */}
      <div className="flex flex-col flex-1 lg:ml-0">
        {/* Top bar */}
        <div className="bg-white shadow-sm border-b border-gray-200">
          <div className="px-4 py-3 flex items-center justify-between">
            {/* Mobile menu button and logo */}
            <div className="flex items-center">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden text-gray-600 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 mr-4"
              >
                <Menu className="h-6 w-6" />
              </button>
              <div className="lg:hidden flex items-center">
                <div className="relative h-8 w-8 bg-blue-100 rounded p-1 flex items-center justify-center mr-2">
                  <Image
                    src="/quadco-logo.png"
                    alt="Quadco Consults Limited"
                    width={24}
                    height={24}
                    className="object-contain"
                  />
                </div>
                <span className="text-sm font-medium text-gray-900">Quadco Consults</span>
              </div>
            </div>

            {/* User menu */}
            {currentUser && (
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center space-x-3 text-sm bg-white border border-gray-300 rounded-full px-3 py-2 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <div className="h-8 w-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
                    {getUserInitials(currentUser)}
                  </div>
                  <div className="hidden md:block text-left">
                    <div className="font-medium text-gray-900">
                      {currentUser.firstName} {currentUser.lastName}
                    </div>
                    <div className="text-xs text-gray-500">
                      {getUserRole(currentUser)}
                    </div>
                  </div>
                </button>

                {/* Dropdown menu */}
                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-md shadow-lg z-50">
                    <div className="py-1">
                      <div className="px-4 py-2 border-b border-gray-200">
                        <div className="text-sm font-medium text-gray-900">
                          {currentUser.firstName} {currentUser.lastName}
                        </div>
                        <div className="text-xs text-gray-500">{currentUser.email}</div>
                      </div>
                      
                      <Link
                        href="/profile"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        <User className="h-4 w-4 mr-3" />
                        My Profile
                      </Link>
                      
                      <button
                        onClick={() => {
                          setUserMenuOpen(false);
                          logout();
                        }}
                        className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        <LogOut className="h-4 w-4 mr-3" />
                        Sign out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Page content */}
        <main className="flex-1 overflow-auto">
          <div className="p-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
