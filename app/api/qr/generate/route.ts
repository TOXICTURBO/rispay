import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/middleware';
import { z } from 'zod';
import { UserRole } from '@prisma/client';

const generateQRSchema = z.object({
  username: z.string().min(3).max(50),
});

/**
 * Generate QR code data for payment
 * Returns a data URL that encodes username for quick transfers
 */
export const POST = withAuth(async (req: NextRequest, user) => {
  const body = await req.json();
  const { username } = generateQRSchema.parse(body);

  // Format: rispay://transfer?username=<username>
  // This can be scanned to auto-fill recipient in send page
  const qrData = `rispay://transfer?username=${encodeURIComponent(username)}`;

  return NextResponse.json({
    success: true,
    qrData,
    username,
    displayUrl: `rispay://transfer?username=${username}`,
  });
}, [UserRole.USER, UserRole.PROVIDER, UserRole.ADMIN]);

/**
 * GET endpoint for public username to QR data
 * Does not require authentication (for sharing QR codes)
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const username = searchParams.get('username');

  if (!username) {
    return NextResponse.json(
      { error: 'Username required' },
      { status: 400 }
    );
  }

  const qrData = `rispay://transfer?username=${encodeURIComponent(username)}`;

  return NextResponse.json({
    success: true,
    qrData,
    username,
    displayUrl: `rispay://transfer?username=${username}`,
  });
}
