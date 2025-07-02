import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { AuthService } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const user = await AuthService.getCurrentUser(request);
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { currentPassword, newPassword } = await request.json();

    if (!currentPassword || !newPassword) {
      return Response.json({ 
        error: 'Current password and new password are required' 
      }, { status: 400 });
    }

    if (newPassword.length < 6) {
      return Response.json({ 
        error: 'New password must be at least 6 characters long' 
      }, { status: 400 });
    }

    // Get the user's current password hash
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { password: true }
    });

    if (!dbUser) {
      return Response.json({ error: 'User not found' }, { status: 404 });
    }

    // Verify current password
    const isCurrentPasswordValid = await AuthService.comparePassword(
      currentPassword, 
      dbUser.password
    );

    if (!isCurrentPasswordValid) {
      return Response.json({ error: 'Current password is incorrect' }, { status: 400 });
    }

    // Hash new password
    const hashedNewPassword = await AuthService.hashPassword(newPassword);

    // Update password in database
    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedNewPassword }
    });

    return Response.json({ message: 'Password changed successfully' });
  } catch (error: unknown) {
    console.error('Error changing password:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}
