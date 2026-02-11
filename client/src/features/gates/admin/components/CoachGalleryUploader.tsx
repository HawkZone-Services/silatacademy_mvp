import { useRef } from "react";
import { Button } from "@/shared/ui/button";
import { X, ImagePlus } from "lucide-react";

interface Props {
  images: File[];
  onChange: (files: File[]) => void;
}

export const CoachGalleryUploader = ({ images, onChange }: Props) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    onChange([...images, ...Array.from(e.target.files)]);
  };

  const removeImage = (index: number) => {
    onChange(images.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">Gallery Images</h3>
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={() => inputRef.current?.click()}
        >
          <ImagePlus className="h-4 w-4 mr-2" />
          Add Images
        </Button>
      </div>

      <input
        ref={inputRef}
        type="file"
        multiple
        accept="image/*"
        hidden
        onChange={handleSelect}
      />

      {images.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {images.map((file, i) => (
            <div
              key={i}
              className="relative rounded-lg overflow-hidden border border-border"
            >
              <img
                src={URL.createObjectURL(file)}
                alt="preview"
                className="w-full h-32 object-cover"
              />
              <button
                type="button"
                onClick={() => removeImage(i)}
                className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-1"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {images.length === 0 && (
        <p className="text-sm text-muted-foreground">
          No gallery images uploaded yet.
        </p>
      )}
    </div>
  );
};
