'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function RolesPage() {
  const [roles] = useState([
    {
      id: '1',
      name: 'Super Admin',
      description: 'Full system access with all permissions',
      userCount: 1,
      permissions: ['user.create', 'user.edit', 'user.delete', 'role.manage', 'system.config']
    },
    {
      id: '2', 
      name: 'Manager',
      description: 'Management access to business operations',
      userCount: 3,
      permissions: ['customer.manage', 'invoice.create', 'quotation.manage', 'service.manage']
    },
    {
      id: '3',
      name: 'Employee',
      description: 'Basic access to view and create business records',
      userCount: 5,
      permissions: ['customer.view', 'invoice.view', 'quotation.create']
    }
  ]);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Roles & Permissions</h1>
              <p className="mt-2 text-gray-600">
                Manage user roles and access permissions for your team.
              </p>
            </div>
            <Link
              href="/users"
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Users
            </Link>
          </div>
        </div>

        {/* Roles Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {roles.map((role) => (
            <div key={role.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">{role.name}</h3>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  {role.userCount} users
                </span>
              </div>
              
              <p className="text-gray-600 text-sm mb-4">{role.description}</p>
              
              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Permissions:</h4>
                <div className="space-y-1">
                  {role.permissions.slice(0, 3).map((permission) => (
                    <div key={permission} className="flex items-center text-sm">
                      <svg className="w-4 h-4 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-gray-600">{permission.replace('.', ' ')}</span>
                    </div>
                  ))}
                  {role.permissions.length > 3 && (
                    <div className="text-sm text-gray-500">
                      +{role.permissions.length - 3} more
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex space-x-2">
                <button className="flex-1 px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500">
                  Edit
                </button>
                <button className="px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500">
                  View
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Development Notice */}
        <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">Development Mode</h3>
              <div className="mt-2 text-sm text-yellow-700">
                <p>This is a preview of the roles management system. Role editing and permission management are currently under development. The data shown is for demonstration purposes.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
