import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: {
        email: session.user.email,
      },
      select: {
        phone: true,
        name: true,
        email: true,
        personalBest: true,
        runningDays: true,
        shoes: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Convert runningDays from number to string for the form
    const userData = {
      ...user,
      runningDays: user.runningDays?.toString() || '',
    };

    return NextResponse.json(userData);
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user profile' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const userData = await request.json();

    // Convert runningDays from string to number for the database
    const runningDays = userData.runningDays ? parseInt(userData.runningDays, 10) : null;

    const updatedUser = await prisma.user.update({
      where: {
        email: session.user.email,
      },
      data: {
        phone: userData.phone,
        name: userData.name,
        personalBest: userData.personalBest,
        runningDays: runningDays,
        shoes: userData.shoes,
      },
      select: {
        phone: true,
        name: true,
        email: true,
        personalBest: true,
        runningDays: true,
        shoes: true,
      },
    });

    // Convert runningDays back to string for the response
    const responseData = {
      ...updatedUser,
      runningDays: updatedUser.runningDays?.toString() || '',
    };

    return NextResponse.json(responseData);
  } catch (error) {
    console.error('Error updating user profile:', error);
    return NextResponse.json(
      { error: 'Failed to update user profile' },
      { status: 500 }
    );
  }
} 