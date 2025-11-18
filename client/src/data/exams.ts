export interface ExamQuestion {
  id: string;
  question: string;
  questionAr: string;
  options: string[];
  optionsAr: string[];
  correctAnswer: number;
  explanation: string;
  explanationAr: string;
}

export interface Exam {
  id: string;
  title: string;
  titleAr: string;
  description: string;
  descriptionAr: string;
  beltLevel: string;
  duration: number; // in minutes
  passingScore: number;
  totalQuestions: number;
  questions: ExamQuestion[];
  type: "theory" | "practical" | "combined";
}

export interface ExamResult {
  id: string;
  examId: string;
  studentId: string;
  studentName: string;
  score: number;
  totalQuestions: number;
  passed: boolean;
  completedAt: string;
  answers: number[];
  theoryScore?: number;
  practicalScore?: number;
}

export const exams: Exam[] = [
  {
    id: "exam-001",
    title: "White Belt Theory Exam",
    titleAr: "اختبار نظري للحزام الأبيض",
    description:
      "Fundamental theory covering basic stances, strikes, and Silat philosophy",
    descriptionAr:
      "النظرية الأساسية التي تغطي المواقف الأساسية والضربات وفلسفة السيلات",
    beltLevel: "White",
    duration: 30,
    passingScore: 70,
    totalQuestions: 10,
    type: "theory",
    questions: [
      {
        id: "q1",
        question: "What is the primary principle of Pencak Silat?",
        questionAr: "ما هو المبدأ الأساسي لبينشاك سيلات؟",
        options: [
          "Aggression and power",
          "Harmony between body, mind, and spirit",
          "Speed above all",
          "Winning at any cost",
        ],
        optionsAr: [
          "العدوان والقوة",
          "الانسجام بين الجسد والعقل والروح",
          "السرعة قبل كل شيء",
          "الفوز بأي ثمن",
        ],
        correctAnswer: 1,
        explanation:
          "Pencak Silat emphasizes the harmony between physical, mental, and spiritual development.",
        explanationAr:
          "يؤكد بينشاك سيلات على الانسجام بين التطور الجسدي والعقلي والروحي.",
      },
      {
        id: "q2",
        question: "Which region is Pencak Silat originally from?",
        questionAr: "من أي منطقة نشأ بينشاك سيلات؟",
        options: [
          "East Asia",
          "Middle East",
          "Southeast Asia",
          "South America",
        ],
        optionsAr: [
          "شرق آسيا",
          "الشرق الأوسط",
          "جنوب شرق آسيا",
          "أمريكا الجنوبية",
        ],
        correctAnswer: 2,
        explanation:
          "Pencak Silat originated in the Malay Archipelago of Southeast Asia.",
        explanationAr: "نشأ بينشاك سيلات في أرخبيل الملايو في جنوب شرق آسيا.",
      },
    ],
  },
  {
    id: "exam-002",
    title: "Yellow Belt Theory Exam",
    titleAr: "اختبار نظري للحزام الأصفر",
    description:
      "Theory covering intermediate techniques, defense strategies, and movement principles",
    descriptionAr:
      "النظرية التي تغطي التقنيات المتوسطة واستراتيجيات الدفاع ومبادئ الحركة",
    beltLevel: "Yellow",
    duration: 45,
    passingScore: 75,
    totalQuestions: 15,
    type: "theory",
    questions: [
      {
        id: "q1",
        question: 'What does "Langkah" refer to in Silat?',
        questionAr: 'ماذا يعني "لانجكا" في السيلات؟',
        options: [
          "Strike technique",
          "Footwork and stepping patterns",
          "Blocking method",
          "Weapon training",
        ],
        optionsAr: [
          "تقنية الضربة",
          "أنماط العمل بالقدمين والخطوات",
          "طريقة الحجب",
          "تدريب الأسلحة",
        ],
        correctAnswer: 1,
        explanation:
          "Langkah refers to the footwork patterns that are fundamental to Silat movement.",
        explanationAr:
          "يشير لانجكا إلى أنماط العمل بالقدمين التي تعتبر أساسية لحركة السيلات.",
      },
    ],
  },
  {
    id: "exam-003",
    title: "Brown Belt Combined Assessment",
    titleAr: "التقييم المشترك للحزام البني",
    description:
      "Comprehensive examination combining theory knowledge and practical demonstration",
    descriptionAr: "اختبار شامل يجمع بين المعرفة النظرية والعرض العملي",
    beltLevel: "Brown",
    duration: 90,
    passingScore: 80,
    totalQuestions: 20,
    type: "combined",
    questions: [],
  },
];

export const mockExamResults: ExamResult[] = [
  {
    id: "result-001",
    examId: "exam-001",
    studentId: "1",
    studentName: "Ahmad Hassan",
    score: 85,
    totalQuestions: 10,
    passed: true,
    completedAt: "2024-12-10T14:30:00Z",
    answers: [1, 2, 0, 1, 2, 1, 0, 1, 2, 1],
    theoryScore: 85,
  },
  {
    id: "result-002",
    examId: "exam-002",
    studentId: "1",
    studentName: "Ahmad Hassan",
    score: 90,
    totalQuestions: 15,
    passed: true,
    completedAt: "2024-11-15T10:00:00Z",
    answers: [],
    theoryScore: 90,
  },
];
