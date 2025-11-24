import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const API = "https://api-f3rwhuz64a-uc.a.run.app/api";

export default function AnalyticsDashboard() {
  const [students, setStudents] = useState([]);
  const [belts, setBelts] = useState([]);
  const [exams, setExams] = useState([]);
  const [lessons, setLessons] = useState([]);

  const token =
    localStorage.getItem("token") || sessionStorage.getItem("token");

  const fetchAll = async () => {
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const [s, b, e, l] = await Promise.all([
        fetch(`${API}/analytics/students`, { headers }),
        fetch(`${API}/analytics/belt`, { headers }),
        fetch(`${API}/analytics/exams`, { headers }),
        fetch(`${API}/analytics/lessons`, { headers }),
      ]);
      const [sj, bj, ej, lj] = await Promise.all([
        s.json(),
        b.json(),
        e.json(),
        l.json(),
      ]);
      setStudents(sj.students || []);
      setBelts(bj.progression || []);
      setExams(ej.exams || []);
      setLessons(lj.lessons || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (token) fetchAll();
  }, [token]);

  return (
    <Card className="p-4 space-y-4">
      <Tabs defaultValue="students">
        <TabsList className="grid grid-cols-4">
          <TabsTrigger value="students">Students</TabsTrigger>
          <TabsTrigger value="belts">Belt Progression</TabsTrigger>
          <TabsTrigger value="exams">Exams</TabsTrigger>
          <TabsTrigger value="lessons">Lessons</TabsTrigger>
        </TabsList>

        <TabsContent value="students">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Belt</th>
                  <th>Attempts</th>
                  <th>Certificates</th>
                  <th>Last Attempt</th>
                </tr>
              </thead>
              <tbody>
                {students.map((s) => (
                  <tr key={s._id}>
                    <td>{s.name}</td>
                    <td>{s.email}</td>
                    <td>{s.beltLevel}</td>
                    <td>{s.attemptsCount}</td>
                    <td>{s.certificatesCount}</td>
                    <td>
                      {s.lastAttemptAt
                        ? new Date(s.lastAttemptAt).toLocaleString()
                        : "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </TabsContent>

        <TabsContent value="belts">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {belts.map((b) => (
              <Card key={b.belt} className="p-3">
                <p className="text-sm text-muted-foreground">{b.belt}</p>
                <p className="text-2xl font-bold">{b.count}</p>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="exams">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr>
                  <th>Exam</th>
                  <th>Belt</th>
                  <th>Attempts</th>
                  <th>Avg Score</th>
                  <th>Pass Rate</th>
                </tr>
              </thead>
              <tbody>
                {exams.map((e) => (
                  <tr key={e._id}>
                    <td>{e.title}</td>
                    <td>{e.beltLevel}</td>
                    <td>{e.attempts}</td>
                    <td>{Math.round(e.avgScore || 0)}</td>
                    <td>{Math.round((e.passRate || 0) * 100)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </TabsContent>

        <TabsContent value="lessons">
          <div className="space-y-2 text-sm">
            {lessons.map((l) => (
              <div key={l._id} className="flex justify-between border-b pb-1">
                <span>{l.title}</span>
                <span>{l.count} completions</span>
              </div>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </Card>
  );
}
