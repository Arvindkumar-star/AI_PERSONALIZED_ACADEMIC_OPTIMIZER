import mongoose from 'mongoose';

const attendanceSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    subjectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subject',
      required: true,
      unique: true,
      index: true,
    },
    present: { type: Number, default: 0, min: 0 },
    absent: { type: Number, default: 0, min: 0 },
    requiredPercent: { type: Number, default: 75, min: 0, max: 100 },
  },
  { timestamps: true }
);

const Attendance = mongoose.model('Attendance', attendanceSchema);
export default Attendance;
