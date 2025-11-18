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
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { useLanguage } from "@/contexts/LanguageContext";

const attendanceTrendData = [
  { month: "Jan", attendance: 85 },
  { month: "Feb", attendance: 82 },
  { month: "Mar", attendance: 88 },
  { month: "Apr", attendance: 90 },
  { month: "May", attendance: 87 },
  { month: "Jun", attendance: 92 },
];

const beltDistributionData = [
  { belt: "White", count: 45 },
  { belt: "Yellow", count: 38 },
  { belt: "Orange", count: 32 },
  { belt: "Green", count: 28 },
  { belt: "Blue", count: 22 },
  { belt: "Purple", count: 18 },
  { belt: "Brown", count: 12 },
  { belt: "Black", count: 8 },
];

const roleBreakdownData = [
  { name: "Students", value: 203, color: "#8B0000" },
  { name: "Instructors", value: 12, color: "#FFD700" },
  { name: "Admins", value: 3, color: "#121212" },
];

const chartConfig = {
  attendance: {
    label: "Attendance %",
    color: "hsl(var(--primary))",
  },
  count: {
    label: "Students",
    color: "hsl(var(--secondary))",
  },
};

export const AdminCharts = () => {
  const { t, language } = useLanguage();

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* Attendance Trend Chart */}
      <Card>
        <CardHeader>
          <CardTitle>{t("dashboard.attendanceTrend")}</CardTitle>
          <CardDescription>{t("dashboard.monthlyAttendance")}</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={attendanceTrendData}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  className="stroke-border"
                />
                <XAxis dataKey="month" className="text-xs" />
                <YAxis className="text-xs" />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Line
                  type="monotone"
                  dataKey="attendance"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  dot={{ fill: "hsl(var(--primary))" }}
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Belt Distribution Chart */}
      <Card>
        <CardHeader>
          <CardTitle>{t("dashboard.beltDistribution")}</CardTitle>
          <CardDescription>{t("dashboard.studentsByBelt")}</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={beltDistributionData}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  className="stroke-border"
                />
                <XAxis
                  dataKey="belt"
                  className="text-xs"
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis className="text-xs" />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar
                  dataKey="count"
                  fill="hsl(var(--secondary))"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Role Breakdown Pie Chart */}
      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle>{t("dashboard.roleBreakdown")}</CardTitle>
          <CardDescription>{t("dashboard.usersByRole")}</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={roleBreakdownData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) =>
                    `${name} ${(percent * 100).toFixed(0)}%`
                  }
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {roleBreakdownData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <ChartTooltip content={<ChartTooltipContent />} />
              </PieChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
};
