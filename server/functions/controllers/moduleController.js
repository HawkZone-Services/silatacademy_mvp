import asyncHandler from "express-async-handler";
import Module from "../models/Module.js";
import Program from "../models/Program.js";

/**
 * @desc Get all modules
 * @route GET /api/modules
 */
export const listModules = asyncHandler(async (req, res) => {
  const filter = {};

  // 🔐 Admin sees ALL modules (no filters)
  if (req.user?.role === "admin") {
    // no filter
  }
  // 🎓 Student sees only active modules
  else if (req.user?.role === "student") {
    filter.isActive = true;
    filter.status = "active";
  }
  // 👀 Guest / public (لو موجود)
  else {
    filter.isActive = true;
    filter.status = "active";
  }

  const modules = await Module.find(filter)
    .populate("program", "title level")
    .sort({ beltLevel: 1, order: 1 });

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
    "title level",
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
  const {
    program,
    title,
    moduleType,
    beltLevel,
    objectives = [],
    anatomyFocus = [],
    reptitionGoal,
    commonMistakes = [],
  } = req.body;

  const programExists = await Program.findById(program);
  if (!programExists) {
    return res.status(404).json({
      success: false,
      message: "Program not found",
    });
  }
  // 🔹 احسب الترتيب تلقائيًا
  const lastModule = await Module.findOne({
    program,
    beltLevel,
  }).sort({ order: -1 });

  const nextOrder = lastModule ? lastModule.order + 1 : 1;
  const moduleDoc = await Module.create({
    program,
    title,
    moduleType,
    beltLevel,
    objectives,
    anatomyFocus,
    reptitionGoal,
    commonMistakes,
    order: nextOrder,
    status: "draft",
    isActive: false,
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
  const moduleId = req.params.id;

  const moduleDoc = await Module.findById(moduleId);
  if (!moduleDoc) {
    return res
      .status(404)
      .json({ success: false, message: "Module not found" });
  }

  if (moduleDoc.status === "archived") {
    return res.status(403).json({ success: false, message: "MODULE_ARCHIVED" });
  }

  const forbiddenOnActive = ["moduleType", "beltLevel", "program"];
  if (moduleDoc.status === "active") {
    for (const f of forbiddenOnActive) {
      if (req.body[f] != null) {
        return res.status(403).json({
          success: false,
          message: "FIELD_LOCKED_ON_ACTIVE_MODULE",
          field: f,
        });
      }
    }
  }

  Object.assign(moduleDoc, req.body);
  await moduleDoc.save();

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
  const moduleDoc = await Module.findById(req.params.id);

  if (!moduleDoc) {
    return res
      .status(404)
      .json({ success: false, message: "Module not found" });
  }

  moduleDoc.status = "archived";
  moduleDoc.isActive = false;
  moduleDoc.archivedAt = new Date();
  await moduleDoc.save();

  return res.json({
    success: true,
    message: "Module archived (soft delete)",
    module: moduleDoc,
  });
});

/**
 * @desc Activate a module
 * @route POST /api/modules/:id/activate
 */

export const activateModule = asyncHandler(async (req, res) => {
  const moduleId = req.params.id;

  const moduleDoc = await Module.findById(moduleId).populate("lessons");

  if (!moduleDoc) {
    return res
      .status(404)
      .json({ success: false, message: "Module not found" });
  }

  if (moduleDoc.status === "archived") {
    return res.status(403).json({ success: false, message: "MODULE_ARCHIVED" });
  }

  const hasLessons = (moduleDoc.lessons || []).length > 0;
  if (!hasLessons) {
    return res
      .status(403)
      .json({ success: false, message: "MODULE_NOT_READY_NO_LESSONS" });
  }

  moduleDoc.status = "active";
  moduleDoc.isActive = true;
  moduleDoc.activatedAt = new Date();
  await moduleDoc.save();

  return res.status(200).json({
    success: true,
    message: "Module activated",
    module: moduleDoc,
  });
});

/**
 * @desc Archive a module
 * @route POST /api/modules/:id/archive
 */

export const archiveModule = asyncHandler(async (req, res) => {
  const moduleId = req.params.id;

  const moduleDoc = await Module.findById(moduleId);

  if (!moduleDoc) {
    return res
      .status(404)
      .json({ success: false, message: "Module not found" });
  }

  // archive is final
  moduleDoc.status = "archived";
  moduleDoc.isActive = false;
  moduleDoc.archivedAt = new Date();
  await moduleDoc.save();

  return res.status(200).json({
    success: true,
    message: "Module archived",
    module: moduleDoc,
  });
});
