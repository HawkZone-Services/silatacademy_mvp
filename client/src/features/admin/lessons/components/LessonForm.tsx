// src/features/admin/lessons/components/LessonForm.tsx
import { useState, useEffect } from "react";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

import { Program, Module, Lesson } from "../types";

import programService from "@/services/programService";
import moduleService from "@/services/moduleService";

import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";

import {
  Command,
  CommandInput,
  CommandList,
  CommandGroup,
  CommandEmpty,
  CommandItem,
} from "@/components/ui/command";

import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

type LessonFormValues = {
  title: string;
  summary?: string;
  videoUrl?: string;
  technicalContent?: string;
  medicalContent?: string;
  psychologyContent?: string;
  content?: string;
  durationMinutes?: number | undefined;
  resourcesText?: string;
  moduleId: string;
  programId: string;
  order?: number | undefined;
  isActive?: boolean;
};

type LessonFormProps = {
  initial?: Lesson | null;
  onChange: (values: LessonFormValues) => void;
};

export function LessonForm({ initial, onChange }: LessonFormProps) {
  const [programs, setPrograms] = useState<Program[]>([]);
  const [allModules, setAllModules] = useState<Module[]>([]);
  const [modules, setModules] = useState<Module[]>([]);

  const [loadingPrograms, setLoadingPrograms] = useState(false);
  const [loadingModules, setLoadingModules] = useState(false);

  const [values, setValues] = useState<LessonFormValues>(() => {
    if (!initial)
      return {
        title: "",
        summary: "",
        videoUrl: "",
        technicalContent: "",
        medicalContent: "",
        psychologyContent: "",
        content: "",
        durationMinutes: undefined,
        resourcesText: "",
        programId: "",
        moduleId: "",
        order: undefined,
        isActive: true,
      };

    return {
      title: initial.title || "",
      summary: initial.summary || "",
      videoUrl: initial.videoUrl || "",
      technicalContent: initial.technicalContent || "",
      medicalContent: initial.medicalContent || "",
      psychologyContent: initial.psychologyContent || "",
      content: initial.content || "",
      durationMinutes: initial.durationMinutes,
      resourcesText: (initial.resources || []).join("\n"),
      programId:
        typeof initial.program === "string"
          ? initial.program
          : initial.program?._id || "",
      moduleId:
        typeof initial.module === "string"
          ? initial.module
          : initial.module?._id || "",
      order: initial.order,
      isActive: initial.isActive ?? true,
    };
  });

  /* ------------------------------------
      AUTO SYNC WITH PARENT
  ------------------------------------- */
  useEffect(() => {
    onChange(values);
  }, [values]);

  /* ------------------------------------
      LOAD PROGRAMS + MODULES
  ------------------------------------- */
  useEffect(() => {
    const loadPrograms = async () => {
      try {
        setLoadingPrograms(true);
        const res = await programService.getPrograms();
        const list = res?.programs || [];
        setPrograms(list);
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

        // auto-filter modules for existing lesson
        if (values.programId) {
          const filtered = list.filter(
            (m) => m.program?._id === values.programId
          );
          setModules(filtered);
        }
      } finally {
        setLoadingModules(false);
      }
    };

    loadPrograms();
    loadModules();
  }, []);

  /* ------------------------------------
      HANDLERS
  ------------------------------------- */
  const setField = (field: keyof LessonFormValues, value: any) =>
    setValues((prev) => ({ ...prev, [field]: value }));

  const handleNumber = (field: keyof LessonFormValues, raw: string) =>
    setField(field, raw === "" ? undefined : Number(raw));

  /* ------------------------------------
      PROGRAM SELECT → filter modules
  ------------------------------------- */
  const handleSelectProgram = (programId: string) => {
    setField("programId", programId);
    setField("moduleId", "");

    const filtered = allModules.filter((m) => m.program?._id === programId);
    setModules(filtered);
  };

  const handleSelectModule = (moduleId: string) => {
    setField("moduleId", moduleId);
  };

  /* ------------------------------------
      UI LABELS
  ------------------------------------- */
  const selectedProgramLabel =
    programs.find((p) => p._id === values.programId)?.title || "Select program";

  const selectedModuleLabel =
    modules.find((m) => m._id === values.moduleId)?.title ||
    (values.programId ? "Select module" : "Select program first");

  /* ------------------------------------
      FORM UI
  ------------------------------------- */
  return (
    <div className="space-y-4">
      {/* Title */}
      <div>
        <Label>Title *</Label>
        <Input
          value={values.title}
          onChange={(e) => setField("title", e.target.value)}
        />
      </div>

      {/* Program & Module */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Program Selector */}
        <div>
          <Label>Program *</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-full justify-between">
                {selectedProgramLabel}
                <ChevronsUpDown className="h-4 w-4 opacity-50" />
              </Button>
            </PopoverTrigger>

            <PopoverContent className="w-64 p-0">
              <Command>
                <CommandInput placeholder="Search program..." />
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
                            p._id === values.programId
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

        {/* Module Selector */}
        <div>
          <Label>Module</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-between"
                disabled={!values.programId}
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
                    {!values.programId
                      ? "Select program first"
                      : modules.length === 0
                      ? "No modules available"
                      : "No results"}
                  </CommandEmpty>

                  <CommandGroup>
                    {/* No module option */}
                    <CommandItem onSelect={() => handleSelectModule("")}>
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          !values.moduleId ? "opacity-100" : "opacity-0"
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
                            m._id === values.moduleId
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

      {/* Summary */}
      <div>
        <Label>Summary</Label>
        <Textarea
          value={values.summary}
          onChange={(e) => setField("summary", e.target.value)}
          rows={2}
        />
      </div>

      {/* Video + Duration */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label>Video URL</Label>
          <Input
            value={values.videoUrl}
            onChange={(e) => setField("videoUrl", e.target.value)}
            placeholder="https://..."
          />
        </div>

        <div>
          <Label>Duration (minutes)</Label>
          <Input
            type="number"
            value={values.durationMinutes ?? ""}
            onChange={(e) => handleNumber("durationMinutes", e.target.value)}
          />
        </div>
      </div>

      {/* Order + Active */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
        <div>
          <Label>Order</Label>
          <Input
            type="number"
            value={values.order ?? ""}
            onChange={(e) => handleNumber("order", e.target.value)}
          />
        </div>

        <div className="flex items-center gap-2 mt-6">
          <Switch
            checked={values.isActive}
            onCheckedChange={(c) => setField("isActive", c)}
          />
          <Label>Active</Label>
        </div>
      </div>

      {/* Content Areas */}
      <div>
        <Label>Content</Label>
        <Textarea
          rows={4}
          value={values.content}
          onChange={(e) => setField("content", e.target.value)}
        />
      </div>

      <div>
        <Label>Technical Content</Label>
        <Textarea
          rows={3}
          value={values.technicalContent}
          onChange={(e) => setField("technicalContent", e.target.value)}
        />
      </div>

      <div>
        <Label>Medical Content</Label>
        <Textarea
          rows={3}
          value={values.medicalContent}
          onChange={(e) => setField("medicalContent", e.target.value)}
        />
      </div>

      <div>
        <Label>Psychology Content</Label>
        <Textarea
          rows={3}
          value={values.psychologyContent}
          onChange={(e) => setField("psychologyContent", e.target.value)}
        />
      </div>

      {/* Resources */}
      <div>
        <Label>Resources (one per line)</Label>
        <Textarea
          rows={3}
          value={values.resourcesText}
          onChange={(e) => setField("resourcesText", e.target.value)}
        />
      </div>
    </div>
  );
}
