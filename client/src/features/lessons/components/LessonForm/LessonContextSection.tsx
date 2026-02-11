import { Select } from "@/shared/ui/select";
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
