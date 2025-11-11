export interface PlayerStats {
  power: number;
  flexibility: number;
  endurance: number;
  speed: number;
}

export interface Achievement {
  title: string;
  date: string;
  description: string;
  type: "competition" | "belt" | "workshop" | "certificate";
}

export interface HealthRecord {
  status: "excellent" | "good" | "fair" | "attention-needed";
  lastCheckup: string;
  injuries: string[];
  nutritionPlan: string;
  restSchedule: string;
  medicalNotes?: string;
}

export interface TrainingLog {
  date: string;
  focus: string;
  attendance: boolean;
  performanceNotes: string;
  coachRemarks: string;
}

export interface Player {
  id: string;
  name: string;
  belt: string;
  beltColor: string;
  age: number;
  height: string;
  weight: string;
  trainingStartDate: string;
  trainingYears: number;
  coach: string;
  stats: PlayerStats;
  achievements: Achievement[];
  health: HealthRecord;
  trainingLogs: TrainingLog[];
  currentFocus: string;
  email: string;
  phone: string;
}

export const players: Player[] = [
  {
    id: "1",
    name: "Ahmad Rizki",
    belt: "Black Belt",
    beltColor: "#1a1a1a",
    age: 24,
    height: "175 cm",
    weight: "68 kg",
    trainingStartDate: "2016-03-15",
    trainingYears: 8,
    coach: "Master Suharto",
    email: "ahmad.rizki@example.com",
    phone: "+62 812-1111-1111",
    stats: { power: 92, flexibility: 88, endurance: 95, speed: 90 },
    currentFocus: "Competition preparation and advanced weapons training",
    achievements: [
      {
        title: "National Championship Gold Medal",
        date: "2024-08-15",
        description:
          "1st place in men's advanced category, Jakarta National Tournament",
        type: "competition",
      },
      {
        title: "Black Belt Promotion",
        date: "2023-12-10",
        description:
          "Successfully promoted to Black Belt after rigorous examination",
        type: "belt",
      },
      {
        title: "Advanced Weapons Workshop",
        date: "2023-06-20",
        description: "Completed intensive kerambit and staff training workshop",
        type: "workshop",
      },
      {
        title: "Instructor Certification",
        date: "2024-02-01",
        description: "Certified to teach beginner and intermediate levels",
        type: "certificate",
      },
    ],
    health: {
      status: "excellent",
      lastCheckup: "2024-09-01",
      injuries: [],
      nutritionPlan: "High protein, balanced carbs, 3000 cal/day",
      restSchedule: "8 hours sleep, active recovery Sundays",
      medicalNotes: "All vitals normal, excellent cardiovascular health",
    },
    trainingLogs: [
      {
        date: "2024-10-14",
        focus: "Speed drills and reaction training",
        attendance: true,
        performanceNotes:
          "Exceptional speed improvement, 15% faster response time",
        coachRemarks:
          "Outstanding progress, ready for competition level drills",
      },
      {
        date: "2024-10-12",
        focus: "Advanced Jurus refinement",
        attendance: true,
        performanceNotes: "Perfect form execution, teaching junior students",
        coachRemarks: "Natural leadership qualities emerging",
      },
      {
        date: "2024-10-10",
        focus: "Sparring and combat application",
        attendance: true,
        performanceNotes: "Excellent tactical awareness and control",
        coachRemarks: "Competition-ready performance",
      },
    ],
  },
  {
    id: "2",
    name: "Siti Nurhaliza",
    belt: "Brown Belt",
    beltColor: "#8B4513",
    age: 21,
    height: "162 cm",
    weight: "55 kg",
    trainingStartDate: "2019-06-01",
    trainingYears: 5,
    coach: "Sensei Wulan",
    email: "siti.nurhaliza@example.com",
    phone: "+62 812-2222-2222",
    stats: { power: 85, flexibility: 92, endurance: 88, speed: 87 },
    currentFocus: "Black belt preparation and flexibility mastery",
    achievements: [
      {
        title: "Regional Competition Silver Medal",
        date: "2024-07-20",
        description: "2nd place in women's intermediate category",
        type: "competition",
      },
      {
        title: "Brown Belt Promotion",
        date: "2024-01-15",
        description: "Promoted to Brown Belt with honors",
        type: "belt",
      },
      {
        title: "Flexibility Master Workshop",
        date: "2023-09-10",
        description: "Advanced stretching and mobility certification",
        type: "workshop",
      },
    ],
    health: {
      status: "excellent",
      lastCheckup: "2024-08-15",
      injuries: [],
      nutritionPlan: "Balanced diet, 2400 cal/day, high in omega-3",
      restSchedule: "7-8 hours sleep, yoga on rest days",
    },
    trainingLogs: [
      {
        date: "2024-10-14",
        focus: "Advanced combinations and flow",
        attendance: true,
        performanceNotes: "Exceptional fluidity and grace in movements",
        coachRemarks: "Ready for black belt technical examination",
      },
      {
        date: "2024-10-11",
        focus: "Power generation techniques",
        attendance: true,
        performanceNotes: "Improved striking power by 20%",
        coachRemarks: "Great progress on power development",
      },
    ],
  },
  {
    id: "3",
    name: "Budi Santoso",
    belt: "Blue Belt",
    beltColor: "#1E40AF",
    age: 19,
    height: "170 cm",
    weight: "62 kg",
    trainingStartDate: "2021-09-01",
    trainingYears: 3,
    coach: "Master Suharto",
    email: "budi.santoso@example.com",
    phone: "+62 812-3333-3333",
    stats: { power: 78, flexibility: 80, endurance: 82, speed: 79 },
    currentFocus: "Intermediate Jurus mastery and stamina building",
    achievements: [
      {
        title: "Blue Belt Promotion",
        date: "2023-11-20",
        description: "Successfully promoted to Blue Belt",
        type: "belt",
      },
      {
        title: "Youth Championship Bronze Medal",
        date: "2024-05-10",
        description: "3rd place in youth division",
        type: "competition",
      },
    ],
    health: {
      status: "good",
      lastCheckup: "2024-09-10",
      injuries: ["Minor ankle sprain (recovered)"],
      nutritionPlan: "Growth-focused diet, 2800 cal/day",
      restSchedule: "8 hours sleep, stretching daily",
      medicalNotes: "Ankle fully recovered, cleared for full training",
    },
    trainingLogs: [
      {
        date: "2024-10-13",
        focus: "Endurance and cardio training",
        attendance: true,
        performanceNotes: "Stamina improving steadily",
        coachRemarks: "Good dedication, needs more sparring practice",
      },
    ],
  },
  {
    id: "4",
    name: "Dewi Kusuma",
    belt: "Brown Belt",
    beltColor: "#8B4513",
    age: 22,
    height: "165 cm",
    weight: "58 kg",
    trainingStartDate: "2018-08-15",
    trainingYears: 6,
    coach: "Sensei Wulan",
    email: "dewi.kusuma@example.com",
    phone: "+62 812-4444-4444",
    stats: { power: 88, flexibility: 90, endurance: 86, speed: 89 },
    currentFocus: "Teaching assistant duties and black belt preparation",
    achievements: [
      {
        title: "Brown Belt Promotion",
        date: "2023-10-05",
        description: "Promoted to Brown Belt",
        type: "belt",
      },
      {
        title: "Assistant Instructor Workshop",
        date: "2024-03-15",
        description: "Completed teaching methodology training",
        type: "workshop",
      },
    ],
    health: {
      status: "excellent",
      lastCheckup: "2024-08-20",
      injuries: [],
      nutritionPlan: "Athlete diet, 2500 cal/day",
      restSchedule: "7-8 hours sleep, meditation practice",
    },
    trainingLogs: [
      {
        date: "2024-10-14",
        focus: "Teaching practice with beginners",
        attendance: true,
        performanceNotes: "Excellent teaching skills demonstrated",
        coachRemarks: "Natural instructor, helping students progress well",
      },
    ],
  },
  {
    id: "5",
    name: "Fikri Rahman",
    belt: "Blue Belt",
    beltColor: "#1E40AF",
    age: 18,
    height: "168 cm",
    weight: "60 kg",
    trainingStartDate: "2022-02-10",
    trainingYears: 2,
    coach: "Master Suharto",
    email: "fikri.rahman@example.com",
    phone: "+62 812-5555-5555",
    stats: { power: 75, flexibility: 77, endurance: 80, speed: 76 },
    currentFocus: "Basic combinations and coordination improvement",
    achievements: [
      {
        title: "Blue Belt Promotion",
        date: "2024-06-01",
        description: "Promoted to Blue Belt",
        type: "belt",
      },
    ],
    health: {
      status: "good",
      lastCheckup: "2024-07-15",
      injuries: [],
      nutritionPlan: "Balanced growth diet, 2600 cal/day",
      restSchedule: "8-9 hours sleep for growth phase",
    },
    trainingLogs: [
      {
        date: "2024-10-12",
        focus: "Basic Jurus practice",
        attendance: true,
        performanceNotes: "Steady improvement in form",
        coachRemarks: "Keep practicing fundamentals",
      },
    ],
  },
  {
    id: "6",
    name: "Maya Putri",
    belt: "Green Belt",
    beltColor: "#16A34A",
    age: 20,
    height: "160 cm",
    weight: "52 kg",
    trainingStartDate: "2020-10-01",
    trainingYears: 4,
    coach: "Sensei Wulan",
    email: "maya.putri@example.com",
    phone: "+62 812-6666-6666",
    stats: { power: 80, flexibility: 85, endurance: 78, speed: 82 },
    currentFocus: "Sparring introduction and breathing control",
    achievements: [
      {
        title: "Green Belt Promotion",
        date: "2023-08-15",
        description: "Promoted to Green Belt",
        type: "belt",
      },
      {
        title: "Breathing Control Workshop",
        date: "2024-04-10",
        description: "Advanced breathing techniques certification",
        type: "workshop",
      },
    ],
    health: {
      status: "excellent",
      lastCheckup: "2024-09-05",
      injuries: [],
      nutritionPlan: "Balanced diet, 2300 cal/day",
      restSchedule: "7-8 hours sleep, flexibility work daily",
    },
    trainingLogs: [
      {
        date: "2024-10-13",
        focus: "Sparring basics and control",
        attendance: true,
        performanceNotes: "Learning defensive techniques well",
        coachRemarks: "Good control and awareness developing",
      },
    ],
  },
];
