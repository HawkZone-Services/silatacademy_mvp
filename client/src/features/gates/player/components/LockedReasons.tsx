import { LockedItem } from "./LockedItem";

export function LockedReasons({ reasons }: { reasons: any }) {
  return (
    <div className="space-y-3">
      <LockedItem
        label="Attendance"
        current={reasons.attendance.current}
        required={reasons.attendance.required}
        rate={reasons.attendance.rate}
        minRate={reasons.attendance.minRate}
        passed={reasons.attendance.passed}
      />

      <LockedItem
        label="Lessons"
        current={reasons.lessons.completed}
        required={reasons.lessons.required}
        passed={reasons.lessons.passed}
      />

      <LockedItem
        label="Lesson Quizzes"
        passed={reasons.quiz.passed}
        type="boolean"
      />
    </div>
  );
}
