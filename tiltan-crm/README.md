# Tiltan CRM - Student & Lecture Management System

A modern CRM system built for Tiltan Design College to manage students, lectures, and instructors efficiently.

## Features

- **Dashboard** - Overview of key statistics and recent activity
- **Student Management** - Complete CRUD operations for student records
- **Lecture Management** - Schedule and manage lectures with enrollment tracking
- **Instructor Management** - Maintain instructor profiles and assignments
- **Enrollment System** - Register students to lectures with capacity management
- **Responsive Design** - Works seamlessly on desktop, tablet, and mobile devices

## Tech Stack

### Frontend
- **Next.js 14** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first CSS framework
- **shadcn/ui** - Beautiful component library
- **Lucide Icons** - Icon system

### Backend
- **Next.js API Routes** - Serverless API endpoints
- **LowDB** - Lightweight JSON database
- **Node.js** - JavaScript runtime

## Getting Started

### Prerequisites
- Node.js 18+ installed
- npm or yarn package manager

### Installation

1. Navigate to the project directory:
```bash
cd tiltan-crm
```

2. Install dependencies (if not already installed):
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Project Structure

```
tiltan-crm/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   │   ├── students/      # Student endpoints
│   │   ├── lectures/      # Lecture endpoints
│   │   └── instructors/   # Instructor endpoints
│   ├── students/          # Student pages
│   ├── lectures/          # Lecture pages
│   ├── instructors/       # Instructor pages
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Dashboard page
├── components/            # React components
│   ├── ui/               # shadcn/ui components
│   ├── navigation.tsx    # Navigation bar
│   └── student-form.tsx  # Student form component
├── lib/                   # Utility functions
│   ├── db.ts             # Database operations
│   ├── types.ts          # TypeScript types
│   └── utils.ts          # Helper functions
└── data/                  # Database files
    └── db.json           # JSON database
```

## Database Schema

The system uses a JSON-based database with three main collections:

### Students
- Personal information (name, email, phone)
- Program enrollment
- Status (active/inactive/graduated)
- Enrollment date
- Notes

### Lectures
- Title and description
- Instructor assignment
- Program/course
- Schedule (date, time, duration)
- Location
- Capacity and enrolled students

### Instructors
- Personal information
- Specialization
- Biography
- Contact details

## Available Programs

The system supports the following design programs:
- Graphic Design
- Interior Design
- Game Development
- 3D Design
- Multimedia
- Animation
- Illustration
- Copywriting

## API Endpoints

### Students
- `GET /api/students` - Get all students
- `POST /api/students` - Create new student
- `GET /api/students/[id]` - Get student by ID
- `PUT /api/students/[id]` - Update student
- `DELETE /api/students/[id]` - Delete student

### Lectures
- `GET /api/lectures` - Get all lectures
- `POST /api/lectures` - Create new lecture
- `GET /api/lectures/[id]` - Get lecture by ID
- `PUT /api/lectures/[id]` - Update lecture
- `DELETE /api/lectures/[id]` - Delete lecture

### Instructors
- `GET /api/instructors` - Get all instructors
- `POST /api/instructors` - Create new instructor

## Development

### Build for Production
```bash
npm run build
```

### Start Production Server
```bash
npm start
```

### Lint Code
```bash
npm run lint
```

## Documentation

For a comprehensive overview in Hebrew for non-technical users, open `project-documentation-he.html` in your browser.

## Future Enhancements

Potential features for future development:
- Email notifications for upcoming lectures
- Attendance tracking
- Grade management
- Payment processing
- Calendar integration (Google Calendar, Outlook)
- Advanced reporting and analytics
- Student portal with login system

## License

This project is built for Tiltan Design College.

## Support

For issues or questions, please contact the development team.
