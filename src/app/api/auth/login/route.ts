import { NextRequest, NextResponse } from 'next/server';

const AUTHORIZED_USERS: Record<string, { name: string; role: string; email: string }> = {
  'bharat@khakitours.com': {
    name: 'Bharat Gothoskar (Founder & CEO)',
    role: 'MASTER_OPS',
    email: 'bharat@khakitours.com',
  },
  'priya@khakitours.com': {
    name: 'Priya S. (Ops Lead)',
    role: 'GUEST_CONCIERGE',
    email: 'priya@khakitours.com',
  },
  'kaevan@khakitours.com': {
    name: 'Kaevan Umrigar (Marketing & Growth Lead)',
    role: 'MARKETING_GROWTH',
    email: 'kaevan@khakitours.com',
  },
  'farhan@khakitours.com': {
    name: 'Farhan K. (Dispatch Coordinator)',
    role: 'FIELD_DISPATCH',
    email: 'farhan@khakitours.com',
  },
  'ops@khakitours.com': {
    name: 'Operations Command Master',
    role: 'MASTER_OPS',
    email: 'ops@khakitours.com',
  },
};

const VALID_PASSWORDS = ['khaki2026!', 'khaki@2026', 'khakitours', 'admin123'];

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    const normalizedEmail = (email || '').trim().toLowerCase();
    const cleanPassword = (password || '').trim();

    // Validate password
    const isPasswordValid = VALID_PASSWORDS.includes(cleanPassword);
    if (!isPasswordValid) {
      return NextResponse.json(
        { success: false, error: 'Incorrect password. Please verify with Khaki Tours Operations.' },
        { status: 401 }
      );
    }

    // Lookup user or support any valid domain email
    let user = AUTHORIZED_USERS[normalizedEmail];
    if (!user) {
      if (normalizedEmail.endsWith('@khakitours.com') || normalizedEmail.includes('khaki')) {
        const username = normalizedEmail.split('@')[0];
        user = {
          name: `${username.charAt(0).toUpperCase() + username.slice(1)} (Staff)`,
          role: 'MASTER_OPS',
          email: normalizedEmail,
        };
      } else {
        // Fallback for custom emails entered by admin
        user = {
          name: normalizedEmail.split('@')[0] || 'Khaki Team Member',
          role: 'MASTER_OPS',
          email: normalizedEmail,
        };
      }
    }

    // Create session token
    const tokenPayload = {
      email: user.email,
      name: user.name,
      role: user.role,
      issuedAt: Date.now(),
    };
    const sessionToken = Buffer.from(JSON.stringify(tokenPayload)).toString('base64');

    const res = NextResponse.json({
      success: true,
      user,
    });

    // Set cookie for 30 days
    res.cookies.set('khaki_auth_token', sessionToken, {
      httpOnly: false, // Accessible to client scripts if needed
      path: '/',
      maxAge: 30 * 24 * 60 * 60, // 30 days
      sameSite: 'lax',
    });

    return res;
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
