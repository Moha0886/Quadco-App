import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requirePermission } from '@/lib/auth';

// GET /api/roles - List all roles
export const GET = requirePermission('roles', 'read')(async () => {
  try {
    const roles = await prisma.role.findMany({
      include: {
        rolePermissions: {
          include: {
            permission: true
          }
        },
        _count: {
          select: {
            userRoles: true
          }
        }
      },
      orderBy: { name: 'asc' }
    });

    const formattedRoles = roles.map((role) => ({
      ...role,
      userCount: role._count.userRoles,
      permissions: role.rolePermissions.map((rp) => ({
        id: rp.permission.id,
        name: rp.permission.name,
        resource: rp.permission.resource,
        action: rp.permission.action,
        description: rp.permission.description
      }))
    }));

    return Response.json(formattedRoles);
  } catch (error: unknown) {
    console.error('Error fetching roles:', error);
    return Response.json({ error: 'Failed to fetch roles' }, { status: 500 });
  }
});

// POST /api/roles - Create a new role
export const POST = requirePermission('roles', 'create')(async (request: NextRequest) => {
  try {
    const body = await request.json();
    const { name, description, permissionIds } = body;

    if (!name || !name.trim()) {
      return Response.json({ error: 'Role name is required' }, { status: 400 });
    }

    // Check if role already exists
    const existingRole = await prisma.role.findUnique({
      where: { name: name.trim() }
    });

    if (existingRole) {
      return Response.json({ error: 'Role with this name already exists' }, { status: 400 });
    }

    // Create role with permissions
    const role = await prisma.role.create({
      data: {
        name: name.trim(),
        description: description?.trim() || null,
        rolePermissions: permissionIds && permissionIds.length > 0 ? {
          create: permissionIds.map((permissionId: string) => ({
            permissionId
          }))
        } : undefined
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
      permissions: role.rolePermissions.map((rp) => ({
        id: rp.permission.id,
        name: rp.permission.name,
        resource: rp.permission.resource,
        action: rp.permission.action,
        description: rp.permission.description
      }))
    };

    return Response.json(formattedRole, { status: 201 });
  } catch (error: unknown) {
    console.error('Error creating role:', error);
    return Response.json({ error: 'Failed to create role' }, { status: 500 });
  }
});
