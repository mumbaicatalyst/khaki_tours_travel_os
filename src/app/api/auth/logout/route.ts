import { NextResponse } from 'next/server';

export async function POST() {
  const res = NextResponse.json({ success: true, message: 'Logged out successfully' });
  res.cookies.set('khaki_auth_token', '', {
    httpOnly: false,
    path: '/',
    maxAge: 0,
  });
  return res;
}
