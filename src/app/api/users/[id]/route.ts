import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { AuthService, requirePermission } from '@/lib/auth';

// GET /api/users/[id] - Get a specific user
export const GET = requirePermission('users', 'read')(async (request: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
  try {
    const resolvedParams = await params;
    const { id } = resolvedParams;

    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        userRoles: {
          include: {
            role: {
              include: {
                rolePermissions: {
                  include: {
                    permission: true
                  }
                }
              }
            }
          }
        }
      }
    });

    if (!user) {
      return Response.json({ error: 'User not found' }, { status: 404 });
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...userWithoutPassword } = user;
    const roles = user.userRoles.map((ur) => ur.role);
    const permissions = user.userRoles.flatMap((ur) => 
      ur.role.rolePermissions.map((rp) => rp.permission)
    );

    return Response.json({
      ...userWithoutPassword,
      roles,
      permissions: [...new Map(permissions.map((p) => [p.id, p])).values()]
    });
  } catch (error: unknown) {
    console.error('Error fetching user:', error);
    return Response.json({ error: 'Failed to fetch user' }, { status: 500 });
  }
});

// PUT /api/users/[id] - Update a user
export const PUT = requirePermission('users', 'update')(async (request: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
  try {
    const resolvedParams = await params;
    const { id } = resolvedParams;
    const body = await request.json();
    const { email, username, firstName, lastName, password, roleIds, isActive } = body;

    if (!email || !username || !firstName || !lastName) {
      return Response.json({ error: 'Email, username, first name, and last name are required' }, { status: 400 });
    }

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id }
    });

    if (!existingUser) {
      return Response.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if another user with this email or username exists
    const duplicateUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email, id: { not: id } },
          { username, id: { not: id } }
        ]
      }
    });

    if (duplicateUser) {
      return Response.json({ error: 'User with this email or username already exists' }, { status: 400 });
    }

    // Prepare update data
    const updateData: Record<string, unknown> = {
      email,
      username,
      firstName,
      lastName,
      isActive: isActive !== undefined ? isActive : existingUser.isActive
    };

    if (password && password.trim()) {
      updateData.password = await AuthService.hashPassword(password);
    }

    // Update user and roles
    const user = await prisma.user.update({
      where: { id },
      data: {
        ...updateData,
        userRoles: roleIds ? {
          deleteMany: {}, // Remove all existing roles
          create: roleIds.map((roleId: string) => ({
            roleId
          }))
        } : undefined
      },
      include: {
        userRoles: {
          include: {
            role: true
          }
        }
      }
    });

    // Remove unused password assignment
    return Response.json({
      ...user,
      password: undefined,
      roles: user.userRoles.map((ur) => ur.role)
    });
  } catch (error: unknown) {
    console.error('Error updating user:', error);
    return Response.json({ error: 'Failed to update user' }, { status: 500 });
  }
});

// DELETE /api/users/[id] - Delete a user
export const DELETE = requirePermission('users', 'delete')(async (request: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
  try {
    const resolvedParams = await params;
    const { id } = resolvedParams;

    const user = await prisma.user.findUnique({
      where: { id }
    });

    if (!user) {
      return Response.json({ error: 'User not found' }, { status: 404 });
    }

    await prisma.user.delete({
      where: { id }
    });

    return Response.json({ message: 'User deleted successfully' });
  } catch (error: unknown) {
    console.error('Error deleting user:', error);
    return Response.json({ error: 'Failed to delete user' }, { status: 500 });
  }
});
