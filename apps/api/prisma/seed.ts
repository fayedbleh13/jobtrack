import { PrismaPg } from '@prisma/adapter-pg';
import * as bcrypt from 'bcryptjs';
import { ApplicationStatus, PrismaClient } from '../src/generated/prisma/client';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const DAY = 24 * 60 * 60 * 1000;
const daysAgo = (days: number) => new Date(Date.now() - days * DAY);
const daysFromNow = (days: number) => new Date(Date.now() + days * DAY);

type ContactSeed = { name: string; role?: string; email?: string; linkedin?: string };
type ReminderSeed = { title: string; dueInDays: number; done?: boolean };

type ApplicationSeed = {
  company: string;
  role: string;
  location?: string;
  salaryMin?: number;
  salaryMax?: number;
  jobUrl?: string;
  source?: string;
  status: ApplicationStatus;
  priority?: number;
  notes?: string;
  appliedDaysAgo: number;
  reached: ApplicationStatus[];
  contacts?: ContactSeed[];
  reminders?: ReminderSeed[];
};

const applications: ApplicationSeed[] = [
  {
    company: 'Acme Corp',
    role: 'Senior Frontend Engineer',
    location: 'Remote',
    salaryMin: 120000,
    salaryMax: 150000,
    source: 'LinkedIn',
    status: ApplicationStatus.INTERVIEW,
    priority: 3,
    notes: 'Third round scheduled with the platform team.',
    appliedDaysAgo: 21,
    reached: [
      ApplicationStatus.WISHLIST,
      ApplicationStatus.APPLIED,
      ApplicationStatus.SCREENING,
      ApplicationStatus.INTERVIEW,
    ],
    contacts: [
      { name: 'Dana Reyes', role: 'Engineering Manager', email: 'dana.reyes@acme.test' },
      { name: 'Marco Silva', role: 'Tech Recruiter', linkedin: 'in/marcosilva' },
    ],
    reminders: [{ title: 'Send thank-you note after round 2', dueInDays: -1 }],
  },
  {
    company: 'Globex',
    role: 'Fullstack Developer',
    location: 'Berlin, DE',
    salaryMin: 70000,
    salaryMax: 85000,
    source: 'Referral',
    status: ApplicationStatus.SCREENING,
    priority: 2,
    appliedDaysAgo: 12,
    reached: [ApplicationStatus.WISHLIST, ApplicationStatus.APPLIED, ApplicationStatus.SCREENING],
    contacts: [{ name: 'Priya Nair', role: 'Head of Engineering', email: 'priya@globex.test' }],
    reminders: [{ title: 'Follow up on take-home prompt', dueInDays: 2 }],
  },
  {
    company: 'Initech',
    role: 'React Developer',
    location: 'Austin, TX',
    salaryMin: 95000,
    salaryMax: 110000,
    source: 'Company site',
    status: ApplicationStatus.OFFER,
    priority: 3,
    notes: 'Offer received — need to respond by Friday.',
    appliedDaysAgo: 34,
    reached: [
      ApplicationStatus.WISHLIST,
      ApplicationStatus.APPLIED,
      ApplicationStatus.SCREENING,
      ApplicationStatus.INTERVIEW,
      ApplicationStatus.OFFER,
    ],
    contacts: [{ name: 'Bill Lumbergh', role: 'Director', email: 'bill@initech.test' }],
    reminders: [{ title: 'Respond to offer', dueInDays: 3 }],
  },
  {
    company: 'Umbrella',
    role: 'Backend Engineer',
    location: 'Remote',
    salaryMin: 100000,
    salaryMax: 125000,
    source: 'LinkedIn',
    status: ApplicationStatus.REJECTED,
    appliedDaysAgo: 40,
    reached: [
      ApplicationStatus.APPLIED,
      ApplicationStatus.SCREENING,
      ApplicationStatus.INTERVIEW,
      ApplicationStatus.REJECTED,
    ],
    notes: 'Rejected after final round — good feedback on system design.',
  },
  {
    company: 'Stark Industries',
    role: 'Software Engineer',
    location: 'New York, NY',
    salaryMin: 130000,
    salaryMax: 160000,
    source: 'Referral',
    status: ApplicationStatus.APPLIED,
    priority: 3,
    appliedDaysAgo: 5,
    reached: [ApplicationStatus.WISHLIST, ApplicationStatus.APPLIED],
    reminders: [{ title: 'Check in with referrer', dueInDays: 5 }],
  },
  {
    company: 'Wayne Enterprises',
    role: 'Platform Engineer',
    location: 'Gotham',
    salaryMin: 115000,
    salaryMax: 140000,
    source: 'Job board',
    status: ApplicationStatus.WISHLIST,
    priority: 1,
    notes: 'Interesting infra role — tailor resume first.',
    appliedDaysAgo: 0,
    reached: [ApplicationStatus.WISHLIST],
  },
  {
    company: 'Soylent',
    role: 'Frontend Engineer',
    location: 'Remote',
    source: 'Job board',
    status: ApplicationStatus.GHOSTED,
    appliedDaysAgo: 55,
    reached: [ApplicationStatus.APPLIED, ApplicationStatus.SCREENING, ApplicationStatus.GHOSTED],
    notes: 'No response for three weeks after the screen.',
  },
  {
    company: 'Hooli',
    role: 'Fullstack Engineer',
    location: 'Palo Alto, CA',
    salaryMin: 140000,
    salaryMax: 175000,
    source: 'LinkedIn',
    status: ApplicationStatus.APPLIED,
    appliedDaysAgo: 8,
    reached: [ApplicationStatus.WISHLIST, ApplicationStatus.APPLIED],
    reminders: [{ title: 'Follow up with recruiter', dueInDays: -2 }],
  },
];

async function main() {
  const existingUsers = await prisma.user.count();
  if (existingUsers > 0) {
    console.log(`Seed skipped: ${existingUsers} user(s) already exist.`);
    return;
  }

  await prisma.reminder.deleteMany();
  await prisma.stageEvent.deleteMany();
  await prisma.contact.deleteMany();
  await prisma.application.deleteMany();
  await prisma.user.deleteMany();

  const passwordHash = await bcrypt.hash('password123', 10);

  const user = await prisma.user.create({
    data: {
      email: 'demo@jobtrack.dev',
      name: 'Demo User',
      passwordHash,
    },
  });

  for (const seed of applications) {
    const appliedAt =
      seed.reached.includes(ApplicationStatus.APPLIED) && seed.appliedDaysAgo > 0
        ? daysAgo(seed.appliedDaysAgo)
        : null;

    const application = await prisma.application.create({
      data: {
        userId: user.id,
        company: seed.company,
        role: seed.role,
        location: seed.location,
        salaryMin: seed.salaryMin,
        salaryMax: seed.salaryMax,
        jobUrl: seed.jobUrl,
        source: seed.source,
        status: seed.status,
        priority: seed.priority,
        appliedAt,
        notes: seed.notes,
      },
    });

    const step = Math.max(
      1,
      Math.floor(seed.appliedDaysAgo / Math.max(1, seed.reached.length - 1)),
    );
    let previous: ApplicationStatus | null = null;
    for (let i = 0; i < seed.reached.length; i += 1) {
      const current = seed.reached[i];
      if (!current) {
        continue;
      }
      const offset = Math.max(0, seed.appliedDaysAgo - i * step);
      await prisma.stageEvent.create({
        data: {
          applicationId: application.id,
          fromStatus: previous,
          toStatus: current,
          at: daysAgo(offset),
        },
      });
      previous = current;
    }

    for (const contact of seed.contacts ?? []) {
      await prisma.contact.create({
        data: {
          applicationId: application.id,
          name: contact.name,
          role: contact.role,
          email: contact.email,
          linkedin: contact.linkedin,
        },
      });
    }

    for (const reminder of seed.reminders ?? []) {
      await prisma.reminder.create({
        data: {
          applicationId: application.id,
          title: reminder.title,
          dueAt: daysFromNow(reminder.dueInDays),
          done: reminder.done ?? false,
        },
      });
    }
  }

  console.log(`Seeded ${applications.length} applications for ${user.email}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
