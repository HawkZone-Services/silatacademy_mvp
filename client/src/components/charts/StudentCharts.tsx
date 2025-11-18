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
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";
import { useLanguage } from "@/contexts/LanguageContext";

const skillsData = [
  { skill: "Power", value: 85 },
  { skill: "Endurance", value: 78 },
  { skill: "Flexibility", value: 92 },
  { skill: "Reaction", value: 88 },
  { skill: "Technique", value: 80 },
  { skill: "Mental", value: 75 },
];

const progressData = [
  { month: "Jan", score: 65 },
  { month: "Feb", score: 68 },
  { month: "Mar", score: 72 },
  { month: "Apr", score: 75 },
  { month: "May", score: 78 },
  { month: "Jun", score: 82 },
];

const chartConfig = {
  value: {
    label: "Score",
    color: "hsl(var(--primary))",
  },
  score: {
    label: "Performance",
    color: "hsl(var(--secondary))",
  },
};

export const StudentCharts = () => {
  const { t } = useLanguage();

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* Skills Radar Chart */}
      <Card>
        <CardHeader>
          <CardTitle>{t("dashboard.skillsAssessment")}</CardTitle>
          <CardDescription>{t("dashboard.currentSkillLevels")}</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={skillsData}>
                <PolarGrid stroke="hsl(var(--border))" />
                <PolarAngleAxis dataKey="skill" className="text-xs" />
                <PolarRadiusAxis
                  angle={90}
                  domain={[0, 100]}
                  className="text-xs"
                />
                <Radar
                  name="Skills"
                  dataKey="value"
                  stroke="hsl(var(--primary))"
                  fill="hsl(var(--primary))"
                  fillOpacity={0.6}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
              </RadarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Progress Over Time */}
      <Card>
        <CardHeader>
          <CardTitle>{t("dashboard.progressOverTime")}</CardTitle>
          <CardDescription>{t("dashboard.monthlyPerformance")}</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={progressData}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  className="stroke-border"
                />
                <XAxis dataKey="month" className="text-xs" />
                <YAxis domain={[0, 100]} className="text-xs" />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Line
                  type="monotone"
                  dataKey="score"
                  stroke="hsl(var(--secondary))"
                  strokeWidth={3}
                  dot={{ fill: "hsl(var(--secondary))", r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
};
