// src/features/student/dashboard/types.ts

export type BeltLevel = "white" | "yellow" | "blue" | "brown" | "red" | "black";

export interface StudentInfo {
  _id: string;
  name: string;
  beltLevel?: BeltLevel;
  beltLabel?: string;
  beltColor?: string;
  stats?: {
    power?: number;
    flexibility?: number;
    endurance?: number;
    speed?: number;
  };
}

export interface AttendanceSummary {
  totalSessions: number;
  attendedSessions: number;

  // 🆕 من BeltRanking
  requiredSessions: number;
  minRate: number;

  attendanceRate: number; // محسوبة مقابل requiredSessions
  eligible: boolean;

  lastSessionDate?: string | null;
}

export interface LessonItem {
  _id: string;
  title: string;
  beltLevel?: BeltLevel;
  programLevel?: "beginner" | "intermediate" | "advanced";
  completed?: boolean;
  locked?: boolean;
  lockedReason?: string | null;
  isEligible?: boolean;
  reasonIfNotEligible?: string | null;
}

export interface ExamItem {
  _id: string;
  title: string;
  beltLevel: BeltLevel;
  status: string; // published / draft / ...
  locked?: boolean;
  isEligible?: boolean;
  lockedReason?: string | null;
  reasonIfNotEligible?: string | null;
  lessonsRequired?: number;
  lessonsCompleted?: number;
}

export interface AttemptItem {
  _id: string;
  exam: {
    _id: string;
    title: string;
    beltLevel: BeltLevel;
    maxTheoryScore?: number;
  };
  theoryScore?: number;
  finalTotalScore?: number;
  finalPassed?: boolean;
  submittedAt?: string;
  finalizedAt?: string;
}

export interface CertificateItem {
  _id: string;
  title?: string;
  beltLevel?: BeltLevel;
  type?: string;
  issuedAt?: string;
}

// ======================
// Helpers: belt UI
// ======================
export const beltLabel = (belt?: BeltLevel) => {
  if (!belt) return "Unranked";
  return `${belt.charAt(0).toUpperCase()}${belt.slice(1)}`;
};

export const beltColorClass = (belt?: BeltLevel) => {
  switch (belt) {
    case "white":
      return "bg-white text-black border";
    case "yellow":
      return "bg-yellow-400 text-black";
    case "blue":
      return "bg-blue-500 text-white";
    case "brown":
      return "bg-amber-800 text-white";
    case "red":
      return "bg-red-500 text-white";
    case "black":
      return "bg-black text-white";
    default:
      return "bg-muted text-foreground";
  }
};

export interface BeltAttendanceProgress {
  attendedSessions: number;
  requiredSessions: number;
  minRate: number;
  attendanceRate: number;
  eligible: boolean;
}
