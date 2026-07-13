import { useEffect, useRef, useState } from 'react';
import { Play, Square, Timer } from 'lucide-react';
import { studyApi, subjectsApi } from '@/services/endpoints';
import { apiError } from '@/services/api';
import { useToast } from '@/hooks/useToast';
import PageHeader from '@/components/PageHeader';
import { PageLoader } from '@/components/Spinner';
import EmptyState from '@/components/EmptyState';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

const fmt = (secs) => {
  const h = String(Math.floor(secs / 3600)).padStart(2, '0');
  const m = String(Math.floor((secs % 3600) / 60)).padStart(2, '0');
  const s = String(secs % 60).padStart(2, '0');
  return `${h}:${m}:${s}`;
};

export default function StudyTrackerPage() {
  const { toast } = useToast();
  const [subjects, setSubjects] = useState([]);
  const [active, setActive] = useState(null);
  const [history, setHistory] = useState([]);
  const [subjectId, setSubjectId] = useState('');
  const [elapsed, setElapsed] = useState(0);
  const [loading, setLoading] = useState(true);
  const timerRef = useRef(null);

  const load = async () => {
    try {
      const [subs, act, hist] = await Promise.all([
        subjectsApi.list(),
        studyApi.active(),
        studyApi.history(),
      ]);
      setSubjects(subs);
      setActive(act);
      setHistory(hist);
    } catch (err) {
      toast(apiError(err), 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    clearInterval(timerRef.current);
    if (active) {
      const tick = () =>
        setElapsed(Math.floor((Date.now() - new Date(active.startTime)) / 1000));
      tick();
      timerRef.current = setInterval(tick, 1000);
    } else {
      setElapsed(0);
    }
    return () => clearInterval(timerRef.current);
  }, [active]);

  const start = async () => {
    if (!subjectId) return;
    try {
      const session = await studyApi.start(subjectId);
      const subject = subjects.find((s) => s._id === subjectId);
      setActive({ ...session, subjectId: { _id: subjectId, name: subject?.name } });
    } catch (err) {
      toast(apiError(err), 'error');
    }
  };

  const stop = async () => {
    try {
      await studyApi.stop(active._id);
      setActive(null);
      toast('Session saved', 'success');
      load();
    } catch (err) {
      toast(apiError(err), 'error');
    }
  };

  if (loading) return <PageLoader />;

  const totalMinutes = history.reduce((a, s) => a + s.duration, 0);

  return (
    <div>
      <PageHeader
        title="Study Tracker"
        description="Start a focused session and build your study history."
      />

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Timer className="h-5 w-5 text-primary" /> Focus timer
          </CardTitle>
        </CardHeader>
        <CardContent>
          {active ? (
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-sm text-muted-foreground">
                  Studying {active.subjectId?.name}
                </p>
                <p className="font-mono text-4xl font-bold tabular-nums">
                  {fmt(elapsed)}
                </p>
              </div>
              <Button variant="destructive" onClick={stop}>
                <Square className="h-4 w-4" /> Stop & save
              </Button>
            </div>
          ) : subjects.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Add subjects to start tracking study time.
            </p>
          ) : (
            <div className="flex flex-wrap items-end gap-3">
              <div className="w-64">
                <Select value={subjectId} onChange={(e) => setSubjectId(e.target.value)}>
                  <option value="">Select subject…</option>
                  {subjects.map((s) => (
                    <option key={s._id} value={s._id}>
                      {s.name}
                    </option>
                  ))}
                </Select>
              </div>
              <Button onClick={start} disabled={!subjectId}>
                <Play className="h-4 w-4" /> Start session
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold">History</h2>
        <p className="text-sm text-muted-foreground">
          Total: {(totalMinutes / 60).toFixed(1)}h
        </p>
      </div>

      {history.length === 0 ? (
        <EmptyState title="No study sessions yet" />
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Subject</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Start</TableHead>
                  <TableHead>End</TableHead>
                  <TableHead className="text-right">Duration</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {history.map((s) => (
                  <TableRow key={s._id}>
                    <TableCell className="font-medium">
                      {s.subjectId?.name || 'Subject'}
                    </TableCell>
                    <TableCell>{new Date(s.startTime).toLocaleDateString()}</TableCell>
                    <TableCell>
                      {new Date(s.startTime).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </TableCell>
                    <TableCell>
                      {s.endTime
                        ? new Date(s.endTime).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })
                        : '—'}
                    </TableCell>
                    <TableCell className="text-right">{s.duration} min</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
