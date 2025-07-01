'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Permission {
  id: string;
  name: string;
  resource: string;
  action: string;
  description: string;
  roleCount: number;
  createdAt: string;
}

interface GroupedPermissions {
  [resource: string]: Permission[];
}

export default function PermissionsPage() {
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);
  const [groupedPermissions, setGroupedPermissions] = useState<GroupedPermissions>({});

  const fetchPermissions = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/permissions');
      if (response.ok) {
        const data = await response.json();
        setPermissions(data);
        
        // Group permissions by resource
        const grouped = data.reduce((acc: GroupedPermissions, permission: Permission) => {
          if (!acc[permission.resource]) {
            acc[permission.resource] = [];
          }
          acc[permission.resource].push(permission);
          return acc;
        }, {});
        
        setGroupedPermissions(grouped);
      }
    } catch (error) {
      console.error('Error fetching permissions:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPermissions();
  }, []);

  const handleDeletePermission = async (permissionId: string, permissionName: string) => {
    if (!confirm(`Are you sure you want to delete the permission "${permissionName}"?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/permissions/${permissionId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setPermissions(permissions.filter(permission => permission.id !== permissionId));
        // Update grouped permissions
        fetchPermissions();
      } else {
        const errorData = await response.json();
        alert(`Error: ${errorData.error}`);
      }
    } catch (error) {
      alert('Error deleting permission');
    }
  };

  const getActionBadgeColor = (action: string) => {
    switch (action.toLowerCase()) {
      case 'read':
        return 'bg-green-100 text-green-800';
      case 'create':
        return 'bg-blue-100 text-blue-800';
      case 'update':
        return 'bg-yellow-100 text-yellow-800';
      case 'delete':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Permission Management</h1>
          <p className="mt-1 text-sm text-gray-600">
            Manage system permissions and their assignments
          </p>
        </div>
        <Link
          href="/permissions/new"
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
        >
          Add Permission
        </Link>
      </div>

      {loading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedPermissions).map(([resource, resourcePermissions]) => (
            <div key={resource} className="bg-white shadow rounded-lg overflow-hidden">
              <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900 capitalize">
                  {resource} Permissions
                </h3>
                <p className="text-sm text-gray-600">
                  {resourcePermissions.length} permission{resourcePermissions.length !== 1 ? 's' : ''}
                </p>
              </div>
              
              <div className="divide-y divide-gray-200">
                {resourcePermissions.map((permission) => (
                  <div key={permission.id} className="px-6 py-4 hover:bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className="text-sm font-medium text-gray-900">
                            {permission.name}
                          </h4>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getActionBadgeColor(permission.action)}`}>
                            {permission.action}
                          </span>
                        </div>
                        
                        {permission.description && (
                          <p className="text-sm text-gray-600 mb-2">
                            {permission.description}
                          </p>
                        )}
                        
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <span>Resource: {permission.resource}</span>
                          <span>Action: {permission.action}</span>
                          <span>Used in {permission.roleCount} role{permission.roleCount !== 1 ? 's' : ''}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2 ml-4">
                        <Link
                          href={`/permissions/${permission.id}/edit`}
                          className="text-indigo-600 hover:text-indigo-900 text-sm font-medium"
                        >
                          Edit
                        </Link>
                        {permission.roleCount === 0 && (
                          <button
                            onClick={() => handleDeletePermission(permission.id, permission.name)}
                            className="text-red-600 hover:text-red-900 text-sm font-medium"
                          >
                            Delete
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && permissions.length === 0 && (
        <div className="text-center py-12">
          <div className="mx-auto h-12 w-12 text-gray-400">
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No permissions</h3>
          <p className="mt-1 text-sm text-gray-500">Get started by creating a new permission.</p>
          <div className="mt-6">
            <Link
              href="/permissions/new"
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              Add Permission
            </Link>
          </div>
        </div>
      )}

      {/* Summary Stats */}
      {!loading && permissions.length > 0 && (
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="text-2xl font-bold text-gray-900">
              {permissions.length}
            </div>
            <div className="text-sm text-gray-600">Total Permissions</div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="text-2xl font-bold text-gray-900">
              {Object.keys(groupedPermissions).length}
            </div>
            <div className="text-sm text-gray-600">Resources</div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="text-2xl font-bold text-gray-900">
              {permissions.reduce((sum, p) => sum + p.roleCount, 0)}
            </div>
            <div className="text-sm text-gray-600">Total Assignments</div>
          </div>
        </div>
      )}
    </div>
  );
}
