import mongoose from 'mongoose';

const DAYS = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
];

const timetableSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    day: { type: String, enum: DAYS, required: true },
    startTime: { type: String, required: true }, // "HH:mm"
    endTime: { type: String, required: true }, // "HH:mm"
    subject: { type: String, required: true, trim: true },
    type: {
      type: String,
      enum: ['lecture', 'lab', 'tutorial', 'other'],
      default: 'lecture',
    },
    location: { type: String, trim: true, default: '' },
  },
  { timestamps: true }
);

export { DAYS };

const Timetable = mongoose.model('Timetable', timetableSchema);
export default Timetable;
