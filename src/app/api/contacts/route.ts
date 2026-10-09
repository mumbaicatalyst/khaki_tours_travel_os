import { NextRequest, NextResponse } from 'next/server';
import { appStore } from '@/lib/db/store';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const tag = searchParams.get('tag');
    const query = searchParams.get('q')?.toLowerCase().trim();

    let contacts = appStore.getContacts();

    if (tag && tag !== 'ALL') {
      contacts = contacts.filter((c) => (c.segment_tags || []).includes(tag));
    }

    if (query) {
      contacts = contacts.filter(
        (c) =>
          c.full_name.toLowerCase().includes(query) ||
          c.phone_number.includes(query) ||
          (c.email || '').toLowerCase().includes(query) ||
          (c.company || '').toLowerCase().includes(query)
      );
    }

    return NextResponse.json({
      success: true,
      count: contacts.length,
      contacts,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body.full_name || !body.phone_number) {
      return NextResponse.json(
        { error: 'Customer full name and phone number are required' },
        { status: 400 }
      );
    }

    const created = appStore.createContact(body);
    return NextResponse.json({ success: true, contact: created }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
