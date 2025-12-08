import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import adminService from "@/services/adminService";
import { useToast } from "@/hooks/use-toast";
import { UserPlus } from "lucide-react";

export function AddPlayerDialog({ onPlayerAdded }) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const initial = {
    // USER
    name: "",
    email: "",
    phone: "",
    nationalId: "",
    gender: "male",
    dob: "",
    password: "",

    // PLAYER
    beltLevel: "white",
    height: "",
    weight: "",
    trainingStartDate: "",
    coach: "",
    stats: { power: 0, flexibility: 0, endurance: 0, speed: 0 },
    medicalNotes: "",
    emergencyName: "",
    emergencyPhone: "",
  };

  const [form, setForm] = useState(initial);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.name || !form.nationalId || !form.password) {
      toast({
        title: "Missing data",
        description: "Name, National ID, and Password are required.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      // Age calculation
      const age = form.dob
        ? new Date().getFullYear() - new Date(form.dob).getFullYear()
        : null;

      const payload = {
        name: form.name,
        email: form.email,
        phone: form.phone,
        nationalId: form.nationalId,
        dob: form.dob,
        gender: form.gender,
        password: form.password,

        playerData: {
          beltLevel: form.beltLevel,
          age,
          height: form.height,
          weight: form.weight,
          coach: form.coach,

          trainingStartDate: form.trainingStartDate,
          trainingYears: form.trainingStartDate
            ? new Date().getFullYear() -
              new Date(form.trainingStartDate).getFullYear()
            : 0,

          stats: form.stats,

          health: {
            medicalNotes: form.medicalNotes,
            injuries: [],
          },

          achievements: [],
          trainingLogs: [],
        },
      };

      const res = await adminService.createPlayer(payload);

      if (res.status !== 201) {
        throw new Error(res.data?.message || "Failed to create player");
      }

      toast({ title: "Success", description: "Player added successfully" });

      setForm(initial);
      setOpen(false);
      onPlayerAdded?.();
    } catch (err) {
      toast({
        title: "Error",
        description:
          err?.response?.data?.message || err.message || "Failed to add player",
        variant: "destructive",
      });
    }

    setLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <UserPlus className="w-4 h-4 mr-2" />
          Add Player
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Player</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* ========================== */}
          {/* BASIC IDENTITY */}
          {/* ========================== */}
          <section>
            <h3 className="font-semibold mb-2">Basic Identity</h3>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Full Name *</Label>
                <Input
                  required
                  value={form.name}
                  onChange={(e) => set("name", e.target.value)}
                />
              </div>

              <div>
                <Label>National ID *</Label>
                <Input
                  required
                  value={form.nationalId}
                  onChange={(e) => set("nationalId", e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-3">
              <div>
                <Label>Date of Birth</Label>
                <Input
                  type="date"
                  value={form.dob}
                  onChange={(e) => set("dob", e.target.value)}
                />
              </div>

              <div>
                <Label>Gender</Label>
                <div className="flex border rounded overflow-hidden">
                  <button
                    type="button"
                    className={`px-4 py-1 ${
                      form.gender === "male"
                        ? "bg-primary text-white"
                        : "bg-muted"
                    }`}
                    onClick={() => set("gender", "male")}
                  >
                    Male
                  </button>
                  <button
                    type="button"
                    className={`px-4 py-1 ${
                      form.gender === "female"
                        ? "bg-primary text-white"
                        : "bg-muted"
                    }`}
                    onClick={() => set("gender", "female")}
                  >
                    Female
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* ========================== */}
          {/* CONTACT INFORMATION */}
          {/* ========================== */}
          <section>
            <h3 className="font-semibold mb-2">Contact Information</h3>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Email</Label>
                <Input
                  type="email"
                  value={form.email}
                  onChange={(e) => set("email", e.target.value)}
                />
              </div>

              <div>
                <Label>Phone</Label>
                <Input
                  value={form.phone}
                  onChange={(e) => set("phone", e.target.value)}
                />
              </div>
            </div>
          </section>

          {/* ========================== */}
          {/* LOGIN + BELT */}
          {/* ========================== */}
          <section>
            <h3 className="font-semibold mb-2">Login & Training</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Password *</Label>
                <Input
                  required
                  type="password"
                  value={form.password}
                  onChange={(e) => set("password", e.target.value)}
                />
              </div>

              <div>
                <Label>Belt Level</Label>
                <select
                  className="border p-2 rounded w-full bg-background "
                  value={form.beltLevel}
                  onChange={(e) => set("beltLevel", e.target.value)}
                >
                  <option value="white">White</option>
                  <option value="yellow">Yellow</option>
                  <option value="blue">Blue</option>
                  <option value="brown">Brown</option>
                  <option value="red">Red</option>
                  <option value="black">Black</option>
                </select>
              </div>
            </div>
          </section>

          {/* ========================== */}
          {/* HEALTH + EMERGENCY CONTACT */}
          {/* ========================== */}
          <section>
            <h3 className="font-semibold mb-2">Health & Emergency Info</h3>

            <Label>Medical Notes</Label>
            <Input
              value={form.medicalNotes}
              onChange={(e) => set("medicalNotes", e.target.value)}
            />

            <div className="grid grid-cols-2 gap-4 mt-3">
              <div>
                <Label>Emergency Contact Name</Label>
                <Input
                  value={form.emergencyName}
                  onChange={(e) => set("emergencyName", e.target.value)}
                />
              </div>

              <div>
                <Label>Emergency Contact Phone</Label>
                <Input
                  value={form.emergencyPhone}
                  onChange={(e) => set("emergencyPhone", e.target.value)}
                />
              </div>
            </div>
          </section>

          {/* ========================== */}
          {/* ACTION BUTTONS */}
          {/* ========================== */}
          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>

            <Button type="submit" disabled={loading}>
              {loading ? "Adding..." : "Add Player"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
