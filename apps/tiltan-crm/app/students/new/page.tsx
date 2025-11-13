import { StudentForm } from '@/components/student-form';

export default function NewStudentPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Add New Student</h1>
        <p className="text-muted-foreground">
          Create a new student record
        </p>
      </div>

      <StudentForm mode="create" />
    </div>
  );
}
