export interface AttendanceRecord {
  id: string;
  date: string;
  lesson: string;
  status: "present" | "absent" | "late" | "excused";
  duration: string;
  coach: string;
  notes?: string;
}

export const generateMockAttendance = (
  playerId: string
): AttendanceRecord[] => {
  const lessons = [
    "Basic Techniques",
    "Advanced Forms",
    "Sparring Practice",
    "Weapons Training",
    "Conditioning",
    "Philosophy Class",
    "Belt Testing Prep",
    "Competition Training",
  ];

  const coaches = ["Master Ahmad", "Sensei Budi", "Coach Siti", "Master Rizki"];

  const statuses: Array<"present" | "absent" | "late" | "excused"> = [
    "present",
    "present",
    "present",
    "present",
    "late",
    "present",
    "absent",
    "excused",
  ];

  const records: AttendanceRecord[] = [];
  const today = new Date();

  for (let i = 0; i < 15; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() - i * 3);

    const status = statuses[Math.floor(Math.random() * statuses.length)];

    records.push({
      id: `${playerId}-attendance-${i}`,
      date: date.toISOString().split("T")[0],
      lesson: lessons[Math.floor(Math.random() * lessons.length)],
      status,
      duration:
        status === "absent"
          ? "0h"
          : `${Math.floor(Math.random() * 2) + 1}h ${Math.floor(
              Math.random() * 60
            )}m`,
      coach: coaches[Math.floor(Math.random() * coaches.length)],
      notes:
        status === "late"
          ? "Arrived 15 minutes late"
          : status === "excused"
          ? "Medical appointment"
          : undefined,
    });
  }

  return records.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
};

export const calculateAttendanceRate = (
  records: AttendanceRecord[]
): number => {
  const presentCount = records.filter(
    (r) => r.status === "present" || r.status === "late"
  ).length;
  return Math.round((presentCount / records.length) * 100);
};
