import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requirePermission } from '@/lib/auth';

// GET /api/permissions - List all permissions
export const GET = requirePermission('permissions', 'read')(async (request: NextRequest) => {
  try {
    const permissions = await (prisma as any).permission.findMany({
      include: {
        _count: {
          select: {
            rolePermissions: true
          }
        }
      },
      orderBy: [
        { resource: 'asc' },
        { action: 'asc' }
      ]
    });

    const formattedPermissions = permissions.map((permission: any) => ({
      ...permission,
      roleCount: permission._count.rolePermissions
    }));

    return Response.json(formattedPermissions);
  } catch (error) {
    console.error('Error fetching permissions:', error);
    return Response.json({ error: 'Failed to fetch permissions' }, { status: 500 });
  }
});

// POST /api/permissions - Create a new permission
export const POST = requirePermission('permissions', 'create')(async (request: NextRequest) => {
  try {
    const body = await request.json();
    const { name, description, resource, action } = body;

    if (!name || !name.trim() || !resource || !resource.trim() || !action || !action.trim()) {
      return Response.json({ 
        error: 'Permission name, resource, and action are required' 
      }, { status: 400 });
    }

    // Check if permission already exists
    const existingPermission = await (prisma as any).permission.findFirst({
      where: {
        resource: resource.trim(),
        action: action.trim()
      }
    });

    if (existingPermission) {
      return Response.json({ 
        error: 'Permission with this resource and action already exists' 
      }, { status: 400 });
    }

    const permission = await (prisma as any).permission.create({
      data: {
        name: name.trim(),
        description: description?.trim() || null,
        resource: resource.trim(),
        action: action.trim()
      }
    });

    return Response.json(permission, { status: 201 });
  } catch (error) {
    console.error('Error creating permission:', error);
    return Response.json({ error: 'Failed to create permission' }, { status: 500 });
  }
});
