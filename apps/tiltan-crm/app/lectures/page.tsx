import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { getLectures, getInstructors } from '@/lib/db';
import { formatDate, formatTime, getProgramColor } from '@/lib/utils';
import { Plus, Eye } from 'lucide-react';

export default async function LecturesPage() {
  const lectures = await getLectures();
  const instructors = await getInstructors();

  const getInstructorName = (instructorId: string) => {
    const instructor = instructors.find((i) => i.id === instructorId);
    return instructor ? `${instructor.firstName} ${instructor.lastName}` : 'Unknown';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Lectures</h1>
          <p className="text-muted-foreground">
            Manage lecture schedules and enrollments
          </p>
        </div>
        <Link href="/lectures/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Lecture
          </Button>
        </Link>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Program</TableHead>
              <TableHead>Instructor</TableHead>
              <TableHead>Date & Time</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Enrollment</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {lectures.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center">
                  No lectures found
                </TableCell>
              </TableRow>
            ) : (
              lectures.map((lecture) => (
                <TableRow key={lecture.id}>
                  <TableCell className="font-medium">
                    {lecture.title}
                  </TableCell>
                  <TableCell>
                    <Badge className={getProgramColor(lecture.program)}>
                      {lecture.program}
                    </Badge>
                  </TableCell>
                  <TableCell>{getInstructorName(lecture.instructorId)}</TableCell>
                  <TableCell>
                    {formatDate(lecture.date)} at {formatTime(lecture.time)}
                  </TableCell>
                  <TableCell>{lecture.location}</TableCell>
                  <TableCell>
                    {lecture.enrolledStudents.length}/{lecture.capacity}
                  </TableCell>
                  <TableCell className="text-right">
                    <Link href={`/lectures/${lecture.id}`}>
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </Link>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
