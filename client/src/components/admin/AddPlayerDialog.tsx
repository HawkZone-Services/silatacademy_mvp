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

import { useToast } from "@/hooks/use-toast";
import { UserPlus } from "lucide-react";

interface AddPlayerDialogProps {
  onPlayerAdded?: () => void;
}

const API_BASE = "https://api-f3rwhuz64a-uc.a.run.app/api/admin";

export const AddPlayerDialog = ({ onPlayerAdded }: AddPlayerDialogProps) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    national_id: "",
    full_name: "",
    email: "",
    phone: "",
    date_of_birth: "",
    gender: "",
    address: "",
    city: "",
    current_belt: "white",
    emergency_contact_name: "",
    emergency_contact_phone: "",
    medical_notes: "",
    password: "", // ← ← NEW FIELD
  });

  const resetForm = () =>
    setFormData({
      national_id: "",
      full_name: "",
      email: "",
      phone: "",
      date_of_birth: "",
      gender: "",
      address: "",
      city: "",
      current_belt: "white",
      emergency_contact_name: "",
      emergency_contact_phone: "",
      medical_notes: "",
      password: "", // reset password
    });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token =
        localStorage.getItem("token") || sessionStorage.getItem("token");

      if (!token) {
        throw new Error("Missing auth token. Please log in again.");
      }

      const response = await fetch(`${API_BASE}/players`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: formData.full_name,
          email: formData.email,
          password: formData.password, // ← ← USE CUSTOM PASSWORD
          nationalId: formData.national_id,
          phone: formData.phone,
          avatar: "",

          playerData: {
            belt: formData.current_belt,
            beltColor: "#ffffff",
            age: formData.date_of_birth
              ? new Date().getFullYear() -
                new Date(formData.date_of_birth).getFullYear()
              : null,
            stats: { power: 0, flexibility: 0, endurance: 0, speed: 0 },
            achievements: [],
            health: {
              medicalNotes: formData.medical_notes,
              injuries: [],
            },
            trainingLogs: [],
          },
        }),
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.message || "Failed to add player");

      toast({
        title: "Success",
        description: "Player added successfully",
      });

      resetForm();
      setOpen(false);
      onPlayerAdded?.();
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to add player",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <UserPlus className="w-4 h-4" />
          Add New Player
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Player</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* National ID + Full Name */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>National ID *</Label>
              <Input
                required
                value={formData.national_id}
                onChange={(e) =>
                  setFormData({ ...formData, national_id: e.target.value })
                }
              />
            </div>

            <div>
              <Label>Full Name *</Label>
              <Input
                required
                value={formData.full_name}
                onChange={(e) =>
                  setFormData({ ...formData, full_name: e.target.value })
                }
              />
            </div>
          </div>

          {/* Email + Phone */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Email *</Label>
              <Input
                required
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
              />
            </div>

            <div>
              <Label>Phone *</Label>
              <Input
                required
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
              />
            </div>
          </div>

          {/* 🔐 PASSWORD FIELD */}
          <div>
            <Label>Password *</Label>
            <Input
              required
              type="password"
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
              placeholder="Enter a password for the student"
            />
          </div>

          {/* Rest of inputs... (unchanged) */}
          {/* DOB, gender, belt, address, city, emergency contact, notes */}

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
};
