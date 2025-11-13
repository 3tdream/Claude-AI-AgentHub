# Project Templates

Starter templates and boilerplates for quick project initialization.

## Available Templates

### 📱 Frontend Templates

#### Next.js + TypeScript + Tailwind
Full-stack Next.js application with TypeScript and Tailwind CSS.

**Features:**
- Next.js 15+ with App Router
- TypeScript configuration
- Tailwind CSS with design tokens
- ESLint and Prettier setup
- Shared component library integration

#### React + Vite + TypeScript
Modern React application with Vite.

**Features:**
- Vite for fast development
- TypeScript support
- React Router setup
- Tailwind CSS
- Component library ready

### 🔧 Backend Templates

#### Express + TypeScript API
RESTful API with Express and TypeScript.

**Features:**
- Express.js server
- TypeScript configuration
- Database connection setup
- Authentication middleware
- Error handling
- API documentation

#### Fastify + Prisma
High-performance API with Fastify and Prisma ORM.

**Features:**
- Fastify framework
- Prisma ORM
- Schema validation
- Type-safe database queries

### 🎨 Full-Stack Templates

#### MERN Stack
MongoDB + Express + React + Node.js full-stack application.

#### Next.js Full-Stack
Complete Next.js application with API routes and database.

## Using Templates

### Quick Start:
```bash
# Copy template to new project
cp -r _shared/templates/nextjs-template my-new-project

# Navigate to project
cd my-new-project

# Install dependencies
npm install

# Start development
npm run dev
```

### Customize:
1. Update `package.json` with your project name
2. Configure environment variables
3. Update README with project details
4. Modify configuration files as needed

## Template Structure

Each template includes:
- `package.json` - Dependencies and scripts
- `tsconfig.json` - TypeScript configuration
- `.eslintrc.json` - ESLint rules
- `.prettierrc` - Prettier configuration
- `README.md` - Template documentation
- `src/` - Source code structure
- `.env.example` - Environment variables template

## Creating New Templates

1. Create new directory in `/templates`
2. Set up base project structure
3. Add configuration files
4. Create README with setup instructions
5. Test template initialization
6. Document in this README

## Best Practices

- Keep templates minimal and focused
- Use shared configs from `/_shared/configs`
- Include comprehensive README
- Provide example code
- Document all dependencies
- Keep templates updated

---

**Last Updated**: 2025-11-12
