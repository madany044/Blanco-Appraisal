# Blanco Steel — Employee Progress Report Card

Salary Appraisal System for **Blanco Steel Detailing Services Private Limited** — FY 2026–27.

## Tech Stack

- **Next.js 14** (App Router, TypeScript)
- **Supabase** (PostgreSQL + Auth + Storage-ready)
- **Prisma** ORM
- **React Hook Form** + **Zod**
- **Tailwind CSS** + **shadcn/ui** components
- **@react-pdf/renderer** (PDF export)
- **xlsx** (Excel export)

## Setup

### 1. Install dependencies

```bash
cd blanco-appraisal
npm install
```

### 2. Configure environment

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
DATABASE_URL=postgresql://postgres:[password]@db.[ref].supabase.co:5432/postgres
DIRECT_URL=postgresql://postgres:[password]@db.[ref].supabase.co:5432/postgres
```

### 3. Database

```bash
npx prisma db push
```

Run RLS policies in Supabase SQL Editor:

```bash
# Contents of supabase/rls-policies.sql
```

### 4. Seed users, managers, and slabs

```bash
npm run db:seed
```


### 5. Run development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Workflow

| Stage | Description |
|-------|-------------|
| -1 | Employee draft |
| 0 | Submitted — pending HR |
| 1 | HR complete — with Manager |
| 2 | Manager complete — with Management |
| 3 | Management complete — returned to HR |
| 4 | Archived / completed |

## Routes

### Public
- `/` — Role selection
- `/employee` — Category selection
- `/employee/group-a|group-b|group-c|qc` — Appraisal forms
- `/login` — Staff login

### Protected
- `/hr` — HR dashboard
- `/hr/submissions/[id]` — HR review
- `/hr/exports` — PDF/Excel export
- `/hr/reports` — Analytics
- `/manager` — Manager dashboard
- `/manager/[id]` — Manager remarks
- `/management` — Management dashboard
- `/management/[id]` — Salary decision


### Blanco Steel Detailing Services Private Limited 

No 3051 SPYR Arcade 2nd Floor Ring Road,  
Near Mahamane Circle Dattagalli 3rd Stage,  
Mysore-570023, Karnataka.

**Designed & Developed By Madan Y** 
