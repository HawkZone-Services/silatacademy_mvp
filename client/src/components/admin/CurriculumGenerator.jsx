import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import certificateService from "@/services/certificateService";

const API = "https://api-f3rwhuz64a-uc.a.run.app/api";

export default function CurriculumGenerator() {
  const [belt, setBelt] = useState("white");
  const [loading, setLoading] = useState(false);

  const token =
    localStorage.getItem("token") || sessionStorage.getItem("token");

  const download = async () => {
    setLoading(true);
    try {
      const res = await certificateService.getCurriculumPDF(belt);
      if (!res.ok) throw new Error("Failed to generate curriculum");
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `curriculum-${belt}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      alert(err?.message || "Failed to download curriculum");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="p-4 space-y-3">
      <div className="flex items-center gap-3">
        <Select value={belt} onValueChange={setBelt}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Select belt" />
          </SelectTrigger>
          <SelectContent>
            {["white", "yellow", "blue", "brown", "red", "black"].map((b) => (
              <SelectItem key={b} value={b}>
                {b.toUpperCase()} Belt
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button onClick={download} disabled={loading}>
          {loading ? "Generating..." : "Download Curriculum PDF"}
        </Button>
      </div>
    </Card>
  );
}
