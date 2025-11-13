import { NextResponse } from 'next/server';
import { getStudents, addStudent } from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';

export async function GET() {
  try {
    const students = await getStudents();
    return NextResponse.json(students);
  } catch (_error) {
    return NextResponse.json(
      { error: 'Failed to fetch students' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const newStudent = {
      id: uuidv4(),
      ...body,
    };
    const student = await addStudent(newStudent);
    return NextResponse.json(student, { status: 201 });
  } catch (_error) {
    return NextResponse.json(
      { error: 'Failed to create student' },
      { status: 500 }
    );
  }
}
