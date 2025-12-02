import { RouteObject } from "react-router-dom";

export function extractRoutePaths(
  routes: RouteObject[],
  parent = ""
): string[] {
  const out: string[] = [];

  for (const r of routes) {
    const full = (parent + "/" + (r.path || "")).replace(/\/+/g, "/");
    if (r.path && r.path !== "*") out.push(full);
    if (r.children) out.push(...extractRoutePaths(r.children, full));
  }

  return out;
}
