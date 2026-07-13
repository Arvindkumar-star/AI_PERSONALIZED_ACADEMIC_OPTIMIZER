import { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { loadMe } from '@/features/auth/authSlice';
import { getToken } from '@/services/api';
import ProtectedRoute from '@/components/ProtectedRoute';
import AppLayout from '@/layouts/AppLayout';

import LandingPage from '@/pages/LandingPage';
import LoginPage from '@/pages/LoginPage';
import RegisterPage from '@/pages/RegisterPage';
import DashboardPage from '@/pages/DashboardPage';
import ProfilePage from '@/pages/ProfilePage';
import SemesterPage from '@/pages/SemesterPage';
import SubjectsPage from '@/pages/SubjectsPage';
import TimetablePage from '@/pages/TimetablePage';
import AttendancePage from '@/pages/AttendancePage';
import ExamsPage from '@/pages/ExamsPage';
import StudyTrackerPage from '@/pages/StudyTrackerPage';
import AIPlannerPage from '@/pages/AIPlannerPage';
import NotFoundPage from '@/pages/NotFoundPage';

export default function App() {
  const dispatch = useDispatch();

  useEffect(() => {
    if (getToken()) dispatch(loadMe());
  }, [dispatch]);

  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      <Route
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/semesters" element={<SemesterPage />} />
        <Route path="/subjects" element={<SubjectsPage />} />
        <Route path="/timetable" element={<TimetablePage />} />
        <Route path="/attendance" element={<AttendancePage />} />
        <Route path="/exams" element={<ExamsPage />} />
        <Route path="/study" element={<StudyTrackerPage />} />
        <Route path="/ai-planner" element={<AIPlannerPage />} />
      </Route>

      <Route path="/404" element={<NotFoundPage />} />
      <Route path="*" element={<Navigate to="/404" replace />} />
    </Routes>
  );
}
