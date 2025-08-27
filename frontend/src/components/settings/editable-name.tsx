import { useState } from "react";
import { Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface Props {
  initialName: string;
  onUpdate: (newName: string) => void;
  isLoading?: boolean;
}

export default function EditableName({
  initialName,
  onUpdate,
  isLoading = false,
}: Props) {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(initialName);
  const [tempName, setTempName] = useState(initialName);

  const handleCancel = () => {
    setTempName(name); // reset input value back to saved one
    setIsEditing(false);
  };

  const handleUpdate = () => {
    setName(tempName);
    onUpdate(tempName); // pass value up
    setIsEditing(false);
  };

  return (
    <div className="p-6 border-b border-border">
      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
        Full Name
      </label>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex-1">
          <Input
            type="text"
            value={isEditing ? tempName : name || "Not provided"}
            readOnly={!isEditing}
            onChange={(e) => setTempName(e.target.value)}
            className={`max-w-md ${
              isEditing
                ? "bg-white dark:bg-slate-800"
                : "bg-slate-50 dark:bg-slate-700"
            }`}
          />
        </div>

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
          <div className="flex gap-2">
            <Button
              disabled={isLoading}
              size="sm"
              onClick={handleUpdate}
              variant="brand"
            >
              Update
            </Button>
            <Button size="sm" variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
