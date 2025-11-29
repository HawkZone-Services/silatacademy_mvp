import { useEffect, useState } from "react";
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
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Calendar, Check, ChevronsUpDown } from "lucide-react";
import lessonService from "@/services/lessonService";

// 👇 لو عندك programService جاهز استعمله، لو لا استخدم fetch عادي
import programService from "@/services/programService";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { cn } from "@/lib/utils";

interface AddLessonDialogProps {
  onLessonAdded?: () => void;
}

type ModuleOption = {
  _id: string;
  title: string;
};

type ProgramOption = {
  _id: string;
  title: string;
  modules?: ModuleOption[];
};

export const AddLessonDialog = ({ onLessonAdded }: AddLessonDialogProps) => {
  const [open, setOpen] = useState(false);
  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const [loadingPrograms, setLoadingPrograms] = useState(false);
  const [loadingModules, setLoadingModules] = useState(false);

  const { toast } = useToast();

  const [programs, setPrograms] = useState<ProgramOption[]>([]);
  const [modules, setModules] = useState<ModuleOption[]>([]);

  const [selectedProgramId, setSelectedProgramId] = useState<string>("");
  const [selectedModuleId, setSelectedModuleId] = useState<string>("");

  const [formData, setFormData] = useState({
    title: "",
    summary: "",
    videoUrl: "",
    content: "",
    programId: "",
    moduleId: "",
    durationMinutes: "",
    resources: "",
  });

  // 🟢 حمل البرامج أول ما المودال يتفتح
  useEffect(() => {
    if (!open) return;

    const fetchPrograms = async () => {
      try {
        setLoadingPrograms(true);

        // ✅ لو عندك programService:
        const res = await programService.getPrograms();
        const data = await res.json();

        // ❗ مثال باستخدام fetch مباشر - عدّل الـ URL حسب الـ API عندك
        // const res = await fetch("/api/programs");
        // const data = await res.json();

        if (!res.ok || !data?.success) {
          throw new Error(data?.message || "Failed to load programs");
        }

        const list: ProgramOption[] = data.programs || data.data || [];
        setPrograms(list);
      } catch (error: any) {
        console.error(error);
        toast({
          title: "Error",
          description: error.message || "Failed to load programs",
          variant: "destructive",
        });
      } finally {
        setLoadingPrograms(false);
      }
    };

    fetchPrograms();
  }, [open, toast]);

  // 🟢 لما يختار Program → حدّث modules
  const handleSelectProgram = async (programId: string) => {
    setSelectedProgramId(programId);
    setSelectedModuleId("");
    setModules([]);
    setFormData((prev) => ({
      ...prev,
      programId,
      moduleId: "",
    }));

    if (!programId) return;

    // لو البرامج اللي جاية من الـ API فيها modules جاهزة
    const program = programs.find((p) => p._id === programId);
    if (program && program.modules && program.modules.length > 0) {
      setModules(program.modules);
      return;
    }

    // غير كده → نجيب الموديولات من API منفصل
    try {
      setLoadingModules(true);

      // مثال: GET /api/programs/:id/modules
      const res = await fetch(`/api/programs/${programId}/modules`);
      const data = await res.json();

      if (!res.ok || !data?.success) {
        throw new Error(data?.message || "Failed to load modules");
      }

      const list: ModuleOption[] = data.modules || data.data || [];
      setModules(list);
    } catch (error: any) {
      console.error(error);
      toast({
        title: "Error",
        description: error.message || "Failed to load modules",
        variant: "destructive",
      });
    } finally {
      setLoadingModules(false);
    }
  };

  const handleSelectModule = (moduleId: string) => {
    setSelectedModuleId(moduleId);
    setFormData((prev) => ({
      ...prev,
      moduleId,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoadingSubmit(true);

    try {
      const payload = {
        title: formData.title,
        summary: formData.summary,
        videoUrl: formData.videoUrl,
        content: formData.content,
        programId: formData.programId || undefined,
        moduleId: formData.moduleId || undefined,
        durationMinutes: formData.durationMinutes
          ? Number(formData.durationMinutes)
          : undefined,
        resources: formData.resources
          ? formData.resources.split("\n").filter(Boolean)
          : [],
        quiz: [],
      };

      const res = await lessonService.createLesson(payload);
      const data = await res.json();

      if (!res.ok || !data?.success) {
        throw new Error(data?.message || "Failed to add lesson");
      }

      toast({
        title: "Success",
        description: "Lesson added successfully",
      });

      setOpen(false);
      setFormData({
        title: "",
        summary: "",
        videoUrl: "",
        content: "",
        programId: "",
        moduleId: "",
        durationMinutes: "",
        resources: "",
      });
      setSelectedProgramId("");
      setSelectedModuleId("");
      setModules([]);
      onLessonAdded?.();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to add lesson",
        variant: "destructive",
      });
    } finally {
      setLoadingSubmit(false);
    }
  };

  const selectedProgramLabel =
    programs.find((p) => p._id === selectedProgramId)?.title ||
    "Select program";

  const selectedModuleLabel =
    modules.find((m) => m._id === selectedModuleId)?.title ||
    (selectedProgramId ? "Select module" : "Select program first");

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Calendar className="w-4 h-4" />
          Add New Lesson
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Lesson</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title">Lesson Title *</Label>
            <Input
              id="title"
              required
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
            />
          </div>

          {/* 🔹 Program & Module Comboboxes */}
          <div className="grid grid-cols-2 gap-4">
            {/* Program Combobox */}
            <div className="space-y-1">
              <Label>Program</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    role="combobox"
                    aria-expanded={false}
                    className="w-full justify-between"
                    disabled={loadingPrograms}
                  >
                    <span className="truncate">
                      {loadingPrograms
                        ? "Loading programs..."
                        : selectedProgramLabel}
                    </span>
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[260px] p-0">
                  <Command>
                    <CommandInput placeholder="Search program..." />
                    <CommandList>
                      <CommandEmpty>
                        {loadingPrograms ? "Loading..." : "No program found"}
                      </CommandEmpty>
                      <CommandGroup>
                        {programs.map((program) => (
                          <CommandItem
                            key={program._id}
                            value={program.title}
                            onSelect={() => handleSelectProgram(program._id)}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                program._id === selectedProgramId
                                  ? "opacity-100"
                                  : "opacity-0"
                              )}
                            />
                            <span className="truncate">{program.title}</span>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>

            {/* Module Combobox */}
            <div className="space-y-1">
              <Label>Module (optional)</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    role="combobox"
                    aria-expanded={false}
                    className="w-full justify-between"
                    disabled={!selectedProgramId || loadingModules}
                  >
                    <span className="truncate">
                      {loadingModules
                        ? "Loading modules..."
                        : selectedModuleLabel}
                    </span>
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[260px] p-0">
                  <Command>
                    <CommandInput placeholder="Search module..." />
                    <CommandList>
                      <CommandEmpty>
                        {selectedProgramId
                          ? loadingModules
                            ? "Loading..."
                            : "No module found"
                          : "Select program first"}
                      </CommandEmpty>
                      <CommandGroup>
                        {/* خيار بدون Module */}
                        <CommandItem
                          value="none"
                          onSelect={() => handleSelectModule("")}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              !selectedModuleId ? "opacity-100" : "opacity-0"
                            )}
                          />
                          <span className="truncate">No module / General</span>
                        </CommandItem>

                        {modules.map((module) => (
                          <CommandItem
                            key={module._id}
                            value={module.title}
                            onSelect={() => handleSelectModule(module._id)}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                module._id === selectedModuleId
                                  ? "opacity-100"
                                  : "opacity-0"
                              )}
                            />
                            <span className="truncate">{module.title}</span>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="videoUrl">Video URL</Label>
              <Input
                id="videoUrl"
                value={formData.videoUrl}
                onChange={(e) =>
                  setFormData({ ...formData, videoUrl: e.target.value })
                }
              />
            </div>
            <div>
              <Label htmlFor="durationMinutes">Duration (minutes)</Label>
              <Input
                id="durationMinutes"
                type="number"
                value={formData.durationMinutes}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    durationMinutes: e.target.value,
                  })
                }
              />
            </div>
          </div>

          <div>
            <Label htmlFor="summary">Summary</Label>
            <Textarea
              id="summary"
              value={formData.summary}
              onChange={(e) =>
                setFormData({ ...formData, summary: e.target.value })
              }
            />
          </div>

          <div>
            <Label htmlFor="content">Content</Label>
            <Textarea
              id="content"
              value={formData.content}
              onChange={(e) =>
                setFormData({ ...formData, content: e.target.value })
              }
            />
          </div>

          <div>
            <Label htmlFor="resources">Resources (one per line)</Label>
            <Textarea
              id="resources"
              value={formData.resources}
              onChange={(e) =>
                setFormData({ ...formData, resources: e.target.value })
              }
            />
          </div>

          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loadingSubmit}>
              {loadingSubmit ? "Adding..." : "Add Lesson"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
