import { NextResponse } from 'next/server';
import { getLectures, addLecture } from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';

export async function GET() {
  try {
    const lectures = await getLectures();
    return NextResponse.json(lectures);
  } catch (_error) {
    return NextResponse.json(
      { error: 'Failed to fetch lectures' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const newLecture = {
      id: uuidv4(),
      enrolledStudents: [],
      ...body,
    };
    const lecture = await addLecture(newLecture);
    return NextResponse.json(lecture, { status: 201 });
  } catch (_error) {
    return NextResponse.json(
      { error: 'Failed to create lecture' },
      { status: 500 }
    );
  }
}
