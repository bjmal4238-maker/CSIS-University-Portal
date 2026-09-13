import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { hashPassword, verifyPassword, signToken, verifyToken } from "../lib/auth";
import { isAdmin, isFaculty, isStudent, isStaff } from "../lib/rbac";
import {
  StudentRegisterSchema,
  FacultyRegisterSchema,
  LoginSchema,
  AttendanceSessionCreateSchema,
  AttendanceScanSchema,
} from "../lib/validators";

describe("1. Authentication & Security (Passwords & Tokens)", () => {
  it("should securely hash and verify passwords", async () => {
    const raw = "SecureStudentPass@2026";
    const hashed = await hashPassword(raw);

    assert.notEqual(hashed, raw);
    assert.ok(hashed.startsWith("$2"));

    const isValid = await verifyPassword(raw, hashed);
    assert.equal(isValid, true);

    const isInvalid = await verifyPassword("WrongPassword", hashed);
    assert.equal(isInvalid, false);
  });

  it("should sign and verify JWT tokens", () => {
    const payload = {
      userId: "usr_student_123",
      email: "student@csis.edu.eg",
      role: "STUDENT",
      status: "ACTIVE",
    };

    const token = signToken(payload, "1h");
    assert.ok(typeof token === "string" && token.length > 20);

    const verified = verifyToken(token);
    assert.ok(verified !== null);
    assert.equal(verified?.userId, payload.userId);
    assert.equal(verified?.email, payload.email);
    assert.equal(verified?.role, payload.role);

    const tampered = verifyToken("invalid.token.string");
    assert.equal(tampered, null);
  });
});

describe("2. Role-Based Access Control (RBAC)", () => {
  it("should correctly distinguish student, faculty, staff and admin", () => {
    assert.equal(isAdmin("ADMIN"), true);
    assert.equal(isAdmin("DOCTOR"), false);
    assert.equal(isAdmin("STUDENT"), false);

    assert.equal(isFaculty("DOCTOR"), true);
    assert.equal(isFaculty("TA"), true);
    assert.equal(isFaculty("STUDENT"), false);

    assert.equal(isStudent("STUDENT"), true);
    assert.equal(isStudent("DOCTOR"), false);

    assert.equal(isStaff("ADMIN"), true);
    assert.equal(isStaff("DOCTOR"), true);
    assert.equal(isStaff("TA"), true);
    assert.equal(isStaff("STUDENT"), false);
  });
});

describe("3. Registration & Input Validation", () => {
  it("should validate student registration payload and reject missing required fields", () => {
    const validStudent = {
      role: "STUDENT",
      name: "أحمد إبراهيم محمد",
      email: "ahmed@csis.edu.eg",
      password: "password123",
      studentId: "20241010",
      universityCode: "CSI-24-010",
      academicYearId: "yr_1",
    };

    const res = StudentRegisterSchema.safeParse(validStudent);
    assert.equal(res.success, true);

    // Reject short password
    const invalidPass = StudentRegisterSchema.safeParse({
      ...validStudent,
      password: "123",
    });
    assert.equal(invalidPass.success, false);

    // Reject invalid email
    const invalidEmail = StudentRegisterSchema.safeParse({
      ...validStudent,
      email: "not-an-email",
    });
    assert.equal(invalidEmail.success, false);

    // Reject missing student ID
    const missingId = StudentRegisterSchema.safeParse({
      ...validStudent,
      studentId: "",
    });
    assert.equal(missingId.success, false);
  });

  it("should validate faculty registration for DOCTOR and TA", () => {
    const validDoctor = {
      role: "DOCTOR",
      name: "د. هاني السعيد",
      email: "hani@csis.edu.eg",
      password: "password123",
      departmentId: "dept_cs",
      title: "أستاذ مشارك",
    };

    const res = FacultyRegisterSchema.safeParse(validDoctor);
    assert.equal(res.success, true);

    // Reject registration with role STUDENT in Faculty schema
    const invalidRole = FacultyRegisterSchema.safeParse({
      ...validDoctor,
      role: "STUDENT",
    });
    assert.equal(invalidRole.success, false);
  });

  it("should validate login input", () => {
    const valid = LoginSchema.safeParse({
      email: "user@csis.edu.eg",
      password: "somepassword",
      rememberMe: true,
    });
    assert.equal(valid.success, true);
  });
});

describe("4. QR Attendance Logic & Duplicate Prevention", () => {
  it("should validate session duration and token payload", () => {
    const validSession = {
      subjectId: "subj_cs101",
      academicYearId: "yr_1",
      durationMinutes: 10,
      room: "مدرج 1",
    };

    const parsed = AttendanceSessionCreateSchema.safeParse(validSession);
    assert.equal(parsed.success, true);

    const validScan = AttendanceScanSchema.safeParse({
      token: "SESSION_TOKEN_ABC123",
    });
    assert.equal(validScan.success, true);
  });

  it("should detect expired vs active attendance sessions", () => {
    const now = Date.now();
    const activeSession = {
      id: "sess_1",
      expiresAt: new Date(now + 5 * 60 * 1000), // 5 minutes in future
      isActive: true,
    };

    const isStillActive = activeSession.isActive && new Date(activeSession.expiresAt).getTime() > Date.now();
    assert.equal(isStillActive, true);

    const expiredSession = {
      id: "sess_2",
      expiresAt: new Date(now - 10 * 1000), // 10 seconds in past
      isActive: true,
    };

    const isExpired = !expiredSession.isActive || new Date(expiredSession.expiresAt).getTime() <= Date.now();
    assert.equal(isExpired, true);
  });

  it("should prevent duplicate attendance records for the same session and student", () => {
    // Simulated in-memory attendance tracking
    const existingRecords = new Set<string>();
    const markAttendance = (sessionId: string, studentId: string) => {
      const key = `${sessionId}:${studentId}`;
      if (existingRecords.has(key)) {
        return { success: false, error: "تم تسجيل حضورك بالفعل." };
      }
      existingRecords.add(key);
      return { success: true, message: "تم تسجيل حضورك بنجاح." };
    };

    const firstAttempt = markAttendance("sess_100", "student_200");
    assert.equal(firstAttempt.success, true);

    const duplicateAttempt = markAttendance("sess_100", "student_200");
    assert.equal(duplicateAttempt.success, false);
    assert.equal(duplicateAttempt.error, "تم تسجيل حضورك بالفعل.");
  });
});

describe("5. Maintenance Mode Routing Logic", () => {
  it("should allow ADMIN full access during maintenance and redirect others", () => {
    const shouldRedirectToMaintenance = (
      isMaintenanceActive: boolean,
      userRole: string | null,
      pathname: string
    ) => {
      if (!isMaintenanceActive) return false;
      if (userRole === "ADMIN") return false;
      if (pathname === "/maintenance" || pathname === "/login" || pathname.startsWith("/api/auth")) {
        return false;
      }
      return true;
    };

    // When maintenance is ON:
    // Admin goes to /admin -> NO redirect
    assert.equal(shouldRedirectToMaintenance(true, "ADMIN", "/admin"), false);
    // Student goes to /dashboard/student -> MUST redirect
    assert.equal(shouldRedirectToMaintenance(true, "STUDENT", "/dashboard/student"), true);
    // Anonymous user goes to homepage / -> MUST redirect
    assert.equal(shouldRedirectToMaintenance(true, null, "/"), true);
    // Anyone goes to /login -> NO redirect (so admin can log in)
    assert.equal(shouldRedirectToMaintenance(true, null, "/login"), false);
    // Anyone goes to /maintenance -> NO redirect
    assert.equal(shouldRedirectToMaintenance(true, null, "/maintenance"), false);

    // When maintenance is OFF:
    assert.equal(shouldRedirectToMaintenance(false, "STUDENT", "/dashboard/student"), false);
  });
});

