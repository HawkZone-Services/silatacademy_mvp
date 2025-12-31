import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { CoachGalleryUploader } from "./CoachGalleryUploader";
import coachService from "@/services/coachService";
import mediaService from "@/features/admin/dashboard/api/mediaService";
import { toast } from "sonner";

export const AddCoachForm = () => {
  const [loading, setLoading] = useState(false);
  const [gallery, setGallery] = useState<File[]>([]);

  const [form, setForm] = useState({
    name: "",
    title: "",
    experience: "",
    bio: "",
    email: "",
    phone: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);

      // 1️⃣ Create Coach
      const coach = await coachService.createCoach(form);

      // 2️⃣ Upload Gallery Images
      if (gallery.length > 0) {
        for (const file of gallery) {
          const fd = new FormData();
          fd.append("image", file);
          fd.append("category", "gallery");

          await mediaService.uploadCoachGallery(coach._id, fd);
        }
      }

      toast.success("Coach created successfully");
      setForm({
        name: "",
        title: "",
        experience: "",
        bio: "",
        email: "",
        phone: "",
      });
      setGallery([]);
    } catch (err) {
      toast.error("Failed to create coach");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="max-w-3xl mx-auto">
      <CardContent className="p-6 space-y-6">
        <h2 className="font-display text-2xl font-bold">Add New Coach</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input name="name" placeholder="Coach Name" onChange={handleChange} />
          <Input name="title" placeholder="Title" onChange={handleChange} />
          <Input
            name="experience"
            placeholder="Years of Experience"
            onChange={handleChange}
          />
          <Input name="email" placeholder="Email" onChange={handleChange} />
          <Input name="phone" placeholder="Phone" onChange={handleChange} />
        </div>

        <Textarea
          name="bio"
          placeholder="Coach biography"
          onChange={handleChange}
        />

        {/* Gallery */}
        <CoachGalleryUploader images={gallery} onChange={setGallery} />

        <div className="flex justify-end">
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? "Saving..." : "Create Coach"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
