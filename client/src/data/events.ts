export interface Event {
  id: string;
  title: string;
  titleAr: string;
  description: string;
  descriptionAr: string;
  date: string;
  time: string;
  location: string;
  locationAr: string;
  type: "tournament" | "seminar" | "training" | "testing" | "cultural";
  status: "upcoming" | "ongoing" | "completed";
  capacity: number;
  registered: number;
  instructor?: string;
  beltLevel?: string;
  image?: string;
}

export const events: Event[] = [
  {
    id: "evt-001",
    title: "International Silat Championship 2025",
    titleAr: "بطولة السيلات الدولية 2025",
    description:
      "Join competitors from around the world in this prestigious annual tournament showcasing the best in Pencak Silat.",
    descriptionAr:
      "انضم إلى المتنافسين من جميع أنحاء العالم في هذه البطولة السنوية المرموقة التي تعرض الأفضل في بينشاك سيلات.",
    date: "2025-03-15",
    time: "09:00 AM",
    location: "Grand Arena, Kuala Lumpur",
    locationAr: "الساحة الكبرى، كوالالمبور",
    type: "tournament",
    status: "upcoming",
    capacity: 200,
    registered: 156,
    image: "/placeholder.svg",
  },
  {
    id: "evt-002",
    title: "Belt Testing Ceremony",
    titleAr: "حفل اختبار الأحزمة",
    description:
      "Quarterly testing for students advancing to their next belt level. Demonstrate your skills and progress.",
    descriptionAr:
      "اختبار ربع سنوي للطلاب المتقدمين إلى مستوى الحزام التالي. أظهر مهاراتك وتقدمك.",
    date: "2025-02-20",
    time: "02:00 PM",
    location: "Main Training Hall",
    locationAr: "قاعة التدريب الرئيسية",
    type: "testing",
    status: "upcoming",
    capacity: 50,
    registered: 38,
    beltLevel: "All Levels",
  },
  {
    id: "evt-003",
    title: "Master Class: Advanced Techniques",
    titleAr: "فصل الماجستير: التقنيات المتقدمة",
    description:
      "Exclusive seminar with Master Ahmad covering advanced locking and throwing techniques.",
    descriptionAr:
      "ندوة حصرية مع الماستر أحمد تغطي تقنيات القفل والرمي المتقدمة.",
    date: "2025-01-25",
    time: "10:00 AM",
    location: "Advanced Training Center",
    locationAr: "مركز التدريب المتقدم",
    type: "seminar",
    status: "upcoming",
    capacity: 30,
    registered: 28,
    instructor: "Master Ahmad Zulkifli",
    beltLevel: "Brown & Black Belt",
  },
  {
    id: "evt-004",
    title: "Beginner Workshop: Introduction to Silat",
    titleAr: "ورشة عمل للمبتدئين: مقدمة في السيلات",
    description:
      "Perfect for newcomers! Learn the fundamentals of Pencak Silat in this hands-on workshop.",
    descriptionAr:
      "مثالي للقادمين الجدد! تعلم أساسيات بينشاك سيلات في هذه الورشة العملية.",
    date: "2025-01-18",
    time: "06:00 PM",
    location: "Community Center Hall",
    locationAr: "قاعة المركز المجتمعي",
    type: "training",
    status: "upcoming",
    capacity: 40,
    registered: 22,
    instructor: "Coach Sarah",
    beltLevel: "Beginners",
  },
  {
    id: "evt-005",
    title: "Cultural Night: The Heritage of Silat",
    titleAr: "الليلة الثقافية: تراث السيلات",
    description:
      "Celebrate the rich history and cultural significance of Pencak Silat with traditional performances and exhibitions.",
    descriptionAr:
      "احتفل بالتاريخ الغني والأهمية الثقافية لبينشاك سيلات مع العروض والمعارض التقليدية.",
    date: "2025-02-10",
    time: "07:00 PM",
    location: "Cultural Center Auditorium",
    locationAr: "قاعة المركز الثقافي",
    type: "cultural",
    status: "upcoming",
    capacity: 150,
    registered: 89,
  },
  {
    id: "evt-006",
    title: "Regional Championship Finals",
    titleAr: "نهائيات البطولة الإقليمية",
    description:
      "The culmination of months of competition. Watch our top students compete for regional titles.",
    descriptionAr:
      "ذروة أشهر من المنافسة. شاهد أفضل طلابنا يتنافسون على الألقاب الإقليمية.",
    date: "2024-12-15",
    time: "11:00 AM",
    location: "Sports Complex Arena",
    locationAr: "ساحة المجمع الرياضي",
    type: "tournament",
    status: "completed",
    capacity: 300,
    registered: 300,
  },
];

export const getUpcomingEvents = () =>
  events.filter((e) => e.status === "upcoming");
export const getEventsByType = (type: Event["type"]) =>
  events.filter((e) => e.type === type);
