import { useState, useRef } from "react";
import { Plus, Trash, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GeneratedAvatar } from "../generated-avatar";

interface Props {
  initialPicture?: string;
  onUpdate: (newPicture: string | File | null) => void; // sends File if user uploads
  initialSeed?: string;
  isLoading?: boolean;
}

export default function EditableProfilePicture({
  initialPicture,
  onUpdate,
  initialSeed = "BS",
  isLoading = false,
}: Props) {
  const [isEditing, setIsEditing] = useState(false);
  const [picture, setPicture] = useState<string | null>(initialPicture || null);
  const [tempPicture, setTempPicture] = useState<string | null>(
    initialPicture || null
  );
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleCancel = () => {
    setTempPicture(picture);
    setSelectedFile(null);
    setIsEditing(false);
  };

  const handleUpdate = () => {
    setPicture(tempPicture);
    onUpdate(selectedFile ?? tempPicture);
    setIsEditing(false);
  };

  const handleRemove = () => {
    setTempPicture(null);
    setSelectedFile(null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setTempPicture(URL.createObjectURL(file));
    }
  };

  return (
    <div className="p-6 border-b border-border">
      <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
        <div className="flex flex-col gap-4">
          <h3 className="font-semibold text-slate-800 dark:text-slate-200">
            Profile Picture
          </h3>
          <div className="flex items-center gap-4">
            {tempPicture || picture ? (
              <img
                src={isEditing ? tempPicture || "" : picture || ""}
                alt="Profile"
                className="w-24 h-24 rounded-full border-4 border-white shadow-sm object-cover"
              />
            ) : (
              <GeneratedAvatar seed={initialSeed} className="w-24 h-24" />
            )}

            {!isEditing ? (
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
                onClick={() => setIsEditing(true)}
              >
                <Edit className="w-4 h-4" />
                Edit
              </Button>
            ) : (
              <div className="space-y-2">
                <div className="flex flex-wrap justify-between gap-2">
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-2"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Plus className="w-4 h-4" />
                      Change Picture
                    </Button>
                    <input
                      type="file"
                      accept="image/png,image/jpeg"
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      className="hidden"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-2 text-red-600 hover:text-red-700"
                      onClick={handleRemove}
                    >
                      <Trash className="w-4 h-4" />
                      Remove
                    </Button>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={handleUpdate}
                      disabled={isLoading}
                      variant="brand"
                    >
                      Update
                    </Button>
                    <Button size="sm" variant="outline" onClick={handleCancel}>
                      Cancel
                    </Button>
                  </div>
                </div>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  JPG, PNG max 2MB
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
