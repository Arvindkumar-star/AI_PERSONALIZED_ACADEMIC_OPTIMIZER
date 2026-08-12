import { useState } from 'react';
import AuraAssistant from '@/components/AuraAssistant';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  LayoutDashboard,
  User,
  GraduationCap,
  BookOpen,
  CalendarDays,
  ClipboardCheck,
  FileText,
  Timer,
  Sparkles,
  LogOut,
  Menu,
  X,
} from 'lucide-react';
import { logout } from '@/features/auth/authSlice';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const NAV = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/profile', label: 'Profile', icon: User },
  { to: '/semesters', label: 'Semesters', icon: GraduationCap },
  { to: '/subjects', label: 'Subjects', icon: BookOpen },
  { to: '/timetable', label: 'Timetable', icon: CalendarDays },
  { to: '/attendance', label: 'Attendance', icon: ClipboardCheck },
  { to: '/exams', label: 'Exams', icon: FileText },
  { to: '/study', label: 'Study Tracker', icon: Timer },
  { to: '/ai-planner', label: 'AI Planner', icon: Sparkles },
];

export function AppLayout() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((s) => s.auth);
  const [open, setOpen] = useState(false);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Sidebar */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-40 w-64 transform border-r bg-card transition-transform lg:translate-x-0',
          open ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex h-16 items-center gap-2 border-b px-5">
          <Sparkles className="h-6 w-6 text-primary" />
          <span className="font-bold">AI Academic OS</span>
        </div>
        <nav className="flex flex-col gap-1 p-3">
          {NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                )
              }
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>

      {/* Overlay for mobile */}
      {open && (
        <div
          className="fixed inset-0 z-30 bg-black/40 lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Main */}
      <div className="lg:pl-64">
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b bg-card/80 px-4 backdrop-blur lg:px-8">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setOpen((o) => !o)}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
          <div className="ml-auto flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-medium">{user?.name}</p>
              <p className="text-xs text-muted-foreground">{user?.email}</p>
            </div>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </div>
        </header>
        <main className="mx-auto max-w-6xl p-4 lg:p-8">
          <Outlet />
        </main>
        <AuraAssistant />
      </div>
    </div>
  );
}

export default AppLayout;
