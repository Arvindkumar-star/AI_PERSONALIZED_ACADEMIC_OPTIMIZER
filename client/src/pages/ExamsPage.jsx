import { useEffect, useState } from 'react';
import { Plus, Trash2, CalendarClock } from 'lucide-react';
import { examsApi, subjectsApi } from '@/services/endpoints';
import { apiError } from '@/services/api';
import { useToast } from '@/hooks/useToast';
import PageHeader from '@/components/PageHeader';
import { PageLoader } from '@/components/Spinner';
import EmptyState from '@/components/EmptyState';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog } from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';

const PREP = ['not-started', 'in-progress', 'revising', 'ready'];
const prepVariant = {
  'not-started': 'destructive',
  'in-progress': 'warning',
  revising: 'secondary',
  ready: 'success',
};

const daysUntil = (date) =>
  Math.ceil((new Date(date).getTime() - Date.now()) / (1000 * 60 * 60 * 24));

export default function ExamsPage() {
  const { toast } = useToast();
  const [exams, setExams] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    subjectId: '',
    examDate: '',
    preparationStatus: 'not-started',
    internalMarks: 0,
  });

  const load = async () => {
    try {
      const [e, s] = await Promise.all([examsApi.list(), subjectsApi.list()]);
      setExams(e);
      setSubjects(s);
    } catch (err) {
      toast(apiError(err), 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    try {
      await examsApi.create({
        ...form,
        internalMarks: Number(form.internalMarks),
      });
      toast('Exam added', 'success');
      setOpen(false);
      setForm({ subjectId: '', examDate: '', preparationStatus: 'not-started', internalMarks: 0 });
      load();
    } catch (err) {
      toast(apiError(err), 'error');
    }
  };

  const updatePrep = async (exam, status) => {
    try {
      await examsApi.update(exam._id, { preparationStatus: status });
      load();
    } catch (err) {
      toast(apiError(err), 'error');
    }
  };

  const remove = async (exam) => {
    try {
      await examsApi.remove(exam._id);
      load();
    } catch (err) {
      toast(apiError(err), 'error');
    }
  };

  if (loading) return <PageLoader />;

  return (
    <div>
      <PageHeader
        title="Exams"
        description="Plan exam dates and track your preparation status."
        action={
          <Button onClick={() => setOpen(true)} disabled={subjects.length === 0}>
            <Plus className="h-4 w-4" /> Add exam
          </Button>
        }
      />

      {subjects.length === 0 ? (
        <EmptyState title="Add subjects first" description="Exams are linked to subjects." />
      ) : exams.length === 0 ? (
        <EmptyState
          title="No exams scheduled"
          action={<Button onClick={() => setOpen(true)}>Add exam</Button>}
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {exams.map((ex) => {
            const d = daysUntil(ex.examDate);
            return (
              <Card key={ex._id}>
                <CardContent className="p-5">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium">{ex.subjectId?.name || 'Subject'}</p>
                      <p className="flex items-center gap-1 text-xs text-muted-foreground">
                        <CalendarClock className="h-3 w-3" />
                        {new Date(ex.examDate).toLocaleDateString()}
                      </p>
                    </div>
                    <Badge variant={d < 0 ? 'outline' : d <= 7 ? 'destructive' : 'secondary'}>
                      {d < 0 ? 'past' : `${d}d left`}
                    </Badge>
                  </div>
                  <div className="mt-4 space-y-2">
                    <Label className="text-xs">Preparation</Label>
                    <Select
                      value={ex.preparationStatus}
                      onChange={(e) => updatePrep(ex, e.target.value)}
                    >
                      {PREP.map((p) => (
                        <option key={p} value={p}>
                          {p}
                        </option>
                      ))}
                    </Select>
                  </div>
                  <div className="mt-3 flex items-center justify-between">
                    <Badge variant={prepVariant[ex.preparationStatus]}>
                      {ex.preparationStatus}
                    </Badge>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="text-destructive"
                      onClick={() => remove(ex)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <Dialog open={open} onClose={() => setOpen(false)} title="Add exam">
        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="subject">Subject</Label>
            <Select id="subject" required value={form.subjectId} onChange={set('subjectId')}>
              <option value="">Select subject…</option>
              {subjects.map((s) => (
                <option key={s._id} value={s._id}>
                  {s.name}
                </option>
              ))}
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="date">Exam date</Label>
            <Input id="date" type="date" required value={form.examDate} onChange={set('examDate')} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="prep">Preparation</Label>
              <Select id="prep" value={form.preparationStatus} onChange={set('preparationStatus')}>
                {PREP.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="internal">Internal marks</Label>
              <Input
                id="internal"
                type="number"
                min={0}
                value={form.internalMarks}
                onChange={set('internalMarks')}
              />
            </div>
          </div>
          <Button type="submit" className="w-full">
            Add exam
          </Button>
        </form>
      </Dialog>
    </div>
  );
}
