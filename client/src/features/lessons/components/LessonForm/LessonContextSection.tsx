import { Select } from "@/components/ui/select";
import React from "react";

const LessonContextSection = () => {
  return (
    <div>
      <Select
        disabled={mode === "edit"}
        value={state.module}
        onChange={handleModuleChange}
      />
    </div>
  );
};

export default LessonContextSection;
