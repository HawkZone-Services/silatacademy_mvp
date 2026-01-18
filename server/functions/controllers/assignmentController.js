import AssignmentSubmission from "../models/AssignmentSubmission.js";
import LessonProgress from "../models/LessonProgress.js";

export const submitAssignment = async (req, res) => {
  const { lessonId, mediaUrl, type = "video" } = req.body;
  const studentId = req.user.id;

  const submission = await AssignmentSubmission.create({
    student: studentId,
    lesson: lessonId,
    mediaUrl,
    type,
    status: "pending",
  });

  await LessonProgress.findOneAndUpdate(
    { user: studentId, lesson: lessonId },
    {
      assignmentRequired: true,
      assignmentStatus: "pending",
      assignmentSubmissionId: submission._id,
      lessonState: "assignment_pending",
    }
  );

  res.json(submission);
};

export const getLessonAssignments = async (req, res) => {
  const { lessonId } = req.params;

  const assignments = await AssignmentSubmission.find({ lesson: lessonId })
    .populate("student", "name email")
    .sort({ createdAt: -1 });

  res.json(assignments);
};

export const reviewAssignment = async (req, res) => {
  const { status, coachFeedback } = req.body;
  const assignment = await AssignmentSubmission.findById(req.params.id);

  if (!assignment) {
    return res.status(404).json({ message: "Assignment not found" });
  }

  assignment.status = status;
  assignment.coach = req.user.id;
  assignment.coachFeedback = coachFeedback || "";
  await assignment.save();

  if (status === "approved") {
    await LessonProgress.findOneAndUpdate(
      { user: assignment.student, lesson: assignment.lesson },
      {
        assignmentStatus: "approved",
        lessonState: "assignment_approved",
      }
    );
  }

  res.json(assignment);
};
