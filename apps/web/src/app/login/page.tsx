import { CheckCircle2 } from 'lucide-react';
import { LoginForm } from '@/features/auth/login-form';

const HIGHLIGHTS = [
  'Every stage, from wishlist to offer',
  'A timeline of how each application actually moved',
  'Analytics derived from that history, not a counter',
];

export default function LoginPage() {
  return (
    <main className="grid min-h-dvh lg:grid-cols-[1.1fr_1fr]">
      <section className="relative hidden flex-col justify-between overflow-hidden bg-primary p-12 text-primary-foreground lg:flex">
        <div
          aria-hidden
          className="pointer-events-none absolute -top-32 -right-24 size-96 rounded-full bg-white/10 blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-40 -left-24 size-96 rounded-full bg-black/20 blur-3xl"
        />

        <div className="relative flex items-center gap-2 text-lg font-semibold tracking-tight">
          <span className="flex size-9 items-center justify-center rounded-lg bg-white/15 text-sm font-bold">
            JT
          </span>
          JobTrack
        </div>

        <div className="relative flex max-w-md flex-col gap-6">
          <h1 className="text-4xl leading-tight font-semibold tracking-tight">
            A job search you can actually reason about.
          </h1>
          <ul className="flex flex-col gap-3 text-sm text-primary-foreground/85">
            {HIGHLIGHTS.map((item) => (
              <li key={item} className="flex items-start gap-2">
                <CheckCircle2 aria-hidden className="mt-0.5 size-4 shrink-0" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        <p className="relative text-xs text-primary-foreground/60">
          Built with Next.js, NestJS GraphQL and Postgres.
        </p>
      </section>

      <section className="flex flex-col items-center justify-center gap-8 p-6 sm:p-10">
        <div className="flex items-center gap-2 text-lg font-semibold tracking-tight lg:hidden">
          <span className="flex size-9 items-center justify-center rounded-lg bg-primary text-sm font-bold text-primary-foreground">
            JT
          </span>
          JobTrack
        </div>

        <LoginForm />
      </section>
    </main>
  );
}
