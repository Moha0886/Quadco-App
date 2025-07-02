import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { NextRequest } from 'next/server';
import { prisma } from './prisma';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const SALT_ROUNDS = 10;

export interface UserPayload {
  id: string;
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  roles: string[];
  permissions: string[];
}

export class AuthService {
  static async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, SALT_ROUNDS);
  }

  static async comparePassword(password: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
  }

  static generateToken(payload: UserPayload): string {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: '24h' });
  }

  static verifyToken(token: string): UserPayload | null {
    try {
      return jwt.verify(token, JWT_SECRET) as UserPayload;
    } catch {
      return null;
    }
  }

  static async getUserWithRolesAndPermissions(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
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

    if (!user) return null;

    const roles = user.userRoles.map((ur) => ur.role.name);
    const permissions = user.userRoles.flatMap((ur) => 
      ur.role.rolePermissions.map((rp) => `${rp.permission.resource}:${rp.permission.action}`)
    );

    return {
      ...user,
      roles: [...new Set(roles)] as string[],
      permissions: [...new Set(permissions)] as string[]
    };
  }

  static async authenticateUser(email: string, password: string) {
    const user = await prisma.user.findUnique({
      where: { email },
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

    if (!user || !user.isActive) {
      return null;
    }

    const isPasswordValid = await this.comparePassword(password, user.password);
    if (!isPasswordValid) {
      return null;
    }

    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() }
    });

    const roles = user.userRoles.map((ur) => ur.role.name);
    const permissions = user.userRoles.flatMap((ur) => 
      ur.role.rolePermissions.map((rp) => `${rp.permission.resource}:${rp.permission.action}`)
    );

    return {
      id: user.id,
      email: user.email,
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
      roles: [...new Set(roles)] as string[],
      permissions: [...new Set(permissions)] as string[]
    };
  }

  static extractTokenFromRequest(request: NextRequest): string | null {
    const authHeader = request.headers.get('authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      return authHeader.substring(7);
    }

    // Also check cookies for web sessions
    const token = request.cookies.get('auth-token')?.value;
    return token || null;
  }

  static async getCurrentUser(request: NextRequest): Promise<UserPayload | null> {
    const token = this.extractTokenFromRequest(request);
    if (!token) return null;

    const payload = this.verifyToken(token);
    if (!payload) return null;

    // Verify user still exists and is active
    const user = await prisma.user.findUnique({
      where: { id: payload.id, isActive: true }
    });

    return user ? payload : null;
  }
}

export class PermissionService {
  static hasPermission(userPermissions: string[], resource: string, action: string): boolean {
    const permission = `${resource}:${action}`;
    return userPermissions.includes(permission) || userPermissions.includes('*:*');
  }

  static hasRole(userRoles: string[], role: string): boolean {
    return userRoles.includes(role) || userRoles.includes('admin');
  }

  static canAccessResource(userPermissions: string[], userRoles: string[], resource: string, action: string): boolean {
    // Admin role has access to everything
    if (userRoles.includes('admin')) {
      return true;
    }

    return this.hasPermission(userPermissions, resource, action);
  }
}

// Type for API route context
interface ApiContext {
  user?: UserPayload;
  params?: { [key: string]: string };
  [key: string]: unknown;
}

// Middleware helper for API routes
export function requireAuth(handler: (request: NextRequest, context: ApiContext) => Promise<Response>) {
  return async (request: NextRequest, context: ApiContext) => {
    const user = await AuthService.getCurrentUser(request);
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Add user to context
    context.user = user;
    return handler(request, context);
  };
}

export function requirePermission(resource: string, action: string) {
  return function(handler: (request: NextRequest, context: ApiContext) => Promise<Response>) {
    return async (request: NextRequest, context: ApiContext) => {
      const user = await AuthService.getCurrentUser(request);
      if (!user) {
        return Response.json({ error: 'Unauthorized' }, { status: 401 });
      }

      if (!PermissionService.canAccessResource(user.permissions, user.roles, resource, action)) {
        return Response.json({ error: 'Forbidden' }, { status: 403 });
      }

      context.user = user;
      return handler(request, context);
    };
  };
}
