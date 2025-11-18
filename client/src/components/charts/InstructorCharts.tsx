import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";
import { useLanguage } from "@/contexts/LanguageContext";

const examScoresData = [
  { exam: "Belt Test 1", avgScore: 85, submissions: 28 },
  { exam: "Belt Test 2", avgScore: 78, submissions: 25 },
  { exam: "Technique Test", avgScore: 92, submissions: 30 },
  { exam: "Form Assessment", avgScore: 88, submissions: 27 },
  { exam: "Sparring Eval", avgScore: 80, submissions: 22 },
];

const submissionStatusData = [
  { status: "Graded", count: 45 },
  { status: "Pending", count: 12 },
  { status: "Reviewed", count: 38 },
];

const chartConfig = {
  avgScore: {
    label: "Average Score",
    color: "hsl(var(--primary))",
  },
  submissions: {
    label: "Submissions",
    color: "hsl(var(--secondary))",
  },
  count: {
    label: "Count",
    color: "hsl(var(--accent))",
  },
};

export const InstructorCharts = () => {
  const { t } = useLanguage();

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* Exam Scores Chart */}
      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle>{t("dashboard.examPerformance")}</CardTitle>
          <CardDescription>
            {t("dashboard.avgScoresAndSubmissions")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={examScoresData}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  className="stroke-border"
                />
                <XAxis
                  dataKey="exam"
                  className="text-xs"
                  angle={-45}
                  textAnchor="end"
                  height={100}
                />
                <YAxis yAxisId="left" orientation="left" className="text-xs" />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  className="text-xs"
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar
                  yAxisId="left"
                  dataKey="avgScore"
                  fill="hsl(var(--primary))"
                  radius={[4, 4, 0, 0]}
                />
                <Bar
                  yAxisId="right"
                  dataKey="submissions"
                  fill="hsl(var(--secondary))"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Submission Status */}
      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle>{t("dashboard.submissionStatus")}</CardTitle>
          <CardDescription>
            {t("dashboard.examSubmissionsByStatus")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={submissionStatusData} layout="vertical">
                <CartesianGrid
                  strokeDasharray="3 3"
                  className="stroke-border"
                />
                <XAxis type="number" className="text-xs" />
                <YAxis type="category" dataKey="status" className="text-xs" />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar
                  dataKey="count"
                  fill="hsl(var(--accent))"
                  radius={[0, 4, 4, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
};
