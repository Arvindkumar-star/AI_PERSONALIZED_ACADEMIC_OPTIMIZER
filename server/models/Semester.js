import mongoose from 'mongoose';

const semesterSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    semesterNumber: { type: Number, required: true, min: 1 },
    cgpa: { type: Number, default: 0, min: 0, max: 10 },
    active: { type: Boolean, default: false },
  },
  { timestamps: true }
);

semesterSchema.index({ userId: 1, semesterNumber: 1 }, { unique: true });

const Semester = mongoose.model('Semester', semesterSchema);
export default Semester;
