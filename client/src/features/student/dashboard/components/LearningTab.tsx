// src/features/student/dashboard/components/LearningTab.tsx

import { TabsContent } from "@/components/ui/tabs";
import StudentLessonsPage from "@/features/lessons/pages/StudentLessonsPage";

export default function LearningTab() {
  return (
    <TabsContent value="learning" className="space-y-4">
      <StudentLessonsPage />
    </TabsContent>
  );
}
