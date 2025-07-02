'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';

interface Permission {
  id: string;
  name: string;
  resource: string;
  action: string;
  description: string;
}

interface Role {
  id: string;
  name: string;
  description: string;
  isSystem: boolean;
  userCount: number;
  permissions: Permission[];
  createdAt: string;
}

export default function RolesPage() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRoles = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/roles');
      if (response.ok) {
        const data = await response.json();
        setRoles(data);
      }
    } catch (error) {
      console.error('Error fetching roles:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRoles();
  }, [fetchRoles]);

  const handleDeleteRole = async (roleId: string, roleName: string) => {
    if (!confirm(`Are you sure you want to delete the role "${roleName}"?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/roles/${roleId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setRoles(roles.filter(role => role.id !== roleId));
      } else {
        const errorData = await response.json();
        alert(`Error: ${errorData.error}`);
      }
    } catch {
      alert('Error deleting role');
    }
  };

  const getSystemBadge = (isSystem: boolean) => {
    if (!isSystem) return null;
    
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
        System
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

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Role Management</h1>
          <p className="mt-1 text-sm text-gray-600">
            Manage user roles and their permissions
          </p>
        </div>
        <Link
          href="/roles/new"
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
        >
          Add Role
        </Link>
      </div>

      {/* Roles Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {loading ? (
          <div className="col-span-full flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          roles.map((role) => (
            <div key={role.id} className="bg-white shadow rounded-lg p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-lg font-medium text-gray-900 capitalize">
                      {role.name}
                    </h3>
                    {getSystemBadge(role.isSystem)}
                  </div>
                  {role.description && (
                    <p className="text-sm text-gray-600">{role.description}</p>
                  )}
                </div>
              </div>

              <div className="mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Users:</span>
                  <span className="font-medium">{role.userCount}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Permissions:</span>
                  <span className="font-medium">{role.permissions.length}</span>
                </div>
              </div>

              {/* Permissions Summary */}
              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Permissions:</h4>
                <div className="space-y-1">
                  {groupPermissionsByResource(role.permissions).slice(0, 3).map(({ resource, actions }) => (
                    <div key={resource} className="text-xs">
                      <span className="font-medium text-gray-600 capitalize">{resource}:</span>
                      <span className="text-gray-500 ml-1">
                        {actions.join(', ')}
                      </span>
                    </div>
                  ))}
                  {groupPermissionsByResource(role.permissions).length > 3 && (
                    <div className="text-xs text-gray-500">
                      +{groupPermissionsByResource(role.permissions).length - 3} more...
                    </div>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                <Link
                  href={`/roles/${role.id}`}
                  className="text-blue-600 hover:text-blue-900 text-sm font-medium"
                >
                  View Details
                </Link>
                <div className="flex space-x-2">
                  <Link
                    href={`/roles/${role.id}/edit`}
                    className="text-indigo-600 hover:text-indigo-900 text-sm font-medium"
                  >
                    Edit
                  </Link>
                  {!role.isSystem && (
                    <button
                      onClick={() => handleDeleteRole(role.id, role.name)}
                      className="text-red-600 hover:text-red-900 text-sm font-medium"
                    >
                      Delete
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Empty State */}
      {!loading && roles.length === 0 && (
        <div className="text-center py-12">
          <div className="mx-auto h-12 w-12 text-gray-400">
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
            </svg>
          </div>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No roles</h3>
          <p className="mt-1 text-sm text-gray-500">Get started by creating a new role.</p>
          <div className="mt-6">
            <Link
              href="/roles/new"
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              Add Role
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
