import { useRef, useState } from "react";
import { uploadAvatar } from "./api/uploadAvatar";

type Props = {
  avatar?: string;
  onUploaded?: (url: string) => void;
};

export default function AvatarUploader({ avatar, onUploaded }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);

  const handleSelect = () => {
    inputRef.current?.click();
  };

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    try {
      const res = await uploadAvatar(file);
      onUploaded?.(res.avatar);
    } catch (err) {
      console.error("Avatar upload failed", err);
      alert("Failed to upload avatar");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-2">
      <img
        src={avatar || "/avatar-placeholder.png"}
        className="w-32 h-32 rounded-full object-cover border"
      />

      <button onClick={handleSelect} disabled={loading} className="btn btn-sm">
        {loading ? "Uploading..." : "Change Avatar"}
      </button>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        hidden
        onChange={handleChange}
      />
    </div>
  );
}
