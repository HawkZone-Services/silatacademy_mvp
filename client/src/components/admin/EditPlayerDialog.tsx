import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

import adminService from "@/services/adminService";
import { useToast } from "@/hooks/use-toast";

interface EditPlayerDialogProps {
  open: boolean;
  setOpen: (value: boolean) => void;
  player: any;
  onUpdated?: () => void;
}

export function EditPlayerDialog({
  open,
  setOpen,
  player,
  onUpdated,
}: EditPlayerDialogProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState<any>({
    // USER
    full_name: "",
    email: "",
    nationalId: "",
    gender: "",
    phone: "",
    isActive: true,

    // PLAYER
    belt: "",
    beltColor: "",
    age: "",
    height: "",
    weight: "",
    coach: "",
    trainingStartDate: "",
    trainingYears: "",
    currentFocus: "",
    stats: { power: 0, flexibility: 0, endurance: 0, speed: 0 },

    // HEALTH
    health: {
      status: "",
      lastCheckup: "",
      injuries: [],
      nutritionPlan: "",
      restSchedule: "",
      medicalNotes: "",
    },

    achievements: [],
    trainingLogs: [],
  });

  /** Load player data */
  useEffect(() => {
    if (!player) return;

    setForm({
      // USER
      full_name: player.user?.name || "",
      email: player.user?.email || "",
      nationalId: player.user?.nationalId || "",
      gender: player.user?.gender || "",
      phone: player.user?.phone || "",
      isActive: player.user?.isActive ?? true,

      // PLAYER
      belt: player.beltLevel || "",
      beltColor: player.beltColor || "",
      age: player.age || "",
      height: player.height || "",
      weight: player.weight || "",
      coach: player.coach || "",
      trainingStartDate: player.trainingStartDate || "",
      trainingYears: player.trainingYears || "",
      currentFocus: player.currentFocus || "",
      stats: player.stats || {
        power: 0,
        flexibility: 0,
        endurance: 0,
        speed: 0,
      },

      health: player.health || {
        status: "",
        lastCheckup: "",
        injuries: [],
        nutritionPlan: "",
        restSchedule: "",
        medicalNotes: "",
      },

      achievements: player.achievements || [],
      trainingLogs: player.trainingLogs || [],
    });
  }, [player]);

  /** Update simple field */
  const handleChange = (e: any) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleStatsChange = (key: string, val: any) =>
    setForm({ ...form, stats: { ...form.stats, [key]: Number(val) } });

  const handleHealthChange = (key: string, val: any) =>
    setForm({ ...form, health: { ...form.health, [key]: val } });

  /** Submit */
  const handleSubmit = async () => {
    if (!form.nationalId.trim()) {
      return toast({
        title: "National ID Missing",
        description: "National ID is required.",
        variant: "destructive",
      });
    }
    setLoading(true);

    try {
      // -------- BUILD PAYLOAD TO MATCH BACKEND --------
      const payload = {
        // USER
        name: form.full_name,
        email: form.email,
        nationalId: form.nationalId,
        gender: form.gender,
        phone: form.phone,
        isActive: form.isActive === "true" || form.isActive === true,

        // PROFILE
        profile: {
          firstName: form.full_name.split(" ")[0] || "",
          lastName: form.full_name.split(" ").slice(1).join(" ") || "",
          avatar: "",
          address: "",
          bio: "",
          social: {},
        },

        // PLAYER fields
        beltLevel: form.belt,
        beltColor: form.beltColor,
        age: form.age,
        height: form.height,
        weight: form.weight,
        coach: form.coach,
        trainingStartDate: form.trainingStartDate,
        trainingYears: form.trainingYears,
        stats: form.stats,
        currentFocus: form.currentFocus,
        achievements: form.achievements,
        trainingLogs: form.trainingLogs,
        health: form.health,
      };

      // -------- SEND REQUEST --------
      const res = await adminService.updatePlayer(player.user._id, payload);

      if (!res.success) {
        toast({
          title: "Update Failed",
          description: res.message || "Something went wrong.",
          variant: "destructive",
        });
        setLoading(false);

        return;
      }

      // SUCCESS
      toast({
        title: "Updated Successfully",
        description: "Player profile updated successfully.",
      });

      setOpen(false);
      setLoading(false);
      onUpdated?.();
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.response?.data?.message || "Failed to update player.",
        variant: "destructive",
      });
    }
  };

  if (!player) return null;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Edit Player</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="basic">
          <TabsList className="grid grid-cols-3 my-3">
            <TabsTrigger value="basic">Basic Info</TabsTrigger>
            <TabsTrigger value="training">Training</TabsTrigger>
            <TabsTrigger value="health">Health</TabsTrigger>
          </TabsList>

          {/* Basic Info */}
          <TabsContent value="basic" className="space-y-3 mt-3">
            <Input
              name="full_name"
              value={form.full_name}
              onChange={handleChange}
              placeholder="Full Name"
            />
            <Input
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="Email"
            />
            <Input
              name="nationalId"
              value={form.nationalId}
              onChange={handleChange}
              placeholder="National ID"
            />
            <Input
              name="gender"
              value={form.gender}
              onChange={handleChange}
              placeholder="Gender"
            />
            <Input
              name="phone"
              value={form.phone}
              onChange={handleChange}
              placeholder="Phone"
            />

            <select
              name="isActive"
              value={form.isActive}
              onChange={handleChange}
              className="border rounded-md p-2 w-full"
            >
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </select>
          </TabsContent>

          {/* Training */}
          <TabsContent value="training" className="space-y-3 mt-3">
            <Input
              name="belt"
              value={form.belt}
              onChange={handleChange}
              placeholder="Belt (e.g. yellow)"
            />
            <Input
              name="beltColor"
              value={form.beltColor}
              onChange={handleChange}
              placeholder="Belt Color (#hex)"
            />

            <Input
              name="age"
              type="number"
              value={form.age}
              onChange={handleChange}
              placeholder="Age"
            />
            <Input
              name="height"
              value={form.height}
              onChange={handleChange}
              placeholder="Height (165 cm)"
            />
            <Input
              name="weight"
              value={form.weight}
              onChange={handleChange}
              placeholder="Weight (55 kg)"
            />

            <Input
              name="coach"
              value={form.coach}
              onChange={handleChange}
              placeholder="Coach"
            />
            <Input
              type="date"
              name="trainingStartDate"
              value={form.trainingStartDate}
              onChange={handleChange}
            />
            <Input
              type="number"
              name="trainingYears"
              value={form.trainingYears}
              onChange={handleChange}
            />

            <Input
              name="currentFocus"
              value={form.currentFocus}
              onChange={handleChange}
              placeholder="Current Focus"
            />

            <div className="grid grid-cols-4 gap-3">
              {["power", "flexibility", "endurance", "speed"].map((stat) => (
                <Input
                  key={stat}
                  type="number"
                  value={form.stats[stat]}
                  placeholder={stat}
                  onChange={(e) => handleStatsChange(stat, e.target.value)}
                />
              ))}
            </div>
          </TabsContent>

          {/* Health */}
          <TabsContent value="health" className="space-y-3 mt-3">
            <Input
              value={form.health.status}
              placeholder="Health Status"
              onChange={(e) => handleHealthChange("status", e.target.value)}
            />

            <Input
              type="date"
              value={form.health.lastCheckup}
              onChange={(e) =>
                handleHealthChange("lastCheckup", e.target.value)
              }
            />

            <Textarea
              value={form.health.nutritionPlan}
              onChange={(e) =>
                handleHealthChange("nutritionPlan", e.target.value)
              }
              placeholder="Nutrition Plan"
            />

            <Textarea
              value={form.health.restSchedule}
              onChange={(e) =>
                handleHealthChange("restSchedule", e.target.value)
              }
              placeholder="Rest Schedule"
            />

            <Textarea
              value={form.health.medicalNotes}
              onChange={(e) =>
                handleHealthChange("medicalNotes", e.target.value)
              }
              placeholder="Medical Notes"
            />

            <Textarea
              value={form.health.injuries.join(", ")}
              onChange={(e) =>
                handleHealthChange(
                  "injuries",
                  e.target.value.split(",").map((i) => i.trim())
                )
              }
              placeholder="Injuries (comma separated)"
            />
          </TabsContent>
        </Tabs>

        <Button
          className="w-full mt-4"
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? "Saveing Changes..." : "Save Changes"}
        </Button>
      </DialogContent>
    </Dialog>
  );
}
