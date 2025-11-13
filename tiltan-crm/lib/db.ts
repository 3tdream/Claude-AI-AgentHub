import { Low } from 'lowdb';
import { JSONFilePreset } from 'lowdb/node';
import { Database, Student, Instructor, Lecture } from './types';

const defaultData: Database = {
  students: [],
  instructors: [],
  lectures: [],
};

let db: Low<Database> | null = null;

export async function getDb(): Promise<Low<Database>> {
  if (!db) {
    // Use JSONFilePreset which handles initialization automatically
    db = await JSONFilePreset<Database>('./data/db.json', defaultData);
  }

  return db;
}

// Helper functions for CRUD operations
export async function getStudents() {
  const database = await getDb();
  return database.data.students;
}

export async function getStudentById(id: string) {
  const database = await getDb();
  return database.data.students.find((s) => s.id === id);
}

export async function addStudent(student: Student) {
  const database = await getDb();
  database.data.students.push(student);
  await database.write();
  return student;
}

export async function updateStudent(id: string, updates: Partial<Student>) {
  const database = await getDb();
  const index = database.data.students.findIndex((s) => s.id === id);
  if (index === -1) return null;

  database.data.students[index] = { ...database.data.students[index], ...updates };
  await database.write();
  return database.data.students[index];
}

export async function deleteStudent(id: string) {
  const database = await getDb();
  const index = database.data.students.findIndex((s) => s.id === id);
  if (index === -1) return false;

  database.data.students.splice(index, 1);
  await database.write();
  return true;
}

// Instructor operations
export async function getInstructors() {
  const database = await getDb();
  return database.data.instructors;
}

export async function getInstructorById(id: string) {
  const database = await getDb();
  return database.data.instructors.find((i) => i.id === id);
}

export async function addInstructor(instructor: Instructor) {
  const database = await getDb();
  database.data.instructors.push(instructor);
  await database.write();
  return instructor;
}

export async function updateInstructor(id: string, updates: Partial<Instructor>) {
  const database = await getDb();
  const index = database.data.instructors.findIndex((i) => i.id === id);
  if (index === -1) return null;

  database.data.instructors[index] = { ...database.data.instructors[index], ...updates };
  await database.write();
  return database.data.instructors[index];
}

export async function deleteInstructor(id: string) {
  const database = await getDb();
  const index = database.data.instructors.findIndex((i) => i.id === id);
  if (index === -1) return false;

  database.data.instructors.splice(index, 1);
  await database.write();
  return true;
}

// Lecture operations
export async function getLectures() {
  const database = await getDb();
  return database.data.lectures;
}

export async function getLectureById(id: string) {
  const database = await getDb();
  return database.data.lectures.find((l) => l.id === id);
}

export async function addLecture(lecture: Lecture) {
  const database = await getDb();
  database.data.lectures.push(lecture);
  await database.write();
  return lecture;
}

export async function updateLecture(id: string, updates: Partial<Lecture>) {
  const database = await getDb();
  const index = database.data.lectures.findIndex((l) => l.id === id);
  if (index === -1) return null;

  database.data.lectures[index] = { ...database.data.lectures[index], ...updates };
  await database.write();
  return database.data.lectures[index];
}

export async function deleteLecture(id: string) {
  const database = await getDb();
  const index = database.data.lectures.findIndex((l) => l.id === id);
  if (index === -1) return false;

  database.data.lectures.splice(index, 1);
  await database.write();
  return true;
}

// Enrollment operations
export async function enrollStudent(lectureId: string, studentId: string) {
  const database = await getDb();
  const lecture = database.data.lectures.find((l) => l.id === lectureId);

  if (!lecture) return { success: false, message: 'Lecture not found' };
  if (lecture.enrolledStudents.includes(studentId)) {
    return { success: false, message: 'Student already enrolled' };
  }
  if (lecture.enrolledStudents.length >= lecture.capacity) {
    return { success: false, message: 'Lecture is at full capacity' };
  }

  lecture.enrolledStudents.push(studentId);
  await database.write();
  return { success: true, message: 'Student enrolled successfully' };
}

export async function unenrollStudent(lectureId: string, studentId: string) {
  const database = await getDb();
  const lecture = database.data.lectures.find((l) => l.id === lectureId);

  if (!lecture) return { success: false, message: 'Lecture not found' };

  const index = lecture.enrolledStudents.indexOf(studentId);
  if (index === -1) {
    return { success: false, message: 'Student not enrolled in this lecture' };
  }

  lecture.enrolledStudents.splice(index, 1);
  await database.write();
  return { success: true, message: 'Student unenrolled successfully' };
}
