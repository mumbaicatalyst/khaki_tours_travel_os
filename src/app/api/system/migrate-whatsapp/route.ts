import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { supabaseAdmin } from '@/lib/supabase/client';

export const dynamic = 'force-dynamic';

export async function GET() {
  return runMigration();
}

export async function POST() {
  return runMigration();
}

async function runMigration() {
  const migrationPath = path.join(process.cwd(), 'docs', 'migrations', '002_whatsapp_crm.sql');
  const sql = fs.readFileSync(migrationPath, 'utf-8');

  try {
    // Try via RPC exec_sql if configured
    const { data, error } = await supabaseAdmin.rpc('exec_sql', { sql_query: sql });

    if (error) {
      // If exec_sql RPC does not exist, check if tables already exist or report instructions
      const { error: tableCheckError } = await supabaseAdmin.from('whatsapp_conversations').select('id').limit(1);

      if (!tableCheckError) {
        return NextResponse.json({
          success: true,
          status: 'TABLES_ALREADY_EXIST',
          message: 'WhatsApp tables (whatsapp_conversations, whatsapp_messages, whatsapp_templates) are active in Supabase!',
        });
      }

      return NextResponse.json({
        success: false,
        status: 'MANUAL_SQL_REQUIRED',
        message: 'Please run docs/migrations/002_whatsapp_crm.sql in your Supabase SQL Editor once.',
        sql,
        error: error.message,
      });
    }

    return NextResponse.json({
      success: true,
      status: 'MIGRATED',
      message: 'WhatsApp CRM tables successfully created in Supabase!',
      data,
    });
  } catch (err: any) {
    return NextResponse.json({
      success: false,
      error: err.message,
      message: 'Migration file available at docs/migrations/002_whatsapp_crm.sql',
    }, { status: 500 });
  }
}
