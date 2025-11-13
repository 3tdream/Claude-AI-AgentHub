export type StudentStatus = 'active' | 'inactive' | 'graduated';

export type Program =
  | 'Graphic Design'
  | 'Interior Design'
  | 'Game Development'
  | '3D Design'
  | 'Multimedia'
  | 'Animation'
  | 'Illustration'
  | 'Copywriting';

export interface Student {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  program: Program;
  enrollmentDate: string;
  status: StudentStatus;
  notes?: string;
}

export interface Instructor {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  specialization: string;
  bio?: string;
}

export interface Lecture {
  id: string;
  title: string;
  description: string;
  instructorId: string;
  program: Program;
  date: string;
  time: string;
  duration: number; // in minutes
  location: string;
  capacity: number;
  enrolledStudents: string[]; // student IDs
}

export interface Database {
  students: Student[];
  instructors: Instructor[];
  lectures: Lecture[];
}
