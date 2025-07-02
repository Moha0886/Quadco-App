"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import {
  FileText,
  Users,
  Package,
  Settings,
  BarChart3,
  FileSpreadsheet,
  Truck,
  Home,
  X,
  Shield,
  UserCog,
  Key,
  User
} from "lucide-react";
import { ProtectedComponent } from "./AuthProvider";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: Home },
  { name: "Quotations", href: "/quotations", icon: FileText },
  { name: "Invoices", href: "/invoices", icon: FileSpreadsheet },
  { name: "Delivery Notes", href: "/delivery-notes", icon: Truck },
  { name: "Customers", href: "/customers", icon: Users },
  { name: "Products", href: "/products", icon: Package },
  { name: "Services", href: "/services", icon: Settings },
  { name: "Reports", href: "/reports", icon: BarChart3 },
];

const userManagement = [
  { name: "Users", href: "/users", icon: UserCog },
  { name: "Roles", href: "/roles", icon: Shield },
  { name: "Permissions", href: "/permissions", icon: Key },
];

const accountLinks = [
  { name: "My Profile", href: "/profile", icon: User },
];

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

export default function Sidebar({ isOpen, setIsOpen }: SidebarProps) {
  const pathname = usePathname();

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-gray-600 bg-opacity-75 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:relative lg:transform-none lg:shadow-none lg:border-r lg:border-gray-200 ${
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        {/* Logo/Header */}
        <div className="flex items-center justify-between h-20 px-6 bg-blue-600">
          <div className="flex items-center space-x-3">
            <div className="relative h-10 w-10 bg-white rounded-lg p-1 flex items-center justify-center">
              <Image
                src="/quadco-logo.png"
                alt="Quadco Consults Limited"
                width={32}
                height={32}
                className="object-contain"
              />
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-bold text-white leading-tight">Quadco Consults</span>
              <span className="text-xs text-blue-200 leading-tight">Limited</span>
            </div>
          </div>
          {/* Mobile close button */}
          <button
            onClick={() => setIsOpen(false)}
            className="lg:hidden text-white hover:text-gray-200"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="mt-8 px-4">
          <div className="space-y-6">
            {/* Main Navigation */}
            <div className="space-y-2">
              {navigation.map((item) => {
                const isActive = pathname === item.href || pathname?.startsWith(item.href + "/");
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                      isActive
                        ? "bg-blue-100 text-blue-700 border-r-2 border-blue-700"
                        : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                    }`}
                    onClick={() => setIsOpen(false)} // Close mobile menu on navigation
                  >
                    <item.icon
                      className={`mr-3 h-5 w-5 ${
                        isActive ? "text-blue-500" : "text-gray-400 group-hover:text-gray-500"
                      }`}
                    />
                    {item.name}
                  </Link>
                );
              })}
            </div>

            {/* User Management Section */}
            <ProtectedComponent roles={['super-admin', 'admin']}>
              <div>
                <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  User Management
                </h3>
                <div className="mt-2 space-y-1">
                  {userManagement.map((item) => {
                    const isActive = pathname === item.href || pathname?.startsWith(item.href + "/");
                    return (
                      <Link
                        key={item.name}
                        href={item.href}
                        className={`group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                          isActive
                            ? "bg-blue-100 text-blue-700 border-r-2 border-blue-700"
                            : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                        }`}
                        onClick={() => setIsOpen(false)} // Close mobile menu on navigation
                      >
                        <item.icon
                          className={`mr-3 h-5 w-5 ${
                            isActive ? "text-blue-500" : "text-gray-400 group-hover:text-gray-500"
                          }`}
                        />
                        {item.name}
                      </Link>
                    );
                  })}
                </div>
              </div>
            </ProtectedComponent>

            {/* Account Section */}
            <div>
              <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Account
              </h3>
              <div className="mt-2 space-y-1">
                {accountLinks.map((item) => {
                  const isActive = pathname === item.href || pathname?.startsWith(item.href + "/");
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                        isActive
                          ? "bg-blue-100 text-blue-700 border-r-2 border-blue-700"
                          : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                      }`}
                      onClick={() => setIsOpen(false)} // Close mobile menu on navigation
                    >
                      <item.icon
                        className={`mr-3 h-5 w-5 ${
                          isActive ? "text-blue-500" : "text-gray-400 group-hover:text-gray-500"
                        }`}
                      />
                      {item.name}
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
        </nav>

        {/* Footer */}
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-xs text-gray-500 text-center">
              Quadco Consults Limited
            </p>
            <p className="text-xs text-gray-400 text-center mt-1">
              Business Management System v1.0
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
