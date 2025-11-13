import { NextResponse } from 'next/server';
import { getInstructors, addInstructor } from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';

export async function GET() {
  try {
    const instructors = await getInstructors();
    return NextResponse.json(instructors);
  } catch (_error) {
    return NextResponse.json(
      { error: 'Failed to fetch instructors' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const newInstructor = {
      id: uuidv4(),
      ...body,
    };
    const instructor = await addInstructor(newInstructor);
    return NextResponse.json(instructor, { status: 201 });
  } catch (_error) {
    return NextResponse.json(
      { error: 'Failed to create instructor' },
      { status: 500 }
    );
  }
}
