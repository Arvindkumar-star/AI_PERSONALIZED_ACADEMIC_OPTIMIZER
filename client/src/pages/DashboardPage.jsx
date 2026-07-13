import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import {
  CalendarDays,
  ClipboardCheck,
  FileText,
  Clock,
  CalendarRange,
  Sparkles,
} from 'lucide-react';
import { dashboardApi } from '@/services/endpoints';
import { apiError } from '@/services/api';
import { useToast } from '@/hooks/useToast';
import PageHeader from '@/components/PageHeader';
import { PageLoader } from '@/components/Spinner';
import StatCard from '@/components/StatCard';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const COLORS = ['#2563eb', '#16a34a', '#f59e0b', '#dc2626', '#7c3aed', '#0891b2'];

export default function DashboardPage() {
  const { toast } = useToast();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        setData(await dashboardApi.get());
      } catch (err) {
        toast(apiError(err), 'error');
      } finally {
        setLoading(false);
      }
    })();
  }, [toast]);

  if (loading) return <PageLoader />;
  if (!data) return null;

  const { cards, charts } = data;

  return (
    <div>
      <PageHeader title="Dashboard" description="Your semester at a glance." />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Today's classes"
          value={cards.todaysClasses.length}
          icon={CalendarDays}
        />
        <StatCard
          title="Subjects tracked"
          value={cards.attendance.length}
          icon={ClipboardCheck}
        />
        <StatCard
          title="Today's study"
          value={`${cards.todayStudyHours}h`}
          icon={Clock}
        />
        <StatCard
          title="Weekly study"
          value={`${cards.weeklyStudyHours}h`}
          icon={CalendarRange}
        />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Study hours (last 7 days)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={charts.studyHoursByDay}>
                <XAxis dataKey="day" tickFormatter={(d) => d.slice(0, 3)} fontSize={12} />
                <YAxis fontSize={12} />
                <Tooltip />
                <Bar dataKey="hours" fill="#2563eb" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Time by subject</CardTitle>
          </CardHeader>
          <CardContent>
            {charts.timeBySubject.length === 0 ? (
              <p className="py-16 text-center text-sm text-muted-foreground">
                No study data yet.
              </p>
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie
                    data={charts.timeBySubject}
                    dataKey="hours"
                    nameKey="subject"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                  >
                    {charts.timeBySubject.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend fontSize={12} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <CalendarDays className="h-4 w-4" /> Today's classes
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {cards.todaysClasses.length === 0 ? (
              <p className="text-sm text-muted-foreground">No classes today.</p>
            ) : (
              cards.todaysClasses.map((c) => (
                <div key={c._id} className="flex items-center justify-between text-sm">
                  <span className="font-medium">{c.subject}</span>
                  <span className="text-muted-foreground">
                    {c.startTime}–{c.endTime}
                  </span>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <FileText className="h-4 w-4" /> Upcoming exams
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {cards.upcomingExams.length === 0 ? (
              <p className="text-sm text-muted-foreground">No upcoming exams.</p>
            ) : (
              cards.upcomingExams.map((e) => (
                <div key={e._id} className="flex items-center justify-between text-sm">
                  <span className="font-medium">{e.subjectId?.name}</span>
                  <span className="text-muted-foreground">
                    {new Date(e.examDate).toLocaleDateString()}
                  </span>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Sparkles className="h-4 w-4" /> AI recommendations
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {cards.topPriorities.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Add subjects to see priorities.
              </p>
            ) : (
              cards.topPriorities.map((p) => (
                <div key={p.subjectId} className="flex items-center justify-between text-sm">
                  <span className="font-medium">{p.subject}</span>
                  <Badge variant="secondary">score {p.priority}</Badge>
                </div>
              ))
            )}
            <Link to="/ai-planner">
              <Button variant="outline" size="sm" className="mt-2 w-full">
                Open AI Planner
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {cards.attendance.length > 0 && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Attendance by subject</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={charts.attendanceBySubject}>
                <XAxis dataKey="subject" fontSize={12} />
                <YAxis domain={[0, 100]} fontSize={12} />
                <Tooltip />
                <Bar dataKey="percent" fill="#16a34a" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
