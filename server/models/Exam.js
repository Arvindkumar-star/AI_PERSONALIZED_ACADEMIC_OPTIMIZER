import mongoose from 'mongoose';

const examSchema = new mongoose.Schema(
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
      index: true,
    },
    examDate: { type: Date, required: true },
    preparationStatus: {
      type: String,
      enum: ['not-started', 'in-progress', 'revising', 'ready'],
      default: 'not-started',
    },
    internalMarks: { type: Number, default: 0, min: 0 },
  },
  { timestamps: true }
);

const Exam = mongoose.model('Exam', examSchema);
export default Exam;
