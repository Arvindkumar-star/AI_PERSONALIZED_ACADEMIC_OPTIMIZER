import mongoose from 'mongoose';

const subjectSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    semesterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Semester',
      required: true,
      index: true,
    },
    name: { type: String, required: true, trim: true },
    credits: { type: Number, required: true, min: 1 },
    faculty: { type: String, trim: true, default: '' },
    difficulty: {
      type: String,
      enum: ['easy', 'medium', 'hard'],
      default: 'medium',
    },
    internalMarks: { type: Number, default: 0, min: 0 },
    endSemesterMarks: { type: Number, default: 0, min: 0 },
  },
  { timestamps: true }
);

const Subject = mongoose.model('Subject', subjectSchema);
export default Subject;
