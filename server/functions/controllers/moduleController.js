import asyncHandler from "express-async-handler";
import Module from "../models/Module.js";
import Program from "../models/Program.js";

/**
 * @desc Get all modules
 * @route GET /api/modules
 */
export const listModules = asyncHandler(async (req, res) => {
  const modules = await Module.find().populate("program", "title level");

  return res.status(200).json({
    success: true,
    count: modules.length,
    modules,
  });
});

/**
 * @desc Get all modules under a program
 * @route GET /api/programs/:programId/modules
 */
export const listModulesByProgram = asyncHandler(async (req, res) => {
  const programId = req.params.programId;

  const program = await Program.findById(programId);
  if (!program) {
    return res.status(404).json({
      success: false,
      message: "Program not found",
    });
  }

  const modules = await Module.find({ program: programId });

  return res.status(200).json({
    success: true,
    program: {
      _id: program._id,
      title: program.title,
      level: program.level,
    },
    count: modules.length,
    modules,
  });
});

/**
 * @desc Get a single module
 * @route GET /api/modules/:id
 */
export const getModule = asyncHandler(async (req, res) => {
  const moduleDoc = await Module.findById(req.params.id).populate(
    "program",
    "title level"
  );

  if (!moduleDoc) {
    return res.status(404).json({
      success: false,
      message: "Module not found",
    });
  }

  return res.status(200).json({
    success: true,
    module: moduleDoc,
  });
});

/**
 * @desc Create a module inside a program
 * @route POST /api/modules
 */
export const createModule = asyncHandler(async (req, res) => {
  const { program, title, topics } = req.body;

  const programExists = await Program.findById(program);
  if (!programExists) {
    return res.status(404).json({
      success: false,
      message: "Program not found",
    });
  }

  const moduleDoc = await Module.create({
    program,
    title,
    topics: topics || [],
  });

  return res.status(201).json({
    success: true,
    message: "Module created successfully",
    module: moduleDoc,
  });
});

/**
 * @desc Update a module
 * @route PATCH /api/modules/:id
 */
export const updateModule = asyncHandler(async (req, res) => {
  const moduleDoc = await Module.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
  });

  if (!moduleDoc) {
    return res.status(404).json({
      success: false,
      message: "Module not found",
    });
  }

  return res.json({
    success: true,
    message: "Module updated successfully",
    module: moduleDoc,
  });
});

/**
 * @desc Delete a module
 * @route DELETE /api/modules/:id
 */
export const deleteModule = asyncHandler(async (req, res) => {
  const moduleDoc = await Module.findByIdAndDelete(req.params.id);

  if (!moduleDoc) {
    return res.status(404).json({
      success: false,
      message: "Module not found",
    });
  }

  return res.json({
    success: true,
    message: "Module deleted successfully",
  });
});
