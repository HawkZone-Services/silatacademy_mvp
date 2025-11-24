import AnalyticsDashboard from "./AnalyticsDashboard";
import { Card } from "@/components/ui/card";

export default function AdminReports() {
  return (
    <Card className="p-4">
      <h2 className="text-xl font-bold mb-3">Analytics</h2>
      <AnalyticsDashboard />
    </Card>
  );
}
