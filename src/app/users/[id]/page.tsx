'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';

interface Role {
  id: string;
  name: string;
  description: string;
}

interface Permission {
  id: string;
  name: string;
  resource: string;
  action: string;
  description: string;
}

interface User {
  id: string;
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  isActive: boolean;
  lastLogin: string | null;
  createdAt: string;
  roles: Role[];
  permissions: Permission[];
}

export default function UserDetailPage() {
  const params = useParams();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (params.id) {
      fetchUser(params.id as string);
    }
  }, [params.id]);

  const fetchUser = async (userId: string) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/users/${userId}`);
      if (response.ok) {
        const data = await response.json();
        setUser(data);
      } else {
        setError('User not found');
      }
    } catch (error) {
      setError('Error fetching user details');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (isActive: boolean) => {
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
        isActive 
          ? 'bg-green-100 text-green-800' 
          : 'bg-red-100 text-red-800'
      }`}>
        {isActive ? 'Active' : 'Inactive'}
      </span>
    );
  };

  const groupPermissionsByResource = (permissions: Permission[]) => {
    const grouped = permissions.reduce((acc, permission) => {
      if (!acc[permission.resource]) {
        acc[permission.resource] = [];
      }
      acc[permission.resource].push(permission.action);
      return acc;
    }, {} as Record<string, string[]>);

    return Object.entries(grouped).map(([resource, actions]) => ({
      resource,
      actions: actions.sort()
    }));
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="p-6">
        <div className="text-center py-8">
          <h3 className="text-lg font-medium text-gray-900">Error</h3>
          <p className="text-gray-600">{error || 'User not found'}</p>
          <Link
            href="/users"
            className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-blue-600 bg-blue-100 hover:bg-blue-200"
          >
            Back to Users
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <Link
              href="/users"
              className="text-gray-500 hover:text-gray-700 mr-4"
            >
              ← Back to Users
            </Link>
            <h1 className="text-2xl font-semibold text-gray-900">User Details</h1>
          </div>
          <div className="flex space-x-3">
            <Link
              href={`/users/${user.id}/edit`}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium"
            >
              Edit User
            </Link>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg overflow-hidden">
          {/* User Info Header */}
          <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium text-gray-900">
                  {user.firstName} {user.lastName}
                </h3>
                <p className="text-sm text-gray-600">{user.email}</p>
                <p className="text-xs text-gray-500">@{user.username}</p>
              </div>
              <div>
                {getStatusBadge(user.isActive)}
              </div>
            </div>
          </div>

          <div className="px-6 py-4">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-4">Account Information</h4>
                <dl className="space-y-3">
                  <div>
                    <dt className="text-sm text-gray-500">Email</dt>
                    <dd className="text-sm font-medium text-gray-900">{user.email}</dd>
                  </div>
                  <div>
                    <dt className="text-sm text-gray-500">Username</dt>
                    <dd className="text-sm font-medium text-gray-900">{user.username}</dd>
                  </div>
                  <div>
                    <dt className="text-sm text-gray-500">Status</dt>
                    <dd className="text-sm font-medium text-gray-900">
                      {user.isActive ? 'Active' : 'Inactive'}
                    </dd>
                  </div>
                </dl>
              </div>

              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-4">Activity</h4>
                <dl className="space-y-3">
                  <div>
                    <dt className="text-sm text-gray-500">Last Login</dt>
                    <dd className="text-sm font-medium text-gray-900">
                      {user.lastLogin 
                        ? new Date(user.lastLogin).toLocaleString()
                        : 'Never'
                      }
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm text-gray-500">Account Created</dt>
                    <dd className="text-sm font-medium text-gray-900">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </dd>
                  </div>
                </dl>
              </div>
            </div>

            {/* Roles */}
            <div className="mb-8">
              <h4 className="text-sm font-medium text-gray-900 mb-4">Assigned Roles</h4>
              {user.roles.length > 0 ? (
                <div className="space-y-3">
                  {user.roles.map((role) => (
                    <div key={role.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <h5 className="text-sm font-medium text-gray-900 capitalize">
                            {role.name}
                          </h5>
                          {role.description && (
                            <p className="text-sm text-gray-600 mt-1">{role.description}</p>
                          )}
                        </div>
                        <Link
                          href={`/roles/${role.id}`}
                          className="text-blue-600 hover:text-blue-900 text-sm font-medium"
                        >
                          View Role
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">No roles assigned</p>
              )}
            </div>

            {/* Permissions */}
            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-4">Effective Permissions</h4>
              {user.permissions.length > 0 ? (
                <div className="space-y-4">
                  {groupPermissionsByResource(user.permissions).map(({ resource, actions }) => (
                    <div key={resource} className="border border-gray-200 rounded-lg p-4">
                      <h5 className="text-sm font-medium text-gray-900 capitalize mb-2">
                        {resource}
                      </h5>
                      <div className="flex flex-wrap gap-2">
                        {actions.map((action) => (
                          <span
                            key={action}
                            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                          >
                            {action}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">No permissions available</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
