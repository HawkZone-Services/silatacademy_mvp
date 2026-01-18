import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { AddModuleDialog } from "../AddModuleDialog";
import { EditModuleDialog } from "../EditModuleDialog";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { Button } from "@/components/ui/button";
import moduleService from "@/services/moduleService";

export default function ModulesScreen() {
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);

  const [editModuleOpen, setEditModuleOpen] = useState(false);
  const [editModule, setEditModule] = useState(null);

  // ===============================
  // FETCH MODULES
  // ===============================
  const fetchModules = async () => {
    setLoading(true);

    try {
      const res = await moduleService.getModules();

      const list = res?.data?.modules || res?.modules || res?.modules || [];

      console.log("Fetched Modules:", list);
      setModules(Array.isArray(list) ? list : []);
    } catch (err) {
      console.error("Failed to load modules:", err);
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchModules();
  }, []);
  // ===============================
  // EDIT MODULE
  // ===============================
  const handleEditModule = (mod) => {
    setEditModule(mod);
    setEditModuleOpen(true);
  };

  // ===============================
  // DELETE MODULE
  // ===============================
  const handleDeleteModule = async (id) => {
    if (!confirm("Delete this module?")) return;

    try {
      await moduleService.deleteModule(id);
      fetchModules();
    } catch (err) {
      console.error("Delete module error:", err);
      alert("Failed to delete module");
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Modules</CardTitle>
            <CardDescription>Learning modules inside programs</CardDescription>
          </div>

          <AddModuleDialog onModuleAdded={fetchModules} />
        </div>
      </CardHeader>

      <CardContent>
        {loading ? (
          <p className="text-muted-foreground">Loading modules...</p>
        ) : modules.length === 0 ? (
          <p className="text-muted-foreground">No modules found.</p>
        ) : (
          <div className="overflow-x-auto border border-border/40 rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Module</TableHead>
                  <TableHead>Program</TableHead>
                  <TableHead>Topics</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {modules.map((m) => (
                  <TableRow key={m._id}>
                    <TableCell className="font-medium">{m.title}</TableCell>

                    <TableCell>
                      {m.program?.title || m.programTitle || "—"}
                    </TableCell>

                    <TableCell>
                      {m.topics?.length ? (
                        <ul className="list-disc ml-4 space-y-1">
                          {m.topics.map((t, i) => (
                            <li key={i}>{t}</li>
                          ))}
                        </ul>
                      ) : (
                        <span className="text-muted-foreground">No topics</span>
                      )}
                    </TableCell>

                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEditModule(m)}
                        >
                          Edit
                        </Button>

                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDeleteModule(m._id)}
                        >
                          Delete
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        {/* EDIT DIALOG */}
        {editModule && (
          <EditModuleDialog
            open={editModuleOpen}
            setOpen={setEditModuleOpen}
            moduleData={editModule}
            onUpdated={fetchModules}
          />
        )}
      </CardContent>
    </Card>
  );
}
