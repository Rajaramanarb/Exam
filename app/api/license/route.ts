// app/api/license/route.ts
import { NextResponse } from 'next/server';
import { getLicense } from '@/lib/actions/license.actions';

export async function GET() {
  try {
    const license = await getLicense();
    return NextResponse.json(license);
  } catch (error) {
    let errorMessage = 'Internal Server Error';
    
    if (error instanceof Error) {
      errorMessage = error.message;
    }

    return NextResponse.json({ message: errorMessage }, { status: 500 });
  }
}
