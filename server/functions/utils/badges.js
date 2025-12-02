export const BADGE_RULES = [
  {
    id: "first-lesson",
    title: "First Lesson",
    check: (player) => player.totalLessonsCompleted >= 1,
  },
  {
    id: "fast-learner",
    title: "Fast Learner",
    check: (player) => player.totalLessonsCompleted >= 20,
  },
  {
    id: "exam-master",
    title: "Exam Master",
    check: (player) => player.totalExamsPassed >= 5,
  },
  {
    id: "streak-7",
    title: "7-Day Streak",
    check: (player) => player.streakDays >= 7,
  },
  {
    id: "level-5",
    title: "Level 5 Achieved",
    check: (player) => player.level >= 5,
  },
];
