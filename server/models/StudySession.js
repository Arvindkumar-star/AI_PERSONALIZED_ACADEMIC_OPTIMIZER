import mongoose from 'mongoose';

const studySessionSchema = new mongoose.Schema(
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
    startTime: { type: Date, required: true },
    endTime: { type: Date, default: null },
    duration: { type: Number, default: 0, min: 0 }, // minutes
  },
  { timestamps: true }
);

const StudySession = mongoose.model('StudySession', studySessionSchema);
export default StudySession;
