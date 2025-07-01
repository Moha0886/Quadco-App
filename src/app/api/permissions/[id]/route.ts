import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requirePermission } from '@/lib/auth';

// GET /api/permissions/[id] - Get a specific permission
export const GET = requirePermission('permissions', 'read')(async (request: NextRequest, { params }: { params: { id: string } }) => {
  try {
    const { id } = params;

    const permission = await (prisma as any).permission.findUnique({
      where: { id },
      include: {
        rolePermissions: {
          include: {
            role: {
              select: {
                id: true,
                name: true,
                description: true
              }
            }
          }
        }
      }
    });

    if (!permission) {
      return Response.json({ error: 'Permission not found' }, { status: 404 });
    }

    const formattedPermission = {
      ...permission,
      roles: permission.rolePermissions.map((rp: any) => rp.role)
    };

    return Response.json(formattedPermission);
  } catch (error) {
    console.error('Error fetching permission:', error);
    return Response.json({ error: 'Failed to fetch permission' }, { status: 500 });
  }
});

// PUT /api/permissions/[id] - Update a permission
export const PUT = requirePermission('permissions', 'update')(async (request: NextRequest, { params }: { params: { id: string } }) => {
  try {
    const { id } = params;
    const body = await request.json();
    const { name, description, resource, action } = body;

    if (!name || !name.trim() || !resource || !resource.trim() || !action || !action.trim()) {
      return Response.json({ 
        error: 'Permission name, resource, and action are required' 
      }, { status: 400 });
    }

    // Check if permission exists
    const existingPermission = await (prisma as any).permission.findUnique({
      where: { id }
    });

    if (!existingPermission) {
      return Response.json({ error: 'Permission not found' }, { status: 404 });
    }

    // Check if another permission with this resource and action exists
    const duplicatePermission = await (prisma as any).permission.findFirst({
      where: {
        resource: resource.trim(),
        action: action.trim(),
        id: { not: id }
      }
    });

    if (duplicatePermission) {
      return Response.json({ 
        error: 'Permission with this resource and action already exists' 
      }, { status: 400 });
    }

    const permission = await (prisma as any).permission.update({
      where: { id },
      data: {
        name: name.trim(),
        description: description?.trim() || null,
        resource: resource.trim(),
        action: action.trim()
      }
    });

    return Response.json(permission);
  } catch (error) {
    console.error('Error updating permission:', error);
    return Response.json({ error: 'Failed to update permission' }, { status: 500 });
  }
});

// DELETE /api/permissions/[id] - Delete a permission
export const DELETE = requirePermission('permissions', 'delete')(async (request: NextRequest, { params }: { params: { id: string } }) => {
  try {
    const { id } = params;

    const permission = await (prisma as any).permission.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            rolePermissions: true
          }
        }
      }
    });

    if (!permission) {
      return Response.json({ error: 'Permission not found' }, { status: 404 });
    }

    // Prevent deletion if permission is assigned to roles
    if (permission._count.rolePermissions > 0) {
      return Response.json({ 
        error: 'Cannot delete permission assigned to roles. Remove from roles first.' 
      }, { status: 400 });
    }

    await (prisma as any).permission.delete({
      where: { id }
    });

    return Response.json({ message: 'Permission deleted successfully' });
  } catch (error) {
    console.error('Error deleting permission:', error);
    return Response.json({ error: 'Failed to delete permission' }, { status: 500 });
  }
});
