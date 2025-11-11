import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Award, Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const beltLevels = [
  { value: "white", label: "White Belt", color: "#FFFFFF" },
  { value: "yellow", label: "Yellow Belt", color: "#FFD700" },
  { value: "green", label: "Green Belt", color: "#00A86B" },
  { value: "blue", label: "Blue Belt", color: "#0047AB" },
  { value: "brown", label: "Brown Belt", color: "#964B00" },
  { value: "black", label: "Black Belt", color: "#000000" },
];

export const CertificateGenerator = () => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: "",
    beltLevel: "",
    date: new Date().toISOString().split("T")[0],
  });
  const [showPreview, setShowPreview] = useState(false);

  const handleGenerate = () => {
    if (!formData.name.trim() || !formData.beltLevel) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }
    setShowPreview(true);
  };

  const handleDownload = () => {
    toast({
      title: "Certificate Generated!",
      description: "Your certificate has been downloaded successfully.",
    });
  };

  const selectedBelt = beltLevels.find((b) => b.value === formData.beltLevel);

  return (
    <div className="space-y-6">
      <Card className="gradient-card shadow-card border-border/40">
        <div className="p-8 space-y-6">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-lg bg-accent flex items-center justify-center border border-secondary/20">
              <Award className="h-6 w-6 text-secondary" />
            </div>
            <div>
              <h3 className="font-display text-2xl font-bold">
                Digital Certificate
              </h3>
              <p className="text-sm text-muted-foreground">
                Generate your belt achievement certificate
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="certName">Full Name *</Label>
              <Input
                id="certName"
                placeholder="Enter your full name"
                value={formData.name}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, name: e.target.value }))
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="beltLevel">Belt Level *</Label>
              <Select
                value={formData.beltLevel}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, beltLevel: value }))
                }
              >
                <SelectTrigger id="beltLevel">
                  <SelectValue placeholder="Select belt level" />
                </SelectTrigger>
                <SelectContent>
                  {beltLevels.map((belt) => (
                    <SelectItem key={belt.value} value={belt.value}>
                      <div className="flex items-center gap-2">
                        <div
                          className="h-3 w-3 rounded-full border border-border"
                          style={{ backgroundColor: belt.color }}
                        />
                        {belt.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="certDate">Achievement Date</Label>
              <Input
                id="certDate"
                type="date"
                value={formData.date}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, date: e.target.value }))
                }
              />
            </div>
          </div>

          <Button onClick={handleGenerate} className="w-full">
            <Award className="mr-2 h-4 w-4" />
            Generate Certificate
          </Button>
        </div>
      </Card>

      {showPreview && (
        <Card className="gradient-card shadow-card border-border/40 overflow-hidden">
          <div className="relative bg-gradient-to-br from-accent/30 to-background p-12">
            {/* Decorative Border */}
            <div className="absolute inset-4 border-4 border-double border-secondary/40 rounded-lg" />

            {/* Certificate Content */}
            <div className="relative space-y-8 text-center">
              <div className="space-y-2">
                <h2 className="font-display text-4xl font-bold text-secondary">
                  Certificate of Achievement
                </h2>
                <p className="text-muted-foreground">Pencak Silat Academy</p>
              </div>

              <div className="space-y-4 py-8">
                <p className="text-lg">This is to certify that</p>
                <h3 className="font-display text-5xl font-bold">
                  {formData.name}
                </h3>
                <p className="text-lg">has successfully achieved</p>
                <div className="inline-flex items-center gap-3 px-8 py-4 bg-accent/50 border-2 border-secondary/40 rounded-lg">
                  {selectedBelt && (
                    <div
                      className="h-6 w-6 rounded-full border-2 border-border"
                      style={{ backgroundColor: selectedBelt.color }}
                    />
                  )}
                  <span className="font-display text-3xl font-bold">
                    {selectedBelt?.label}
                  </span>
                </div>
                <p className="text-muted-foreground">
                  on{" "}
                  {new Date(formData.date).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-12 pt-8 max-w-2xl mx-auto">
                <div className="space-y-2">
                  <div className="border-t-2 border-border/40 pt-2">
                    <p className="font-semibold">Guru Besar Ahmad Hidayat</p>
                    <p className="text-sm text-muted-foreground">
                      Chief Instructor
                    </p>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="border-t-2 border-border/40 pt-2">
                    <p className="font-semibold">Academy Director</p>
                    <p className="text-sm text-muted-foreground">
                      Director of Training
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="p-6 bg-accent/20 border-t border-border/40">
            <Button onClick={handleDownload} className="w-full" size="lg">
              <Download className="mr-2 h-4 w-4" />
              Download Certificate (PDF)
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
};
