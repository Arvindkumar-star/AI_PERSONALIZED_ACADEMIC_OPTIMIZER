import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  Sparkles,
  CalendarDays,
  ClipboardCheck,
  Timer,
  Brain,
  GraduationCap,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

const FEATURES = [
  { icon: CalendarDays, title: 'Semester & Timetable', desc: 'Organize subjects, credits and weekly classes in one place.' },
  { icon: ClipboardCheck, title: 'Attendance & Exams', desc: 'Track attendance %, know how many classes you can skip, plan exams.' },
  { icon: Timer, title: 'Study Sessions', desc: 'Start/stop focused study timers and review your weekly hours.' },
  { icon: Brain, title: 'AI Planner', desc: 'Personalized daily plans, subject priorities and life optimization.' },
];

export default function LandingPage() {
  const { user } = useSelector((s) => s.auth);

  return (
    <div className="min-h-screen bg-background">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
        <div className="flex items-center gap-2">
          <Sparkles className="h-6 w-6 text-primary" />
          <span className="text-lg font-bold">AI Academic OS</span>
        </div>
        <div className="flex items-center gap-2">
          {user ? (
            <Button asChild={false}>
              <Link to="/dashboard">Go to Dashboard</Link>
            </Button>
          ) : (
            <>
              <Link to="/login">
                <Button variant="ghost">Login</Button>
              </Link>
              <Link to="/register">
                <Button>Get Started</Button>
              </Link>
            </>
          )}
        </div>
      </header>

      <section className="mx-auto max-w-4xl px-6 py-20 text-center">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border px-3 py-1 text-sm text-muted-foreground">
          <GraduationCap className="h-4 w-4" /> Your semester, organized by AI
        </div>
        <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">
          The AI operating system for your college life
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-lg text-muted-foreground">
          Manage subjects, attendance, exams and study sessions — then let the AI
          build realistic study plans from your real data.
        </p>
        <div className="mt-8 flex justify-center gap-3">
          <Link to={user ? '/dashboard' : '/register'}>
            <Button size="lg">{user ? 'Open Dashboard' : 'Start free'}</Button>
          </Link>
          <Link to="/login">
            <Button size="lg" variant="outline">
              I have an account
            </Button>
          </Link>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-4 px-6 pb-24 sm:grid-cols-2 lg:grid-cols-4">
        {FEATURES.map((f) => (
          <Card key={f.title}>
            <CardContent className="p-6">
              <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <f.icon className="h-5 w-5" />
              </div>
              <h3 className="font-semibold">{f.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{f.desc}</p>
            </CardContent>
          </Card>
        ))}
      </section>
    </div>
  );
}
