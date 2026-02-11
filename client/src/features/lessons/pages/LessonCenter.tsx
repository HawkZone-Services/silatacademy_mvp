import { useState } from "react";
import LessonList from "@/features/lessons/components/player/LessonList";
import LessonViewer from "@/features/lessons/components/player/LessonViewer";
import { Navbar } from "@/shared/ui/Navbar";
import { Footer } from "@/shared/ui/Footer";

export default function LessonCenter() {
  const [selectedLesson, setSelectedLesson] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container mx-auto px-4 py-8 space-y-6">
        <h1 className="text-3xl font-bold">Lessons</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <LessonList onSelect={(id: string) => setSelectedLesson(id)} />
          </div>

          <div className="lg:col-span-2">
            {selectedLesson ? (
              <LessonViewer
                lessonId={selectedLesson}
                onCompleted={() => {
                  /* handled in child */
                }}
              />
            ) : (
              <p className="text-muted-foreground">
                Select a lesson to start learning.
              </p>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
