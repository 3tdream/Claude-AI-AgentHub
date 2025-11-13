import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getInstructors, getLectures } from '@/lib/db';
import { Plus, Mail, Phone } from 'lucide-react';

export default async function InstructorsPage() {
  const instructors = await getInstructors();
  const lectures = await getLectures();

  const getLectureCount = (instructorId: string) => {
    return lectures.filter((l) => l.instructorId === instructorId).length;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Instructors</h1>
          <p className="text-muted-foreground">
            Manage instructor profiles and assignments
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Instructor
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {instructors.length === 0 ? (
          <div className="col-span-full text-center py-12">
            No instructors found
          </div>
        ) : (
          instructors.map((instructor) => (
            <Card key={instructor.id}>
              <CardHeader>
                <CardTitle>
                  {instructor.firstName} {instructor.lastName}
                </CardTitle>
                <CardDescription>{instructor.specialization}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Mail className="h-4 w-4" />
                    {instructor.email}
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Phone className="h-4 w-4" />
                    {instructor.phone}
                  </div>
                </div>
                {instructor.bio && (
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {instructor.bio}
                  </p>
                )}
                <div className="pt-2 border-t">
                  <p className="text-sm">
                    <span className="font-medium">{getLectureCount(instructor.id)}</span> lectures assigned
                  </p>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
