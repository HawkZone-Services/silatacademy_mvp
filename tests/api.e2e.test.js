const request = require("supertest");
const { runSeed, readData } = require("./helpers/seedData");

const ok = (res) => {
  if (![200, 201].includes(res.status)) {
    throw new Error(
      `${res.req.method} ${res.req.path} -> ${res.status} ${JSON.stringify(res.body)}`
    );
  }
};
const auth = (token) => ({ Authorization: `Bearer ${token}` });

describe("API E2E suite", () => {
  let seed;
  let API;

  beforeAll(async () => {
    seed = readData() || null;
    seed = await runSeed();
    API = seed.meta.apiBase;
  });

  describe("Auth", () => {
    test("admin login", async () => {
      const res = await request(API).post("/auth/login").send({
        username: seed.users.admin.email,
        password: seed.meta.password,
      });
      ok(res);
    });
  });

  describe("Admin routes", () => {
    test("dashboard", async () => {
      const res = await request(API)
        .get("/admin/dashboard")
        .set(auth(seed.users.admin.token));
      ok(res);
    });

    test("players list", async () => {
      const res = await request(API)
        .get("/admin/players")
        .set(auth(seed.users.admin.token));
      ok(res);
    });

    test("player details", async () => {
      const res = await request(API)
        .get(`/admin/players/${seed.users.player.profileId}`)
        .set(auth(seed.users.admin.token));
      ok(res);
    });

    test("reports export", async () => {
      const res = await request(API)
        .get("/admin/reports/export")
        .set(auth(seed.users.admin.token));
      expect([200, 201]).toContain(res.status);
    });

    test("analytics students", async () => {
      const res = await request(API)
        .get("/admin/analytics/students")
        .set(auth(seed.users.admin.token));
      ok(res);
    });
  });

  describe("Player", () => {
    test("list players", async () => {
      const res = await request(API)
        .get("/player")
        .set(auth(seed.users.player.token));
      ok(res);
    });

    test("get player by id", async () => {
      const res = await request(API)
        .get(`/player/${seed.users.player.profileId}`)
        .set(auth(seed.users.admin.token));
      ok(res);
    });

    test("player attendance", async () => {
      const res = await request(API)
        .get(`/player/${seed.users.player.profileId}/attendance`)
        .set(auth(seed.users.player.token));
      ok(res);
    });
  });

  describe("Coach", () => {
    test("list coaches", async () => {
      const res = await request(API)
        .get("/coach")
        .set(auth(seed.users.admin.token));
      ok(res);
    });

    test("get coach", async () => {
      const res = await request(API)
        .get(`/coach/${seed.users.coach.coachId}`)
        .set(auth(seed.users.admin.token));
      ok(res);
    });

    test("assign training task", async () => {
      const res = await request(API)
        .post("/coach/tasks")
        .set(auth(seed.users.coach.token))
        .send({
          playerId: seed.users.player.profileId,
          title: "Seed Task",
          description: "Practice basics",
        });
      ok(res);
    });

    test("player tasks", async () => {
      const res = await request(API)
        .get(`/coach/players/${seed.users.player.profileId}/tasks`)
        .set(auth(seed.users.coach.token));
      ok(res);
    });
  });

  describe("Exams", () => {
    test("list exams", async () => {
      const res = await request(API)
        .get("/exams")
        .set(auth(seed.users.player.token));
      ok(res);
    });

    test("available exams by belt", async () => {
      const res = await request(API)
        .get("/exams/available/white")
        .set(auth(seed.users.player.token));
      ok(res);
    });

    test("exam details", async () => {
      const res = await request(API)
        .get(`/exams/${seed.exam.id}`)
        .set(auth(seed.users.player.token));
      ok(res);
    });

    test("my attempts", async () => {
      const res = await request(API)
        .get("/exams/my-attempts")
        .set(auth(seed.users.player.token));
      ok(res);
    });

    test("registration status", async () => {
      const res = await request(API)
        .get(`/exams/registration/status/${seed.exam.id}`)
        .set(auth(seed.users.player.token));
      ok(res);
    });

    test("admin registrations", async () => {
      const res = await request(API)
        .get(`/exams/admin/registrations/${seed.exam.id}`)
        .set(auth(seed.users.admin.token));
      ok(res);
    });

    test("admin submissions", async () => {
      const res = await request(API)
        .get(`/exams/admin/submissions/${seed.exam.id}`)
        .set(auth(seed.users.admin.token));
      ok(res);
    });
  });

  describe("Lessons & Programs", () => {
    test("list lessons", async () => {
      const res = await request(API).get("/lessons");
      ok(res);
    });

    test("lesson detail", async () => {
      const res = await request(API)
        .get(`/lessons/${seed.lesson.id}`)
        .set(auth(seed.users.player.token));
      ok(res);
    });

    test("save lesson progress", async () => {
      const res = await request(API)
        .post(`/lessons/${seed.lesson.id}/progress`)
        .set(auth(seed.users.player.token))
        .send({
          positionSeconds: 15,
          quizAnswers: [{ questionIndex: 0, selectedIndex: 0 }],
        });
      ok(res);
    });

    test("list programs", async () => {
      const res = await request(API).get("/programs");
      ok(res);
    });

    test("program detail", async () => {
      const res = await request(API).get(`/programs/${seed.program.id}`);
      ok(res);
    });
  });

  describe("Attendance", () => {
    test("player attendance feed", async () => {
      const res = await request(API)
        .get(`/attendance/player/${seed.users.player.profileId}`)
        .set(auth(seed.users.player.token));
      ok(res);
    });

    test("attendance stats", async () => {
      const res = await request(API)
        .get("/attendance/stats")
        .set(auth(seed.users.admin.token));
      ok(res);
    });
  });

  describe("Notifications", () => {
    test("list notifications", async () => {
      const res = await request(API)
        .get("/notifications")
        .set(auth(seed.users.player.token));
      ok(res);
    });

    test("mark notification read", async () => {
      const res = await request(API)
        .post(`/notifications/${seed.notification.id}/read`)
        .set(auth(seed.users.player.token));
      ok(res);
    });
  });

  describe("Certificates & Curriculum", () => {
    test("my certificates", async () => {
      const res = await request(API)
        .get("/certificates/my")
        .set(auth(seed.users.player.token));
      ok(res);
    });

    test("check certificate", async () => {
      const res = await request(API)
        .get(`/certificates/check/${seed.exam.id}/${seed.users.player.userId}`)
        .set(auth(seed.users.admin.token));
      ok(res);
    });

    test("download certificate pdf (admin)", async () => {
      const res = await request(API)
        .get(`/certificates/admin/pdf/${seed.exam.id}/${seed.users.player.userId}`)
        .set(auth(seed.users.admin.token));
      ok(res);
    });

    test("curriculum pdf", async () => {
      const res = await request(API)
        .get("/curriculum/white/pdf")
        .set(auth(seed.users.admin.token));
      ok(res);
    });
  });

  describe("Ranking", () => {
    test("list ranking belts", async () => {
      const res = await request(API).get("/ranking");
      ok(res);
    });

    test("eligible players by belt", async () => {
      const res = await request(API)
        .get("/ranking/white/eligible")
        .set(auth(seed.users.admin.token));
      ok(res);
    });
  });

  describe("Events & Library", () => {
    test("list events", async () => {
      const res = await request(API).get("/events");
      ok(res);
    });

    test("event detail", async () => {
      const res = await request(API).get(`/events/${seed.event.id}`);
      ok(res);
    });

    test("register for event", async () => {
      const res = await request(API)
        .post("/events/register")
        .set(auth(seed.users.player.token))
        .send({ eventId: seed.event.id, userId: seed.users.player.userId });
      ok(res);
    });

    test("list library", async () => {
      const res = await request(API).get("/library");
      ok(res);
    });

    test("library item detail", async () => {
      const res = await request(API).get(`/library/${seed.library.id}`);
      ok(res);
    });
  });
});
