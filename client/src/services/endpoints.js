import api from './api';

export const semestersApi = {
  list: () => api.get('/semesters').then((r) => r.data.semesters),
  create: (payload) => api.post('/semesters', payload).then((r) => r.data.semester),
  update: (id, payload) =>
    api.put(`/semesters/${id}`, payload).then((r) => r.data.semester),
  remove: (id) => api.delete(`/semesters/${id}`).then((r) => r.data),
  sgpa: (id) => api.get(`/semesters/${id}/sgpa`).then((r) => r.data),
};

export const subjectsApi = {
  list: (semesterId) =>
    api
      .get('/subjects', { params: semesterId ? { semesterId } : {} })
      .then((r) => r.data.subjects),
  create: (payload) => api.post('/subjects', payload).then((r) => r.data.subject),
  update: (id, payload) =>
    api.put(`/subjects/${id}`, payload).then((r) => r.data.subject),
  remove: (id) => api.delete(`/subjects/${id}`).then((r) => r.data),
};

export const timetableApi = {
  list: () => api.get('/timetable').then((r) => r.data.entries),
  create: (payload) => api.post('/timetable', payload).then((r) => r.data.entry),
  update: (id, payload) =>
    api.put(`/timetable/${id}`, payload).then((r) => r.data.entry),
  remove: (id) => api.delete(`/timetable/${id}`).then((r) => r.data),
  freeSlots: () => api.get('/timetable/free-slots').then((r) => r.data.freeSlots),
};

export const attendanceApi = {
  list: () => api.get('/attendance').then((r) => r.data.attendance),
  upsert: (payload) =>
    api.post('/attendance', payload).then((r) => r.data.attendance),
  update: (id, payload) =>
    api.put(`/attendance/${id}`, payload).then((r) => r.data.attendance),
};

export const examsApi = {
  list: () => api.get('/exams').then((r) => r.data.exams),
  create: (payload) => api.post('/exams', payload).then((r) => r.data.exam),
  update: (id, payload) =>
    api.put(`/exams/${id}`, payload).then((r) => r.data.exam),
  remove: (id) => api.delete(`/exams/${id}`).then((r) => r.data),
};

export const studyApi = {
  start: (subjectId) =>
    api.post('/study/start', { subjectId }).then((r) => r.data.session),
  stop: (sessionId) =>
    api.post('/study/stop', { sessionId }).then((r) => r.data.session),
  active: () => api.get('/study/active').then((r) => r.data.session),
  history: () => api.get('/study/history').then((r) => r.data.sessions),
};

export const dashboardApi = {
  get: () => api.get('/dashboard').then((r) => r.data),
};

export const aiApi = {
  status: () => api.get('/ai/status').then((r) => r.data),
  dailyPlan: (day) => api.post('/ai/daily-plan', day ? { day } : {}).then((r) => r.data),
  priority: () => api.post('/ai/priority').then((r) => r.data),
  lifePlan: () => api.post('/ai/life-plan').then((r) => r.data),

  aura: (message) =>
  api.post('/ai/aura', { message }).then((r) => r.data.response),
};
