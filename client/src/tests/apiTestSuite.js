// src/tests/apiTestSuite.js
import apiClient from "@/lib/apiClient";

export const apiTestGroups = {
  auth: [
    {
      name: "Auth → Login",
      method: "post",
      url: "/auth/login",
      data: { email: "test@test.com", password: "123456" },
    },
    {
      name: "Auth → Refresh Session",
      method: "get",
      url: "/auth/me",
    },
  ],
  player: [
    { name: "Player → Profile", method: "get", url: "/player/me" },
    {
      name: "Player → My Certificates",
      method: "get",
      url: "/certificates/my",
    },
    { name: "Player → My Attendance", method: "get", url: "/attendance/my" },
  ],
  exams: [
    { name: "Exams → Available", method: "get", url: "/exams/available" },
    { name: "Exams → Results", method: "get", url: "/exams/results" },
  ],
  lessons: [
    { name: "Lessons → By Belt", method: "get", url: "/lessons/by-belt" },
    { name: "Lessons → Progress", method: "get", url: "/lessons/progress" },
  ],
  coach: [
    { name: "Coach → Players", method: "get", url: "/coach/players" },
    { name: "Coach → Approvals", method: "get", url: "/coach/approvals" },
  ],
  admin: [
    { name: "Admin → Exams", method: "get", url: "/admin/exams/all" },
    { name: "Admin → Programs", method: "get", url: "/programs" },
  ],
};

export async function runApiTestGroup(groupName) {
  const tests = apiTestGroups[groupName];
  const results = [];

  for (const test of tests) {
    const { name, method, url, data } = test;

    const start = performance.now();
    console.log(`\n⚡ Running: ${name}`);

    try {
      const res = await apiClient[method](url, data);
      const duration = (performance.now() - start).toFixed(1);

      results.push({
        name,
        status: "PASSED",
        duration: `${duration}ms`,
        code: res.status,
        data: res.data,
      });

      console.log(
        `%c✅ PASSED (%c${duration} ms%c) — ${name}`,
        "color: green; font-weight: bold;",
        "color: blue;",
        "color: default;"
      );
    } catch (err) {
      const duration = (performance.now() - start).toFixed(1);

      results.push({
        name,
        status: "FAILED",
        duration: `${duration}ms`,
        error: err.message,
        response: err.response?.data,
      });

      console.log(
        `%c❌ FAILED (%c${duration} ms%c) — ${name}`,
        "color: red; font-weight: bold;",
        "color: orange;",
        "color: default;"
      );
      console.log(err.response?.data || err.message);
    }
  }

  return results;
}

export async function runAllApiTests() {
  const all = {};
  for (const group in apiTestGroups) {
    console.log(
      `\n\n========== 📌 Testing Group: ${group.toUpperCase()} ==========`
    );
    all[group] = await runApiTestGroup(group);
  }
  return all;
}
