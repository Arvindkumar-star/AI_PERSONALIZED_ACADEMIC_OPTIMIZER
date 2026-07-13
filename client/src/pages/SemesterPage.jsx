import { useEffect, useState } from 'react';
import { Plus, Trash2, CheckCircle2 } from 'lucide-react';
import { semestersApi } from '@/services/endpoints';
import { apiError } from '@/services/api';
import { useToast } from '@/hooks/useToast';
import PageHeader from '@/components/PageHeader';
import { PageLoader } from '@/components/Spinner';
import EmptyState from '@/components/EmptyState';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog } from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';

export default function SemesterPage() {
  const { toast } = useToast();
  const [semesters, setSemesters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ semesterNumber: '', cgpa: '', active: true });

  const load = async () => {
    try {
      setSemesters(await semestersApi.list());
    } catch (err) {
      toast(apiError(err), 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const create = async (e) => {
    e.preventDefault();
    try {
      await semestersApi.create({
        semesterNumber: Number(form.semesterNumber),
        cgpa: form.cgpa ? Number(form.cgpa) : 0,
        active: form.active,
      });
      toast('Semester added', 'success');
      setOpen(false);
      setForm({ semesterNumber: '', cgpa: '', active: true });
      load();
    } catch (err) {
      toast(apiError(err), 'error');
    }
  };

  const setActive = async (s) => {
    try {
      await semestersApi.update(s._id, { active: true });
      load();
    } catch (err) {
      toast(apiError(err), 'error');
    }
  };

  const remove = async (s) => {
    if (!window.confirm(`Delete semester ${s.semesterNumber} and its subjects?`)) return;
    try {
      await semestersApi.remove(s._id);
      toast('Semester deleted', 'success');
      load();
    } catch (err) {
      toast(apiError(err), 'error');
    }
  };

  if (loading) return <PageLoader />;

  return (
    <div>
      <PageHeader
        title="Semesters"
        description="Create a semester and mark the active one."
        action={
          <Button onClick={() => setOpen(true)}>
            <Plus className="h-4 w-4" /> Add semester
          </Button>
        }
      />

      {semesters.length === 0 ? (
        <EmptyState
          title="No semesters yet"
          description="Add your first semester to start organizing subjects."
          action={<Button onClick={() => setOpen(true)}>Add semester</Button>}
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {semesters.map((s) => (
            <Card key={s._id}>
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Semester</p>
                    <p className="text-2xl font-bold">{s.semesterNumber}</p>
                  </div>
                  {s.active && (
                    <Badge variant="success">
                      <CheckCircle2 className="mr-1 h-3 w-3" /> Active
                    </Badge>
                  )}
                </div>
                <p className="mt-3 text-sm text-muted-foreground">
                  CGPA: <span className="font-medium text-foreground">{s.cgpa}</span>
                </p>
                <div className="mt-4 flex gap-2">
                  {!s.active && (
                    <Button size="sm" variant="outline" onClick={() => setActive(s)}>
                      Set active
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-destructive"
                    onClick={() => remove(s)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={open} onClose={() => setOpen(false)} title="Add semester">
        <form onSubmit={create} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="num">Semester number</Label>
            <Input
              id="num"
              type="number"
              min={1}
              required
              value={form.semesterNumber}
              onChange={(e) => setForm({ ...form, semesterNumber: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="cgpa">CGPA (optional)</Label>
            <Input
              id="cgpa"
              type="number"
              step="0.1"
              min={0}
              max={10}
              value={form.cgpa}
              onChange={(e) => setForm({ ...form, cgpa: e.target.value })}
            />
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.active}
              onChange={(e) => setForm({ ...form, active: e.target.checked })}
            />
            Set as active semester
          </label>
          <Button type="submit" className="w-full">
            Save
          </Button>
        </form>
      </Dialog>
    </div>
  );
}
