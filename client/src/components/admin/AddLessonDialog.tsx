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
import programService from "@/services/programService";
import moduleService from "@/services/moduleService";

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

type Program = { _id: string; title: string };
type Module = { _id: string; title: string; program?: any };

export const AddLessonDialog = ({ onLessonAdded }) => {
  const { toast } = useToast();

  const [open, setOpen] = useState(false);

  const [programs, setPrograms] = useState<Program[]>([]);
  const [allModules, setAllModules] = useState<Module[]>([]);
  const [modules, setModules] = useState<Module[]>([]);

  const [loadingPrograms, setLoadingPrograms] = useState(false);
  const [loadingModules, setLoadingModules] = useState(false);
  const [loadingSubmit, setLoadingSubmit] = useState(false);

  const [selectedProgramId, setSelectedProgramId] = useState("");
  const [selectedModuleId, setSelectedModuleId] = useState("");

  const [form, setForm] = useState({
    title: "",
    summary: "",
    videoUrl: "",
    content: "",
    technicalContent: "",
    medicalContent: "",
    psychologyContent: "",
    order: "",
    durationMinutes: "",
    resources: "",
  });

  /* ------------------------------------
      Load Programs + All Modules on Open
  ------------------------------------- */
  useEffect(() => {
    if (!open) return;

    const loadPrograms = async () => {
      try {
        setLoadingPrograms(true);
        const res = await programService.getPrograms();
        const list = res?.programs || [];
        console.log("Fetched Programs:", list);
        setPrograms(list);
      } catch {
        toast({
          title: "Error",
          description: "Failed to load programs",
          variant: "destructive",
        });
      } finally {
        setLoadingPrograms(false);
      }
    };

    const loadModules = async () => {
      try {
        setLoadingModules(true);
        const res = await moduleService.getModules();
        const list = res?.modules || [];
        setAllModules(list);
      } catch {
        toast({
          title: "Error",
          description: "Failed to load modules",
          variant: "destructive",
        });
      } finally {
        setLoadingModules(false);
      }
    };

    loadPrograms();
    loadModules();
  }, [open]);

  /* ------------------------------------
      Select Program → Filter Modules
  ------------------------------------- */
  const handleSelectProgram = (programId: string) => {
    setSelectedProgramId(programId);
    setSelectedModuleId("");

    const filtered = allModules.filter((m) => m.program?._id === programId);

    setModules(filtered);
  };

  const handleSelectModule = (moduleId: string) => {
    setSelectedModuleId(moduleId);
  };

  /* ------------------------------------
      Submit New Lesson
  ------------------------------------- */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoadingSubmit(true);

    try {
      const payload = {
        title: form.title,
        summary: form.summary,
        videoUrl: form.videoUrl,
        content: form.content,
        technicalContent: form.technicalContent,
        medicalContent: form.medicalContent,
        psychologyContent: form.psychologyContent,

        order: form.order ? Number(form.order) : 0,
        durationMinutes: form.durationMinutes
          ? Number(form.durationMinutes)
          : undefined,

        resources: form.resources
          ? form.resources.split("\n").filter(Boolean)
          : [],

        programId: selectedProgramId || null,
        moduleId: selectedModuleId || null,

        quiz: [],
      };

      const res = await lessonService.createLesson(payload);

      if (!res?.data?.success) {
        throw new Error(res?.data?.message || "Lesson creation failed");
      }

      toast({
        title: "Success",
        description: "Lesson added successfully",
      });

      // reset
      setOpen(false);
      setForm({
        title: "",
        summary: "",
        videoUrl: "",
        content: "",
        technicalContent: "",
        medicalContent: "",
        psychologyContent: "",
        order: "",
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

  /* ------------------------------------
      UI Labels
  ------------------------------------- */
  const selectedProgramLabel =
    programs.find((p) => p._id === selectedProgramId)?.title ||
    "Select program";

  const selectedModuleLabel =
    modules.find((m) => m._id === selectedModuleId)?.title ||
    (selectedProgramId ? "Select module" : "Select program first");

  /* ------------------------------------
      RENDER UI
  ------------------------------------- */
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Calendar className="w-4 h-4" />
          Add Lesson
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Lesson</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title */}
          <div>
            <Label>Title *</Label>
            <Input
              required
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />
          </div>

          {/* Summary */}
          <div>
            <Label>Summary</Label>
            <Textarea
              value={form.summary}
              onChange={(e) => setForm({ ...form, summary: e.target.value })}
            />
          </div>

          {/* Content */}
          <div>
            <Label>Content</Label>
            <Textarea
              value={form.content}
              onChange={(e) => setForm({ ...form, content: e.target.value })}
            />
          </div>

          {/* Program + Module */}
          <div className="grid grid-cols-2 gap-4">
            {/* Program */}
            <div>
              <Label>Program</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-between">
                    {selectedProgramLabel}
                    <ChevronsUpDown className="h-4 w-4 opacity-50" />
                  </Button>
                </PopoverTrigger>

                <PopoverContent className="w-64 p-0">
                  <Command>
                    <CommandInput placeholder="Search programs..." />
                    <CommandList>
                      <CommandEmpty>No programs found</CommandEmpty>

                      <CommandGroup>
                        {programs.map((p) => (
                          <CommandItem
                            key={p._id}
                            onSelect={() => handleSelectProgram(p._id)}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                p._id === selectedProgramId
                                  ? "opacity-100"
                                  : "opacity-0"
                              )}
                            />
                            {p.title}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>

            {/* Module */}
            <div>
              <Label>Module</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    disabled={!selectedProgramId}
                    className="w-full justify-between"
                  >
                    {selectedModuleLabel}
                    <ChevronsUpDown className="h-4 w-4 opacity-50" />
                  </Button>
                </PopoverTrigger>

                <PopoverContent className="w-64 p-0">
                  <Command>
                    <CommandInput placeholder="Search modules..." />

                    <CommandList>
                      <CommandEmpty>
                        {!selectedProgramId
                          ? "Select program first"
                          : modules.length === 0
                          ? "No modules in this program"
                          : "No results"}
                      </CommandEmpty>

                      <CommandGroup>
                        {/* No module */}
                        <CommandItem onSelect={() => handleSelectModule("")}>
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              !selectedModuleId ? "opacity-100" : "opacity-0"
                            )}
                          />
                          No Module (General)
                        </CommandItem>

                        {modules.map((m) => (
                          <CommandItem
                            key={m._id}
                            onSelect={() => handleSelectModule(m._id)}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                m._id === selectedModuleId
                                  ? "opacity-100"
                                  : "opacity-0"
                              )}
                            />
                            {m.title}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* Save */}
          <div className="flex justify-end">
            <Button type="submit" disabled={loadingSubmit}>
              {loadingSubmit ? "Adding..." : "Add Lesson"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
