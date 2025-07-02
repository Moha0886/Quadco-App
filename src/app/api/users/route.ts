import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { AuthService, requirePermission } from "@/lib/auth";

export const GET = requirePermission('users', 'read')(async (request: NextRequest) => {
  try {
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '10');
    const search = url.searchParams.get('search') || '';

    const where = search ? {
      OR: [
        { email: { contains: search } },
        { username: { contains: search } },
        { firstName: { contains: search } },
        { lastName: { contains: search } },
      ]
    } : {};

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        include: {
          userRoles: {
            include: {
              role: true
            }
          }
        },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' }
      }),
      prisma.user.count({ where })
    ]);

    const usersWithRoles = users.map((user) => ({
      ...user,
      password: undefined, // Don't return password
      roles: user.userRoles.map((ur) => ur.role.name)
    }));

    return NextResponse.json({
      users: usersWithRoles,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error: unknown) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
});

export const POST = requirePermission('users', 'create')(async (request: NextRequest) => {
  try {
    const { email, username, firstName, lastName, password, roleIds, isActive = true } = await request.json();

    if (!email || !username || !firstName || !lastName || !password) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email },
          { username }
        ]
      }
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "User with this email or username already exists" },
        { status: 409 }
      );
    }

    const hashedPassword = await AuthService.hashPassword(password);

    const user = await prisma.user.create({
      data: {
        email,
        username,
        firstName,
        lastName,
        password: hashedPassword,
        isActive,
        userRoles: roleIds && roleIds.length > 0 ? {
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

    // Don't return password
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _, ...userWithoutPassword } = user;

    return NextResponse.json({
      user: {
        ...userWithoutPassword,
        roles: user.userRoles.map((ur) => ur.role.name)
      }
    }, { status: 201 });
  } catch (error: unknown) {
    console.error("Error creating user:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
});
