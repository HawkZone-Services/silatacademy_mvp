// src/features/belt-ranking/types/beltRanking.types.ts

export interface BeltAttendanceRules {
  requiredSessions: number;
  requiredHours: number;
  minRate: number; // %
}

export interface BeltLessonRules {
  totalLessons: number;
  unlockEvery: number; // حضور → يفتح دروس
}

export interface BeltRanking {
  _id: string;
  name: string; // White Belt
  level: string; // Beginner
  order: number;

  attendance: BeltAttendanceRules;
  lessons: BeltLessonRules;

  requirements: string[];
  createdAt?: string;
}
