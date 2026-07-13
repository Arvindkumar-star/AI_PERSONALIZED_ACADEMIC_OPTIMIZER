import { useEffect, useState } from 'react';
import { Sparkles, ListOrdered, CalendarRange, AlertTriangle } from 'lucide-react';
import { aiApi } from '@/services/endpoints';
import { apiError } from '@/services/api';
import { useToast } from '@/hooks/useToast';
import PageHeader from '@/components/PageHeader';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Spinner } from '@/components/Spinner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const TABS = [
  { key: 'daily', label: 'Daily Plan', icon: Sparkles },
  { key: 'priority', label: 'Subject Priority', icon: ListOrdered },
  { key: 'life', label: 'Life Optimizer', icon: CalendarRange },
];

export default function AIPlannerPage() {
  const { toast } = useToast();
  const [enabled, setEnabled] = useState(null);
  const [tab, setTab] = useState('daily');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState({});

  useEffect(() => {
    aiApi
      .status()
      .then((s) => setEnabled(s.enabled))
      .catch(() => setEnabled(false));
  }, []);

  const generate = async () => {
    setLoading(true);
    try {
      let data;
      if (tab === 'daily') data = await aiApi.dailyPlan();
      else if (tab === 'priority') data = await aiApi.priority();
      else data = await aiApi.lifePlan();
      setResults((r) => ({ ...r, [tab]: data }));
    } catch (err) {
      toast(apiError(err, 'AI request failed'), 'error');
    } finally {
      setLoading(false);
    }
  };

  const result = results[tab];

  return (
    <div>
      <PageHeader
        title="AI Planner"
        description="Personalized plans generated from your real academic data."
      />

      {enabled === false && (
        <Card className="mb-6 border-amber-300">
          <CardContent className="flex items-start gap-3 p-5">
            <AlertTriangle className="mt-0.5 h-5 w-5 text-amber-500" />
            <div className="text-sm">
              <p className="font-medium">AI provider not configured</p>
              <p className="text-muted-foreground">
                Set <code>AI_PROVIDER</code> and the matching API key
                (<code>GEMINI_API_KEY</code> or <code>OPENAI_API_KEY</code>) in the
                server <code>.env</code> to enable AI generation.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="mb-6 flex flex-wrap gap-2">
        {TABS.map((t) => (
          <Button
            key={t.key}
            variant={tab === t.key ? 'default' : 'outline'}
            onClick={() => setTab(t.key)}
          >
            <t.icon className="h-4 w-4" /> {t.label}
          </Button>
        ))}
      </div>

      <div className="mb-6">
        <Button onClick={generate} disabled={loading || enabled === false}>
          {loading ? <Spinner className="h-4 w-4" /> : <Sparkles className="h-4 w-4" />}
          {loading ? 'Generating…' : 'Generate'}
        </Button>
      </div>

      {result && tab === 'daily' && <DailyPlan data={result} />}
      {result && tab === 'priority' && <PriorityView data={result} />}
      {result && tab === 'life' && <LifePlan data={result} />}
    </div>
  );
}

function Summary({ text }) {
  if (!text) return null;
  return (
    <Card className="mb-4">
      <CardContent className="p-5 text-sm text-muted-foreground">{text}</CardContent>
    </Card>
  );
}

function DailyPlan({ data }) {
  const plan = data.plan || {};
  return (
    <div>
      <Summary text={plan.summary} />
      <div className="space-y-3">
        {(plan.tasks || []).map((t, i) => (
          <Card key={i}>
            <CardContent className="flex items-start justify-between gap-4 p-4">
              <div>
                <p className="font-medium">{t.subject}</p>
                <p className="text-sm text-muted-foreground">{t.reason}</p>
              </div>
              <Badge variant="secondary" className="shrink-0">
                {t.start}–{t.end}
              </Badge>
            </CardContent>
          </Card>
        ))}
        {(!plan.tasks || plan.tasks.length === 0) && (
          <p className="text-sm text-muted-foreground">No tasks returned.</p>
        )}
      </div>
    </div>
  );
}

function PriorityView({ data }) {
  const ranked = data.ranked || [];
  const insight = data.insight || {};
  return (
    <div>
      <Summary text={insight.summary} />
      <div className="space-y-3">
        {ranked.map((r, i) => (
          <Card key={r.subjectId || i}>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center justify-between text-base">
                <span>
                  {i + 1}. {r.subject}
                </span>
                <Badge>score {r.priority}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              <div className="flex flex-wrap gap-x-4 gap-y-1">
                <span>Credits: {r.credits}</span>
                <span>Difficulty: {r.difficulty}</span>
                <span>Attendance: {r.attendancePercent}%</span>
                {r.daysUntilExam !== null && <span>Exam in {r.daysUntilExam}d</span>}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

function LifePlan({ data }) {
  const plan = data.plan || {};
  return (
    <div>
      <Summary text={plan.summary} />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {(plan.week || []).map((day) => (
          <Card key={day.day}>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">{day.day}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-1">
              {(day.blocks || []).map((b, i) => (
                <div key={i} className="flex items-center justify-between text-sm">
                  <span>{b.activity}</span>
                  <span className="text-muted-foreground">
                    {b.start}–{b.end}
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>
      {plan.habits?.length > 0 && (
        <Card className="mt-4">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Habits</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
              {plan.habits.map((h, i) => (
                <li key={i}>{h}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
