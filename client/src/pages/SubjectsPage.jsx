import { useEffect, useState, useCallback } from 'react';
import { Plus, Trash2, Pencil, Calculator } from 'lucide-react';
import { subjectsApi, semestersApi } from '@/services/endpoints';
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

const EMPTY = {
  name: '',
  credits: 3,
  faculty: '',
  difficulty: 'medium',
  internalMarks: 0,
  endSemesterMarks: 0,
};

const difficultyVariant = { easy: 'success', medium: 'secondary', hard: 'destructive' };

export default function SubjectsPage() {
  const { toast } = useToast();
  const [semesters, setSemesters] = useState([]);
  const [semesterId, setSemesterId] = useState('');
  const [subjects, setSubjects] = useState([]);
  const [sgpa, setSgpa] = useState(null);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);

  const loadSubjects = useCallback(async (id) => {
    if (!id) {
      setSubjects([]);
      setSgpa(null);
      return;
    }
    try {
      const [subs, s] = await Promise.all([
        subjectsApi.list(id),
        semestersApi.sgpa(id),
      ]);
      setSubjects(subs);
      setSgpa(s.sgpa);
    } catch (err) {
      toast(apiError(err), 'error');
    }
  }, [toast]);

  useEffect(() => {
    (async () => {
      try {
        const sems = await semestersApi.list();
        setSemesters(sems);
        const active = sems.find((s) => s.active) || sems[0];
        if (active) {
          setSemesterId(active._id);
          await loadSubjects(active._id);
        }
      } catch (err) {
        toast(apiError(err), 'error');
      } finally {
        setLoading(false);
      }
    })();
  }, [loadSubjects, toast]);

  const onSemesterChange = (e) => {
    setSemesterId(e.target.value);
    loadSubjects(e.target.value);
  };

  const openCreate = () => {
    setEditing(null);
    setForm(EMPTY);
    setOpen(true);
  };

  const openEdit = (s) => {
    setEditing(s);
    setForm({
      name: s.name,
      credits: s.credits,
      faculty: s.faculty,
      difficulty: s.difficulty,
      internalMarks: s.internalMarks,
      endSemesterMarks: s.endSemesterMarks,
    });
    setOpen(true);
  };

  const submit = async (e) => {
    e.preventDefault();
    const payload = {
      ...form,
      credits: Number(form.credits),
      internalMarks: Number(form.internalMarks),
      endSemesterMarks: Number(form.endSemesterMarks),
    };
    try {
      if (editing) {
        await subjectsApi.update(editing._id, payload);
        toast('Subject updated', 'success');
      } else {
        await subjectsApi.create({ ...payload, semesterId });
        toast('Subject added', 'success');
      }
      setOpen(false);
      loadSubjects(semesterId);
    } catch (err) {
      toast(apiError(err), 'error');
    }
  };

  const remove = async (s) => {
    if (!window.confirm(`Delete ${s.name}?`)) return;
    try {
      await subjectsApi.remove(s._id);
      toast('Subject deleted', 'success');
      loadSubjects(semesterId);
    } catch (err) {
      toast(apiError(err), 'error');
    }
  };

  if (loading) return <PageLoader />;

  if (semesters.length === 0) {
    return (
      <div>
        <PageHeader title="Subjects" />
        <EmptyState
          title="Create a semester first"
          description="Subjects belong to a semester. Add one from the Semesters page."
        />
      </div>
    );
  }

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  return (
    <div>
      <PageHeader
        title="Subjects"
        description="Add subjects, credits and marks. SGPA updates automatically."
        action={
          <Button onClick={openCreate} disabled={!semesterId}>
            <Plus className="h-4 w-4" /> Add subject
          </Button>
        }
      />

      <div className="mb-4 flex flex-wrap items-center gap-4">
        <div className="w-56">
          <Select value={semesterId} onChange={onSemesterChange}>
            {semesters.map((s) => (
              <option key={s._id} value={s._id}>
                Semester {s.semesterNumber}
                {s.active ? ' (active)' : ''}
              </option>
            ))}
          </Select>
        </div>
        {sgpa !== null && (
          <Card>
            <CardContent className="flex items-center gap-2 p-3">
              <Calculator className="h-4 w-4 text-primary" />
              <span className="text-sm text-muted-foreground">Projected SGPA</span>
              <span className="text-lg font-bold">{sgpa}</span>
            </CardContent>
          </Card>
        )}
      </div>

      {subjects.length === 0 ? (
        <EmptyState
          title="No subjects yet"
          action={<Button onClick={openCreate}>Add subject</Button>}
        />
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Credits</TableHead>
                  <TableHead>Faculty</TableHead>
                  <TableHead>Difficulty</TableHead>
                  <TableHead>Internal</TableHead>
                  <TableHead>End sem</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {subjects.map((s) => (
                  <TableRow key={s._id}>
                    <TableCell className="font-medium">{s.name}</TableCell>
                    <TableCell>{s.credits}</TableCell>
                    <TableCell>{s.faculty || '—'}</TableCell>
                    <TableCell>
                      <Badge variant={difficultyVariant[s.difficulty]}>
                        {s.difficulty}
                      </Badge>
                    </TableCell>
                    <TableCell>{s.internalMarks}</TableCell>
                    <TableCell>{s.endSemesterMarks}</TableCell>
                    <TableCell className="text-right">
                      <Button size="icon" variant="ghost" onClick={() => openEdit(s)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="text-destructive"
                        onClick={() => remove(s)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        title={editing ? 'Edit subject' : 'Add subject'}
      >
        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input id="name" required value={form.name} onChange={set('name')} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="credits">Credits</Label>
              <Input
                id="credits"
                type="number"
                min={1}
                required
                value={form.credits}
                onChange={set('credits')}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="difficulty">Difficulty</Label>
              <Select id="difficulty" value={form.difficulty} onChange={set('difficulty')}>
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="faculty">Faculty</Label>
            <Input id="faculty" value={form.faculty} onChange={set('faculty')} />
          </div>
          <div className="grid grid-cols-2 gap-3">
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
            <div className="space-y-2">
              <Label htmlFor="endsem">End sem marks</Label>
              <Input
                id="endsem"
                type="number"
                min={0}
                value={form.endSemesterMarks}
                onChange={set('endSemesterMarks')}
              />
            </div>
          </div>
          <Button type="submit" className="w-full">
            {editing ? 'Save changes' : 'Add subject'}
          </Button>
        </form>
      </Dialog>
    </div>
  );
}
