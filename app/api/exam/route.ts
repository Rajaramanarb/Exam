import { NextResponse } from 'next/server';
import { createExam, getExams } from '@/lib/actions/exam.actions';
import { headers } from 'next/headers';

export async function POST(req: Request) {
  try {
    // Get the body
    const examData = await req.json();

    // Create the exam
    const newExam = await createExam(examData);

    // Respond with the newly created exam data
    return NextResponse.json(newExam, { status: 201 });
  } catch (error) {
    let errorMessage = 'Internal Server Error';

    if (error instanceof Error) {
      errorMessage = error.message;
    }

    return NextResponse.json({ message: errorMessage }, { status: 500 });
  }
}

export async function GET() {
  try {
    // Fetch the exams
    const exams = await getExams();

    // Respond with the list of exams
    return NextResponse.json(exams);
  } catch (error) {
    let errorMessage = 'Internal Server Error';

    if (error instanceof Error) {
      errorMessage = error.message;
    }

    return NextResponse.json({ message: errorMessage }, { status: 500 });
  }
}
