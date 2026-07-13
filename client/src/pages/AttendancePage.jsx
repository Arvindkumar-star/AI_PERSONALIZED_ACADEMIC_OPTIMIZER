import { useEffect, useState } from 'react';
import { Plus, Minus } from 'lucide-react';
import { attendanceApi, subjectsApi } from '@/services/endpoints';
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

export default function AttendancePage() {
  const { toast } = useToast();
  const [records, setRecords] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    subjectId: '',
    present: 0,
    absent: 0,
    requiredPercent: 75,
  });

  const load = async () => {
    try {
      const [recs, subs] = await Promise.all([
        attendanceApi.list(),
        subjectsApi.list(),
      ]);
      setRecords(recs);
      setSubjects(subs);
    } catch (err) {
      toast(apiError(err), 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const quickAdjust = async (rec, field, delta) => {
    const next = Math.max(0, (rec[field] || 0) + delta);
    try {
      await attendanceApi.update(rec._id, { [field]: next });
      load();
    } catch (err) {
      toast(apiError(err), 'error');
    }
  };

  const submit = async (e) => {
    e.preventDefault();
    try {
      await attendanceApi.upsert({
        subjectId: form.subjectId,
        present: Number(form.present),
        absent: Number(form.absent),
        requiredPercent: Number(form.requiredPercent),
      });
      toast('Attendance saved', 'success');
      setOpen(false);
      setForm({ subjectId: '', present: 0, absent: 0, requiredPercent: 75 });
      load();
    } catch (err) {
      toast(apiError(err), 'error');
    }
  };

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  if (loading) return <PageLoader />;

  const trackedIds = new Set(records.map((r) => r.subjectId?._id || r.subjectId));
  const untracked = subjects.filter((s) => !trackedIds.has(s._id));

  return (
    <div>
      <PageHeader
        title="Attendance"
        description="Track present/absent per subject. Backend computes the percentages."
        action={
          <Button onClick={() => setOpen(true)} disabled={subjects.length === 0}>
            <Plus className="h-4 w-4" /> Track subject
          </Button>
        }
      />

      {subjects.length === 0 ? (
        <EmptyState
          title="Add subjects first"
          description="Attendance is tracked per subject."
        />
      ) : records.length === 0 ? (
        <EmptyState
          title="No attendance tracked"
          action={<Button onClick={() => setOpen(true)}>Track a subject</Button>}
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {records.map((r) => (
            <Card key={r._id}>
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <p className="font-medium">{r.subjectId?.name || 'Subject'}</p>
                  <Badge variant={r.meetsRequirement ? 'success' : 'destructive'}>
                    {r.percent}%
                  </Badge>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  Target {r.requiredPercent}% ·{' '}
                  {r.meetsRequirement
                    ? `can skip ${r.canBunk} class(es)`
                    : `attend ${r.mustAttend} more to recover`}
                </p>

                <div className="mt-4 grid grid-cols-2 gap-3">
                  <Counter
                    label="Present"
                    value={r.present}
                    onDec={() => quickAdjust(r, 'present', -1)}
                    onInc={() => quickAdjust(r, 'present', 1)}
                  />
                  <Counter
                    label="Absent"
                    value={r.absent}
                    onDec={() => quickAdjust(r, 'absent', -1)}
                    onInc={() => quickAdjust(r, 'absent', 1)}
                  />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={open} onClose={() => setOpen(false)} title="Track subject attendance">
        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="subject">Subject</Label>
            <Select
              id="subject"
              required
              value={form.subjectId}
              onChange={set('subjectId')}
            >
              <option value="">Select subject…</option>
              {(untracked.length ? untracked : subjects).map((s) => (
                <option key={s._id} value={s._id}>
                  {s.name}
                </option>
              ))}
            </Select>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-2">
              <Label htmlFor="present">Present</Label>
              <Input id="present" type="number" min={0} value={form.present} onChange={set('present')} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="absent">Absent</Label>
              <Input id="absent" type="number" min={0} value={form.absent} onChange={set('absent')} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="req">Required %</Label>
              <Input
                id="req"
                type="number"
                min={0}
                max={100}
                value={form.requiredPercent}
                onChange={set('requiredPercent')}
              />
            </div>
          </div>
          <Button type="submit" className="w-full">
            Save
          </Button>
        </form>
      </Dialog>
    </div>
  );
}

function Counter({ label, value, onInc, onDec }) {
  return (
    <div>
      <p className="mb-1 text-xs text-muted-foreground">{label}</p>
      <div className="flex items-center gap-2">
        <Button size="icon" variant="outline" className="h-8 w-8" onClick={onDec}>
          <Minus className="h-4 w-4" />
        </Button>
        <span className="w-8 text-center text-lg font-semibold">{value}</span>
        <Button size="icon" variant="outline" className="h-8 w-8" onClick={onInc}>
          <Plus className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
