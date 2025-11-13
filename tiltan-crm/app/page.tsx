import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  getStudents,
  getLectures,
  getInstructors,
} from '@/lib/db';
import { formatDate, formatTime, getProgramColor } from '@/lib/utils';
import { GraduationCap, BookOpen, Users, ArrowRight } from 'lucide-react';

export default async function Home() {
  const students = await getStudents();
  const lectures = await getLectures();
  const instructors = await getInstructors();

  const activeStudents = students.filter((s) => s.status === 'active').length;
  const upcomingLectures = lectures.filter(
    (l) => new Date(l.date) >= new Date()
  ).length;

  // Get recent students (last 5)
  const recentStudents = [...students]
    .sort((a, b) =>
      new Date(b.enrollmentDate).getTime() - new Date(a.enrollmentDate).getTime()
    )
    .slice(0, 5);

  // Get upcoming lectures (next 5)
  const sortedLectures = [...lectures]
    .filter((l) => new Date(l.date) >= new Date())
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 5);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome to Tiltan CRM - Manage students, lectures, and instructors
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{students.length}</div>
            <p className="text-xs text-muted-foreground">
              {activeStudents} active students
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Lectures</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{lectures.length}</div>
            <p className="text-xs text-muted-foreground">
              {upcomingLectures} upcoming
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Instructors</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{instructors.length}</div>
            <p className="text-xs text-muted-foreground">Active instructors</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Data */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Recent Students */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Students</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentStudents.map((student) => (
                <div
                  key={student.id}
                  className="flex items-center justify-between"
                >
                  <div className="space-y-1">
                    <p className="font-medium">
                      {student.firstName} {student.lastName}
                    </p>
                    <div className="flex items-center gap-2">
                      <Badge className={getProgramColor(student.program)}>
                        {student.program}
                      </Badge>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {formatDate(student.enrollmentDate)}
                  </p>
                </div>
              ))}
              <Link href="/students">
                <Button variant="outline" className="w-full">
                  View All Students
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Lectures */}
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Lectures</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {sortedLectures.map((lecture) => (
                <div
                  key={lecture.id}
                  className="flex items-start justify-between"
                >
                  <div className="space-y-1">
                    <p className="font-medium">{lecture.title}</p>
                    <div className="flex items-center gap-2">
                      <Badge className={getProgramColor(lecture.program)}>
                        {lecture.program}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {lecture.enrolledStudents.length}/{lecture.capacity} enrolled
                      </span>
                    </div>
                  </div>
                  <div className="text-right text-sm text-muted-foreground">
                    <p>{formatDate(lecture.date)}</p>
                    <p>{formatTime(lecture.time)}</p>
                  </div>
                </div>
              ))}
              <Link href="/lectures">
                <Button variant="outline" className="w-full">
                  View All Lectures
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
