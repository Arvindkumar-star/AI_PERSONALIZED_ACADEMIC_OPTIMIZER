import { DAYS } from '../../models/Timetable.js';

const toMinutes = (hhmm) => {
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + m;
};

const toHHMM = (mins) => {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
};

// Compute free slots per day by comparing timetable entries.
// dayStart/dayEnd bound the "awake study window" (defaults 08:00-22:00).
export function computeFreeSlots(entries = [], { dayStart = '08:00', dayEnd = '22:00', minMinutes = 30 } = {}) {
  const startBound = toMinutes(dayStart);
  const endBound = toMinutes(dayEnd);

  const byDay = {};
  for (const day of DAYS) byDay[day] = [];
  for (const e of entries) {
    if (byDay[e.day]) byDay[e.day].push(e);
  }

  const result = {};
  for (const day of DAYS) {
    const busy = byDay[day]
      .map((e) => ({ start: toMinutes(e.startTime), end: toMinutes(e.endTime) }))
      .sort((a, b) => a.start - b.start);

    const free = [];
    let cursor = startBound;
    for (const slot of busy) {
      const s = Math.max(slot.start, startBound);
      const en = Math.min(slot.end, endBound);
      if (s > cursor) {
        free.push({ start: cursor, end: Math.min(s, endBound) });
      }
      cursor = Math.max(cursor, en);
    }
    if (cursor < endBound) free.push({ start: cursor, end: endBound });

    result[day] = free
      .filter((f) => f.end - f.start >= minMinutes)
      .map((f) => ({
        start: toHHMM(f.start),
        end: toHHMM(f.end),
        minutes: f.end - f.start,
      }));
  }

  return result;
}

export { toMinutes, toHHMM };
