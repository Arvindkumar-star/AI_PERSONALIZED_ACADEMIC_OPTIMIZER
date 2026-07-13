import { useEffect, useState } from 'react';
import { Plus, Trash2, Clock } from 'lucide-react';
import { timetableApi } from '@/services/endpoints';
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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const DAYS = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
];

const EMPTY = {
  day: 'Monday',
  startTime: '09:00',
  endTime: '10:00',
  subject: '',
  type: 'lecture',
  location: '',
};

const typeVariant = {
  lecture: 'default',
  lab: 'secondary',
  tutorial: 'warning',
  other: 'outline',
};

export default function TimetablePage() {
  const { toast } = useToast();
  const [entries, setEntries] = useState([]);
  const [freeSlots, setFreeSlots] = useState({});
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(EMPTY);

  const load = async () => {
    try {
      const [e, f] = await Promise.all([
        timetableApi.list(),
        timetableApi.freeSlots(),
      ]);
      setEntries(e);
      setFreeSlots(f);
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
      await timetableApi.create(form);
      toast('Class added', 'success');
      setOpen(false);
      setForm(EMPTY);
      load();
    } catch (err) {
      toast(apiError(err), 'error');
    }
  };

  const remove = async (entry) => {
    try {
      await timetableApi.remove(entry._id);
      load();
    } catch (err) {
      toast(apiError(err), 'error');
    }
  };

  if (loading) return <PageLoader />;

  const byDay = DAYS.map((day) => ({
    day,
    items: entries
      .filter((e) => e.day === day)
      .sort((a, b) => a.startTime.localeCompare(b.startTime)),
    free: freeSlots[day] || [],
  }));

  return (
    <div>
      <PageHeader
        title="Timetable"
        description="Your weekly classes. Free slots are computed automatically."
        action={
          <Button onClick={() => setOpen(true)}>
            <Plus className="h-4 w-4" /> Add class
          </Button>
        }
      />

      {entries.length === 0 ? (
        <EmptyState
          title="No classes yet"
          description="Add your weekly classes to unlock free-slot detection and AI planning."
          action={<Button onClick={() => setOpen(true)}>Add class</Button>}
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {byDay.map(({ day, items, free }) => (
            <Card key={day}>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">{day}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {items.length === 0 && (
                  <p className="text-sm text-muted-foreground">No classes.</p>
                )}
                {items.map((e) => (
                  <div
                    key={e._id}
                    className="flex items-center justify-between rounded-md border p-2"
                  >
                    <div>
                      <p className="text-sm font-medium">{e.subject}</p>
                      <p className="text-xs text-muted-foreground">
                        {e.startTime}–{e.endTime}
                        {e.location ? ` · ${e.location}` : ''}
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
                      <Badge variant={typeVariant[e.type]}>{e.type}</Badge>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 text-destructive"
                        onClick={() => remove(e)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
                {free.length > 0 && (
                  <div className="pt-1">
                    <p className="mb-1 flex items-center gap-1 text-xs font-medium text-muted-foreground">
                      <Clock className="h-3 w-3" /> Free slots
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {free.map((f, i) => (
                        <Badge key={i} variant="outline" className="font-normal">
                          {f.start}–{f.end}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={open} onClose={() => setOpen(false)} title="Add class">
        <form onSubmit={submit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="day">Day</Label>
              <Select id="day" value={form.day} onChange={set('day')}>
                {DAYS.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="type">Type</Label>
              <Select id="type" value={form.type} onChange={set('type')}>
                <option value="lecture">Lecture</option>
                <option value="lab">Lab</option>
                <option value="tutorial">Tutorial</option>
                <option value="other">Other</option>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="start">Start</Label>
              <Input id="start" type="time" required value={form.startTime} onChange={set('startTime')} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="end">End</Label>
              <Input id="end" type="time" required value={form.endTime} onChange={set('endTime')} />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="subject">Subject</Label>
            <Input id="subject" required value={form.subject} onChange={set('subject')} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <Input id="location" value={form.location} onChange={set('location')} />
          </div>
          <Button type="submit" className="w-full">
            Add class
          </Button>
        </form>
      </Dialog>
    </div>
  );
}
