import { useEffect, useState } from "react";
import { Card } from "@/shared/ui/card";
import { Input } from "@/shared/ui/input";
import { Button } from "@/shared/ui/button";
import coachService from "@/features/coaches/api/coachService";

export default function PlayerProgress() {
  const [playerId, setPlayerId] = useState("");
  const [lessons, setLessons] = useState([]);
  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(false);

  const token =
    localStorage.getItem("token") || sessionStorage.getItem("token");

  const fetchData = async () => {
    if (!playerId || !token) return;
    setLoading(true);
    try {
      const [lessonRes, attemptRes] = await Promise.all([
        coachService.getPlayerLessons(playerId),
        coachService.getPlayerExams(playerId),
      ]);

      const lessonsData = await lessonRes.json();
      const attemptsData = await attemptRes.json();

      if (lessonsData?.success && Array.isArray(lessonsData.progress)) {
        setLessons(lessonsData.progress);
      } else {
        setLessons([]);
      }

      if (attemptsData?.success && Array.isArray(attemptsData.attempts)) {
        setAttempts(attemptsData.attempts);
      } else {
        setAttempts([]);
      }
    } catch (err) {
      console.error(err);
      setLessons([]);
      setAttempts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // no-op initial
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Input
          placeholder="Player ID"
          value={playerId}
          onChange={(e) => setPlayerId(e.target.value)}
        />
        <Button onClick={fetchData} disabled={loading || !playerId}>
          {loading ? "Loading..." : "Load Progress"}
        </Button>
      </div>

      <Card className="p-4">
        <p className="font-semibold mb-2">Lesson Progress</p>
        {lessons.length === 0 ? (
          <p className="text-sm text-muted-foreground">No lesson progress.</p>
        ) : (
          <ul className="space-y-2 text-sm">
            {lessons.map((lp) => (
              <li key={lp._id}>
                {lp.lesson?.title || "Lesson"} —{" "}
                {lp.completed ? "Completed" : "In Progress"} (
                {lp.quizScore ?? 0}% quiz)
              </li>
            ))}
          </ul>
        )}
      </Card>

      <Card className="p-4">
        <p className="font-semibold mb-2">Exam Attempts</p>
        {attempts.length === 0 ? (
          <p className="text-sm text-muted-foreground">No attempts.</p>
        ) : (
          <ul className="space-y-2 text-sm">
            {attempts.map((att) => (
              <li key={att._id}>
                {att.exam?.title || "Exam"} — Theory: {att.theoryScore ?? 0} —{" "}
                {att.finalPassed !== undefined
                  ? att.finalPassed
                    ? "Passed"
                    : "Failed"
                  : "Pending"}
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
