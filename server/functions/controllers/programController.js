import asyncHandler from "express-async-handler";
import Program from "../models/Program.js";

// @desc Get all programs
// @route GET /api/programs
// @access Public / Admin
export const listPrograms = asyncHandler(async (req, res) => {
  const programs = await Program.find().sort({ level: 1 });

  return res.status(200).json({
    success: true,
    count: programs.length,
    programs,
  });
});

// @desc Get program by ID
// @route GET /api/programs/:id
export const getProgram = asyncHandler(async (req, res) => {
  const program = await Program.findById(req.params.id);

  if (!program) {
    return res.status(404).json({
      success: false,
      message: "Program not found",
    });
  }

  return res.json({
    success: true,
    program,
  });
});

// @desc Create new program
// @route POST /api/programs
export const createProgram = asyncHandler(async (req, res) => {
  const program = await Program.create(req.body);

  return res.status(201).json({
    success: true,
    message: "Program created successfully",
    program,
  });
});

// @desc Update program
// @route PATCH /api/programs/:id
export const updateProgram = asyncHandler(async (req, res) => {
  const program = await Program.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
  });

  if (!program) {
    return res.status(404).json({
      success: false,
      message: "Program not found",
    });
  }

  return res.json({
    success: true,
    message: "Program updated successfully",
    program,
  });
});

// @desc Delete program
// @route DELETE /api/programs/:id
export const deleteProgram = asyncHandler(async (req, res) => {
  const program = await Program.findByIdAndDelete(req.params.id);

  if (!program) {
    return res.status(404).json({
      success: false,
      message: "Program not found",
    });
  }

  return res.json({
    success: true,
    message: "Program deleted successfully",
  });
});

// @desc List modules by program
// @route GET /api/programs/:programId/modules
export const listModulesByProgram = asyncHandler(async (req, res) => {
  const programId = req.params.programId;

  const program = await Program.findById(programId);
  if (!program) {
    return res.status(404).json({
      success: false,
      message: "Program not found",
    });
  }

  return res.status(200).json({
    success: true,
    programId,
    modules: program.modules || [], // Return empty array if no modules
  });
});
