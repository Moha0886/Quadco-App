import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requirePermission } from '@/lib/auth';

// GET /api/roles/[id] - Get a specific role
export const GET = requirePermission('roles', 'read')(async (request: NextRequest, { params }: { params: { id: string } }) => {
  try {
    const { id } = params;

    const role = await (prisma as any).role.findUnique({
      where: { id },
      include: {
        rolePermissions: {
          include: {
            permission: true
          }
        },
        userRoles: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                username: true,
                firstName: true,
                lastName: true,
                isActive: true
              }
            }
          }
        }
      }
    });

    if (!role) {
      return Response.json({ error: 'Role not found' }, { status: 404 });
    }

    const formattedRole = {
      ...role,
      permissions: role.rolePermissions.map((rp: any) => ({
        id: rp.permission.id,
        name: rp.permission.name,
        resource: rp.permission.resource,
        action: rp.permission.action,
        description: rp.permission.description
      })),
      users: role.userRoles.map((ur: any) => ur.user)
    };

    return Response.json(formattedRole);
  } catch (error) {
    console.error('Error fetching role:', error);
    return Response.json({ error: 'Failed to fetch role' }, { status: 500 });
  }
});

// PUT /api/roles/[id] - Update a role
export const PUT = requirePermission('roles', 'update')(async (request: NextRequest, { params }: { params: { id: string } }) => {
  try {
    const { id } = params;
    const body = await request.json();
    const { name, description, permissionIds } = body;

    if (!name || !name.trim()) {
      return Response.json({ error: 'Role name is required' }, { status: 400 });
    }

    // Check if role exists
    const existingRole = await (prisma as any).role.findUnique({
      where: { id }
    });

    if (!existingRole) {
      return Response.json({ error: 'Role not found' }, { status: 404 });
    }

    // Prevent editing system roles
    if (existingRole.isSystem) {
      return Response.json({ error: 'Cannot modify system roles' }, { status: 400 });
    }

    // Check if another role with this name exists
    const duplicateRole = await (prisma as any).role.findFirst({
      where: {
        name: name.trim(),
        id: { not: id }
      }
    });

    if (duplicateRole) {
      return Response.json({ error: 'Role with this name already exists' }, { status: 400 });
    }

    // Update role with permissions
    const role = await (prisma as any).role.update({
      where: { id },
      data: {
        name: name.trim(),
        description: description?.trim() || null,
        rolePermissions: {
          deleteMany: {}, // Remove all existing permissions
          create: permissionIds && permissionIds.length > 0 ? 
            permissionIds.map((permissionId: string) => ({
              permissionId
            })) : []
        }
      },
      include: {
        rolePermissions: {
          include: {
            permission: true
          }
        }
      }
    });

    const formattedRole = {
      ...role,
      permissions: role.rolePermissions.map((rp: any) => ({
        id: rp.permission.id,
        name: rp.permission.name,
        resource: rp.permission.resource,
        action: rp.permission.action,
        description: rp.permission.description
      }))
    };

    return Response.json(formattedRole);
  } catch (error) {
    console.error('Error updating role:', error);
    return Response.json({ error: 'Failed to update role' }, { status: 500 });
  }
});

// DELETE /api/roles/[id] - Delete a role
export const DELETE = requirePermission('roles', 'delete')(async (request: NextRequest, { params }: { params: { id: string } }) => {
  try {
    const { id } = params;

    const role = await (prisma as any).role.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            userRoles: true
          }
        }
      }
    });

    if (!role) {
      return Response.json({ error: 'Role not found' }, { status: 404 });
    }

    // Prevent deletion of system roles
    if (role.isSystem) {
      return Response.json({ error: 'Cannot delete system roles' }, { status: 400 });
    }

    // Prevent deletion if role has users
    if (role._count.userRoles > 0) {
      return Response.json({ 
        error: 'Cannot delete role with assigned users. Remove users from this role first.' 
      }, { status: 400 });
    }

    await (prisma as any).role.delete({
      where: { id }
    });

    return Response.json({ message: 'Role deleted successfully' });
  } catch (error) {
    console.error('Error deleting role:', error);
    return Response.json({ error: 'Failed to delete role' }, { status: 500 });
  }
});
