import StudySession from '../../../models/StudySession.js';
import Subject from '../../../models/Subject.js';
import ApiError from '../../../utils/ApiError.js';

export async function logStudySession({
  userId,
  subjectName,
  durationMinutes,
}) {
  // -----------------------------------------
  // Validate duration
  // -----------------------------------------

  const duration = Number(durationMinutes);

  if (!Number.isFinite(duration) || duration <= 0) {
    throw new ApiError(
      400,
      'Study duration must be greater than 0 minutes.'
    );
  }

  if (duration > 600) {
    throw new ApiError(
      400,
      'Study duration cannot exceed 10 hours.'
    );
  }

  // -----------------------------------------
  // Find the student's subject
  // -----------------------------------------

  const subject = await Subject.findOne({
    userId,
    name: {
      $regex: `^${escapeRegex(String(subjectName).trim())}$`,
      $options: 'i',
    },
  });

  if (!subject) {
    throw new ApiError(
      400,
      `Subject "${subjectName}" was not found.`
    );
  }

  // -----------------------------------------
  // Create completed study session
  // -----------------------------------------

  const endTime = new Date();

  const startTime = new Date(
    endTime.getTime() - duration * 60 * 1000
  );

  const session = await StudySession.create({
    userId,
    subjectId: subject._id,
    startTime,
    endTime,
    duration: Math.round(duration),
  });

  return {
    success: true,

    action: 'logStudySession',

    session: {
      id: session._id,
      subjectId: subject._id,
      subject: subject.name,
      durationMinutes: session.duration,
      startTime: session.startTime,
      endTime: session.endTime,
    },
  };
}

// Prevent regex characters in subject names
function escapeRegex(value) {
  return value.replace(
    /[.*+?^${}()|[\]\\]/g,
    '\\$&'
  );
}
