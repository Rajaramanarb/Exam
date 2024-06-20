import { NextResponse } from 'next/server';
import { getLicense } from '@/lib/actions/license.actions';

export async function GET() {
  try {
    const license = await getLicense();
    return NextResponse.json(license, { status: 200 });
  } catch (error) {
    console.error(error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
