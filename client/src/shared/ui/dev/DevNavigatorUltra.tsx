import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

// Icons
import {
  Globe,
  User,
  Shield,
  GraduationCap,
  Book,
  ClipboardList,
  Terminal,
  File,
  CornerDownLeft,
} from "lucide-react";

import { extractRoutePaths } from "@/shared/utils/extractRoutes";
import { appRoutes } from "@/app/router"; // ← routes moved to their own file

// ---------- AUTO GROUPING LOGIC ----------
function detectGroup(path: string) {
  if (path.startsWith("/admin")) return "Admin";
  if (path.startsWith("/coach") || path.startsWith("/instructor"))
    return "Instructor";
  if (path.startsWith("/student")) return "Student";
  if (path.includes("lesson")) return "Lessons";
  if (path.includes("exam")) return "Exams";
  if (path.includes("api")) return "API";
  return "Public";
}

function getIcon(group: string) {
  switch (group) {
    case "Admin":
      return <Shield size={16} />;
    case "Instructor":
      return <User size={16} />;
    case "Student":
      return <GraduationCap size={16} />;
    case "Lessons":
      return <Book size={16} />;
    case "Exams":
      return <ClipboardList size={16} />;
    case "API":
      return <Terminal size={16} />;
    default:
      return <Globe size={16} />;
  }
}

// ---------- ULTRA PRO COMPONENT ----------
export function DevNavigatorUltra() {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [position, setPosition] = useState({ x: 0, y: 20 });
  const dragging = useRef(false);
  const navigate = useNavigate();
  const location = useLocation();

  if (!import.meta.env.DEV) return null;

  const ROUTES = useMemo(() => {
    const raw = extractRoutePaths(appRoutes);
    return raw.map((p) => ({
      path: p,
      group: detectGroup(p),
    }));
  }, []);

  // ------- Fuzzy search -------
  const filtered = ROUTES.filter((r) =>
    r.path.toLowerCase().includes(search.toLowerCase()),
  );

  // ------- Keyboard shortcut (Ctrl + L) -------
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key.toLowerCase() === "l") {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  // ------- Drag toolbar -------
  const startDrag = () => (dragging.current = true);
  const stopDrag = () => (dragging.current = false);

  const dragMove = (e: MouseEvent) => {
    if (!dragging.current) return;
    setPosition((p) => ({ x: p.x + e.movementX, y: p.y + e.movementY }));
  };

  useEffect(() => {
    window.addEventListener("mousemove", dragMove);
    window.addEventListener("mouseup", stopDrag);
    return () => {
      window.removeEventListener("mousemove", dragMove);
      window.removeEventListener("mouseup", stopDrag);
    };
  }, []);

  return (
    <>
      {/* ULTRA-PRO FLOATING TOOLBAR */}
      <motion.div
        onMouseDown={startDrag}
        animate={{ x: position.x, y: position.y }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        style={{
          position: "fixed",
          left: "50%",
          transform: "translateX(-50%)",
          padding: "7px 16px",
          borderRadius: 999,
          background: "rgba(255,255,255,0.12)",
          backdropFilter: "blur(12px)",
          color: "#fff",
          zIndex: 9999,
          cursor: "grab",
          display: "flex",
          alignItems: "center",
          gap: 10,
          boxShadow: "0 4px 12px rgba(0,0,0,0.4)",
        }}
      >
        <button
          onClick={() => setOpen((o) => !o)}
          style={{
            background: "transparent",
            border: "none",
            color: "white",
            fontSize: 18,
            cursor: "pointer",
          }}
        >
          ☰
        </button>

        <button
          onClick={() => window.location.reload()}
          style={{
            background: "transparent",
            border: "none",
            color: "white",
            fontSize: 16,
            cursor: "pointer",
          }}
        >
          ↻
        </button>
      </motion.div>

      {/* POPUP PANEL */}
      {open && (
        <>
          <div
            onClick={() => setOpen(false)}
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0,0,0,0.45)",
              backdropFilter: "blur(3px)",
              zIndex: 9998,
            }}
          />

          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            style={{
              position: "fixed",
              top: "90px",
              left: "50%",
              transform: "translateX(-50%)",
              width: 480,
              maxHeight: 500,
              overflow: "hidden",
              background: "#181818",
              borderRadius: 14,
              color: "white",
              padding: 16,
              zIndex: 9999,
              boxShadow: "0 8px 20px rgba(0,0,0,0.5)",
            }}
          >
            <div style={{ marginBottom: 12 }}>
              <input
                autoFocus
                placeholder="Search route..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{
                  width: "100%",
                  padding: "10px",
                  borderRadius: 8,
                  border: "none",
                  background: "#2b2b2b",
                  color: "white",
                  outline: "none",
                }}
              />
            </div>

            {/* GROUPED ROUTES */}
            <div style={{ overflowY: "auto", maxHeight: 420, paddingRight: 4 }}>
              {[
                "Admin",
                "Instructor",
                "Student",
                "Lessons",
                "Exams",
                "API",
                "Public",
              ].map((group) => {
                const groupRoutes = filtered.filter((r) => r.group === group);
                if (groupRoutes.length === 0) return null;

                return (
                  <div key={group} style={{ marginBottom: 16 }}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        opacity: 0.8,
                        marginBottom: 6,
                        fontSize: 14,
                        color: "#aaa",
                      }}
                    >
                      {getIcon(group)}
                      {group}
                    </div>

                    {groupRoutes.map((r) => (
                      <div
                        key={r.path}
                        onClick={() => {
                          navigate(r.path);
                          setOpen(false);
                        }}
                        style={{
                          padding: "10px",
                          borderRadius: 6,
                          marginBottom: 6,
                          cursor: "pointer",
                          background:
                            location.pathname === r.path ? "#444" : "#262626",
                          transition: "0.15s",
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        <span>{r.path}</span>
                        <CornerDownLeft size={16} opacity={0.5} />
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          </motion.div>
        </>
      )}
    </>
  );
}
