import { useEffect, useState } from "react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/ui/card";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/ui/table";

import { Button } from "@/shared/ui/button";

import programService from "@/features/programs/api/programService";
import {
  AddProgramDialog,
  EditProgramDialog,
} from "@/features/programs/components/admin";

const ProgramsScreen = () => {
  const [programs, setPrograms] = useState([]);
  const [editProgram, setEditProgram] = useState(null);
  const [editProgramOpen, setEditProgramOpen] = useState(false);

  /* ============================
        FETCH PROGRAMS
  ============================ */
  const fetchPrograms = async () => {
    try {
      const res = await programService.getPrograms();

      const list = res?.data?.programs || res?.data || res?.programs || [];

      setPrograms(Array.isArray(list) ? list : []);
    } catch (err) {
      console.error("Fetch Programs Error:", err);
    }
  };

  useEffect(() => {
    fetchPrograms();
  }, []);

  /* ============================
         EDIT PROGRAM
  ============================ */
  const handleEditProgram = (program) => {
    setEditProgram(program);
    setEditProgramOpen(true);
  };

  /* ============================
         DELETE PROGRAM
  ============================ */
  const handleDeleteProgram = async (id) => {
    if (!window.confirm("Are you sure you want to delete this program?"))
      return;

    try {
      await programService.deleteProgram(id);
      fetchPrograms();
    } catch (err) {
      console.error("Delete Program Error:", err);
    }
  };

  /* ============================
            RENDER
  ============================ */

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Programs</CardTitle>
            <CardDescription>Training program structure</CardDescription>
          </div>

          {/* Add Dialog */}
          <AddProgramDialog onProgramAdded={fetchPrograms} />
        </div>
      </CardHeader>

      <CardContent>
        <div className="overflow-x-auto border border-border/40 rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Audience</TableHead>
                <TableHead>Schedule</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {programs.map((program) => (
                <TableRow key={program._id}>
                  <TableCell className="font-medium">{program.title}</TableCell>

                  <TableCell>{program.description}</TableCell>
                  <TableCell>{program.duration}</TableCell>
                  <TableCell>{program.targetAudience}</TableCell>
                  <TableCell>{program.classSchedule}</TableCell>

                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEditProgram(program)}
                      >
                        Edit
                      </Button>

                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDeleteProgram(program._id)}
                      >
                        Delete
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}

              {programs.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-4">
                    No programs found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Edit Dialog */}
        {editProgram && (
          <EditProgramDialog
            open={editProgramOpen}
            setOpen={setEditProgramOpen}
            program={editProgram}
            onUpdated={fetchPrograms}
          />
        )}
      </CardContent>
    </Card>
  );
};

export default ProgramsScreen;
