import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

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
import { EditModuleDialog } from "@/components/admin/EditModuleDialog";
import { AddModuleDialog } from "@/components/admin/AddModuleDialog";

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
  console.log("Modules state:", modules);
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
                  <TableHead>Status</TableHead>
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
                      <span
                        className={`px-2 py-1 rounded text-xs font-semibold
      ${m.status === "draft" ? "bg-gray-200 text-gray-800" : ""}
      ${m.status === "ready" ? "bg-yellow-200 text-yellow-800" : ""}
      ${m.status === "active" ? "bg-green-200 text-green-800" : ""}
      ${m.status === "archived" ? "bg-red-200 text-red-800" : ""}
    `}
                      >
                        {m.status?.toUpperCase() || "UNKNOWN"}
                      </span>
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
                        {/* EDIT */}
                        {m.status !== "archived" && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEditModule(m)}
                          >
                            Edit
                          </Button>
                        )}

                        {/* ACTIVATE */}
                        {m.status === "ready" && (
                          <Button
                            size="sm"
                            onClick={async () => {
                              if (
                                !confirm(
                                  "Activate this module? It will be visible to students.",
                                )
                              )
                                return;
                              await moduleService.activateModule(m._id);
                              fetchModules();
                            }}
                          >
                            Activate
                          </Button>
                        )}

                        {/* ARCHIVE */}
                        {m.status !== "archived" && (
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={async () => {
                              if (!confirm("Archive this module?")) return;
                              await moduleService.archiveModule(m._id);
                              fetchModules();
                            }}
                          >
                            Archive
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

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
