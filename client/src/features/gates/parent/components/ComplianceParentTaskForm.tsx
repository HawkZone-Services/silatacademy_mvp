import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Textarea } from "@/shared/ui/textarea";
import { Switch } from "@/shared/ui/switch";
import { Label } from "@/shared/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";

/**
 * Parent Compliance Task Form
 * Purpose:
 * - Create a parent compliance that can SUSPEND lesson access
 * - Lessons remain locked until compliance is marked as ENDED
 * Backend wiring will be added later
 */

export default function ComplianceParentTaskForm() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [targetType, setTargetType] = useState<"lesson" | "module">("lesson");
  const [targetId, setTargetId] = useState("");
  const [suspendAccess, setSuspendAccess] = useState(true);
  const [requiredApproval, setRequiredApproval] = useState(true);

  // Parent compliance tasks
  const [tasks, setTasks] = useState<{ id: string; title: string }[]>([]);
  const [taskInput, setTaskInput] = useState("");

  const addTask = () => {
    if (!taskInput.trim()) return;
    setTasks((prev) => [
      ...prev,
      { id: crypto.randomUUID(), title: taskInput },
    ]);
    setTaskInput("");
  };

  const removeTask = (id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  };

  const handleSubmit = () => {
    const payload = {
      title,
      description,
      targetType,
      targetId,
      effects: {
        suspendLessonAccess: suspendAccess,
      },
      lifecycle: {
        status: "ACTIVE", // ACTIVE | ENDED
        requiresApproval: requiredApproval,
      },
    };

    console.log("Compliance payload (mock):", {
      ...payload,
      tasks,
    });
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Create Parent Compliance</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Title */}
        <div className="space-y-2">
          <Label>Compliance Title</Label>
          <Input
            placeholder="e.g. Medical Clearance Pending"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        {/* Description */}
        <div className="space-y-2">
          <Label>Description</Label>
          <Textarea
            placeholder="Explain why this compliance is required"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        {/* Target */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Target Type</Label>
            <Select
              value={targetType}
              onValueChange={(v) => setTargetType(v as any)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="lesson">Lesson</SelectItem>
                <SelectItem value="module">Module</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Target ID</Label>
            <Input
              placeholder="lessonId or moduleId"
              value={targetId}
              onChange={(e) => setTargetId(e.target.value)}
            />
          </div>
        </div>

        {/* Effects */}
        <div className="border rounded-lg p-4 space-y-4">
          <div className="flex items-center justify-between">
            <Label>Suspend Lesson Access</Label>
            <Switch
              checked={suspendAccess}
              onCheckedChange={setSuspendAccess}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label>Requires Manual Approval to End</Label>
            <Switch
              checked={requiredApproval}
              onCheckedChange={setRequiredApproval}
            />
          </div>
        </div>

        {/* Parent Compliance Tasks */}
        <div className="space-y-3">
          <Label>Compliance Tasks</Label>

          <div className="flex gap-2">
            <Input
              placeholder="Add task (e.g. Upload medical report)"
              value={taskInput}
              onChange={(e) => setTaskInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addTask()}
            />
            <Button type="button" onClick={addTask}>
              Add
            </Button>
          </div>

          <ul className="space-y-2">
            {tasks.map((task, index) => (
              <li
                key={task.id}
                className="flex items-center justify-between rounded-md border px-3 py-2"
              >
                <span className="text-sm">
                  {index + 1}. {task.title}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeTask(task.id)}
                >
                  Remove
                </Button>
              </li>
            ))}
          </ul>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-2">
          <Button variant="outline">Cancel</Button>
          <Button onClick={handleSubmit}>Create Compliance</Button>
        </div>
      </CardContent>
    </Card>
  );
}
