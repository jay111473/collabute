import { NextRequest, NextResponse } from 'next/server';

// In-memory store for authentication status tracking
// In production, you'd use Redis or a database
const authStatusStore = new Map<string, {
  status: 'pending' | 'success' | 'error';
  userId?: string;
  error?: string;
  timestamp: number;
}>();

// Clean up old entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  const fiveMinutesAgo = now - (5 * 60 * 1000);
  
  for (const [key, value] of authStatusStore.entries()) {
    if (value.timestamp < fiveMinutesAgo) {
      authStatusStore.delete(key);
    }
  }
}, 5 * 60 * 1000);

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const statusId = searchParams.get('statusId');

    if (!statusId) {
      return NextResponse.json(
        { error: 'Missing statusId parameter' },
        { status: 400 }
      );
    }

    const authStatus = authStatusStore.get(statusId);
    
    if (!authStatus) {
      return NextResponse.json(
        { status: 'pending' },
        { status: 200 }
      );
    }

    // If status is success or error, clean it up after returning
    if (authStatus.status !== 'pending') {
      authStatusStore.delete(statusId);
    }

    return NextResponse.json({
      status: authStatus.status,
      userId: authStatus.userId,
      error: authStatus.error
    });

  } catch (error) {
    console.error('Error checking GitHub auth status:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Helper function to set auth status (used by callback route)
export function setAuthStatus(statusId: string, status: {
  status: 'pending' | 'success' | 'error';
  userId?: string;
  error?: string;
}) {
  if (!statusId || typeof statusId !== 'string') {
    console.error('Invalid statusId provided to setAuthStatus');
    return;
  }

  authStatusStore.set(statusId, {
    ...status,
    timestamp: Date.now()
  });
  
  console.log(`GitHub auth status updated: ${statusId} -> ${status.status}`);
}