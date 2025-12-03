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

  const [form, setForm] = useState<any>({
    // USER
    full_name: "",
    email: "",
    nationalId: "",
    gender: "",
    phone: "",
    isActive: true,

    // PROFILE
    belt: "",
    beltColor: "",
    age: "",
    height: "",
    weight: "",
    coach: "",
    trainingStartDate: "",
    trainingYears: "",
    currentFocus: "",

    stats: {
      power: 0,
      flexibility: 0,
      endurance: 0,
      speed: 0,
    },

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
    if (player) {
      setForm({
        full_name: player.user.name || "",
        email: player.user.email || "",
        nationalId: player.user.nationalId || "",
        gender: player.gender || "",
        phone: player.user.phone || "",
        isActive: player.user.isActive ?? true,

        // profile
        belt: player.playerProfile?.belt || "",
        beltColor: player.playerProfile?.beltColor || "",
        age: player.playerProfile?.age || "",
        height: player.playerProfile?.height || "",
        weight: player.playerProfile?.weight || "",
        coach: player.playerProfile?.coach || "",
        trainingStartDate: player.playerProfile?.trainingStartDate || "",
        trainingYears: player.playerProfile?.trainingYears || "",
        currentFocus: player.playerProfile?.currentFocus || "",

        stats: player.playerProfile?.stats || {
          power: 0,
          flexibility: 0,
          endurance: 0,
          speed: 0,
        },

        health: {
          status: player.playerProfile?.health?.status || "",
          lastCheckup: player.playerProfile?.health?.lastCheckup || "",
          injuries: player.playerProfile?.health?.injuries || [],
          nutritionPlan: player.playerProfile?.health?.nutritionPlan || "",
          restSchedule: player.playerProfile?.health?.restSchedule || "",
          medicalNotes: player.playerProfile?.health?.medicalNotes || "",
        },

        achievements: player.playerProfile?.achievements || [],
        trainingLogs: player.playerProfile?.trainingLogs || [],
      });
    }
  }, [player]);

  /** update field */
  const handleChange = (e: any) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  /** handle health fields */
  const handleHealthChange = (field: string, value: any) => {
    setForm({
      ...form,
      health: {
        ...form.health,
        [field]: value,
      },
    });
  };

  /** handle stats */
  const handleStatsChange = (stat: string, value: any) => {
    setForm({
      ...form,
      stats: {
        ...form.stats,
        [stat]: Number(value),
      },
    });
  };

  /** Submit updated player */
  const handleSubmit = async () => {
    if (!form.nationalId.trim()) {
      return toast({
        title: "National ID Missing",
        description: "National ID is required.",
        variant: "destructive",
      });
    }

    try {
      const res = await adminService.updatePlayer(player._id, form);

      if (!res.data?.success) {
        toast({
          title: "Update Failed",
          description: res.data?.message,
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Updated",
        description: "Player profile updated successfully.",
      });

      setOpen(false);
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
              placeholder="Full Name"
              onChange={handleChange}
            />
            <Input
              name="email"
              value={form.email}
              placeholder="Email"
              onChange={handleChange}
            />
            <Input
              name="nationalId"
              value={form.nationalId}
              placeholder="National ID"
              onChange={handleChange}
            />
            <Input
              name="gender"
              value={form.gender}
              placeholder="Gender"
              onChange={handleChange}
            />
            <Input
              name="phone"
              value={form.phone}
              placeholder="Phone"
              onChange={handleChange}
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

          {/* Training Info */}
          <TabsContent value="training" className="space-y-3 mt-3">
            <Input
              name="belt"
              value={form.belt}
              placeholder="Belt (e.g. Yellow Belt)"
              onChange={handleChange}
            />
            <Input
              name="beltColor"
              value={form.beltColor}
              placeholder="Belt Color (Hex)"
              onChange={handleChange}
            />
            <Input
              name="age"
              value={form.age}
              type="number"
              placeholder="Age"
              onChange={handleChange}
            />
            <Input
              name="height"
              value={form.height}
              placeholder="Height (165 cm)"
              onChange={handleChange}
            />
            <Input
              name="weight"
              value={form.weight}
              placeholder="Weight (55 kg)"
              onChange={handleChange}
            />
            <Input
              name="coach"
              value={form.coach}
              placeholder="Coach Name"
              onChange={handleChange}
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
              placeholder="Current Focus"
              onChange={handleChange}
            />

            {/* Stats */}
            <div className="grid grid-cols-4 gap-3">
              {["power", "flexibility", "endurance", "speed"].map((stat) => (
                <Input
                  key={stat}
                  type="number"
                  placeholder={stat}
                  value={form.stats[stat]}
                  onChange={(e) => handleStatsChange(stat, e.target.value)}
                />
              ))}
            </div>
          </TabsContent>

          {/* Health */}
          <TabsContent value="health" className="space-y-3 mt-3">
            <Input
              placeholder="Health Status"
              value={form.health.status}
              onChange={(e) => handleHealthChange("status", e.target.value)}
            />

            <Input
              type="date"
              placeholder="Last Checkup Date"
              value={form.health.lastCheckup}
              onChange={(e) =>
                handleHealthChange("lastCheckup", e.target.value)
              }
            />

            <Textarea
              placeholder="Nutrition Plan"
              value={form.health.nutritionPlan}
              onChange={(e) =>
                handleHealthChange("nutritionPlan", e.target.value)
              }
            />

            <Textarea
              placeholder="Rest Schedule"
              value={form.health.restSchedule}
              onChange={(e) =>
                handleHealthChange("restSchedule", e.target.value)
              }
            />

            <Textarea
              placeholder="Medical Notes"
              value={form.health.medicalNotes}
              onChange={(e) =>
                handleHealthChange("medicalNotes", e.target.value)
              }
            />

            <Textarea
              placeholder="Injuries (comma separated)"
              value={form.health.injuries?.join(", ") ?? ""}
              onChange={(e) =>
                handleHealthChange(
                  "injuries",
                  e.target.value.split(",").map((i) => i.trim())
                )
              }
            />
          </TabsContent>
        </Tabs>

        <Button className="w-full mt-4" onClick={handleSubmit}>
          Save Changes
        </Button>
      </DialogContent>
    </Dialog>
  );
}
