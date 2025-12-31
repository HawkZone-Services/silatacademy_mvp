import { useEffect, useState } from "react";
import AvatarUploader from "../features/users/components/AvatarUploader";
import apiClient from "@/shared/api/apiClient";
export default function MyProfilePage() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiClient.get("users/profile/me").then((res) => {
      setProfile(res.data);
      setLoading(false);
    });
  }, []);

  if (loading) return <div>Loading...</div>;
  if (!profile) return <div>No profile found</div>;

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">My Profile</h1>

      {/* Avatar */}
      <AvatarUploader
        avatar={profile.avatar}
        onUploaded={(url) => setProfile((p) => ({ ...p, avatar: url }))}
      />

      {/* Basic Info */}
      <div className="mt-6 space-y-2">
        <div>
          <strong>Name:</strong> {profile.firstName} {profile.lastName}
        </div>
        <div>
          <strong>Bio:</strong> {profile.bio || "—"}
        </div>
      </div>
    </div>
  );
}
