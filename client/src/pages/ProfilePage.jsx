import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { updateProfile } from '@/features/auth/authSlice';
import { useToast } from '@/hooks/useToast';
import PageHeader from '@/components/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Spinner } from '@/components/Spinner';

export default function ProfilePage() {
  const dispatch = useDispatch();
  const { toast } = useToast();
  const { user } = useSelector((s) => s.auth);
  const [form, setForm] = useState({
    name: user?.name || '',
    college: user?.college || '',
    branch: user?.branch || '',
    semester: user?.semester || 1,
    targetSGPA: user?.targetSGPA ?? 8.5,
    dailyStudyGoal: user?.dailyStudyGoal ?? 4,
  });
  const [saving, setSaving] = useState(false);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    const res = await dispatch(updateProfile(form));
    setSaving(false);
    if (res.meta.requestStatus === 'fulfilled') toast('Profile updated', 'success');
    else toast('Update failed', 'error');
  };

  return (
    <div>
      <PageHeader
        title="Profile"
        description="Your academic goals power the AI recommendations."
      />
      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Personal & academic details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" value={form.name} onChange={set('name')} />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input value={user?.email || ''} disabled />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="college">College</Label>
                <Input id="college" value={form.college} onChange={set('college')} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="branch">Branch</Label>
                <Input id="branch" value={form.branch} onChange={set('branch')} />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-2">
                <Label htmlFor="semester">Current semester</Label>
                <Input
                  id="semester"
                  type="number"
                  min={1}
                  value={form.semester}
                  onChange={set('semester')}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="targetSGPA">Target SGPA</Label>
                <Input
                  id="targetSGPA"
                  type="number"
                  step="0.1"
                  min={0}
                  max={10}
                  value={form.targetSGPA}
                  onChange={set('targetSGPA')}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dailyStudyGoal">Daily study goal (h)</Label>
                <Input
                  id="dailyStudyGoal"
                  type="number"
                  min={0}
                  max={24}
                  value={form.dailyStudyGoal}
                  onChange={set('dailyStudyGoal')}
                />
              </div>
            </div>
            <Button type="submit" disabled={saving}>
              {saving && <Spinner className="h-4 w-4" />}
              Save changes
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
