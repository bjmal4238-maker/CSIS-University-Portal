# CSIS Portal — RBAC (Role-Based Access Control)

## Roles

| Role | Arabic | Description |
|---|---|---|
| `admin` | أدمن / عميد | Full platform control |
| `doctor` | دكتور | Course owner — news, QR sessions, grades |
| `ta` | معيد | Teaching assistant — sections, section attendance |
| `student` | طالب | Read news, scan QR attendance, own profile |

## Permission Matrix

| Permission | Admin | Doctor | TA | Student |
|---|:---:|:---:|:---:|:---:|
| `platform.manage` | ✓ | | | |
| `users.read` | ✓ | | | |
| `users.write` | ✓ | | | |
| `users.assign_roles` | ✓ | | | |
| `profile.read_own` | ✓ | ✓ | ✓ | ✓ |
| `profile.write_own` | ✓ | ✓ | ✓ | ✓ |
| `profile.write_any` | ✓ | | | |
| `subjects.manage` | ✓ | | | |
| `subjects.read` | ✓ | ✓ | ✓ | ✓ |
| `news.read` | ✓ | ✓ | ✓ | ✓ |
| `news.write` | ✓ | | | |
| `news.write_own_subject` | ✓ | ✓ | ✓ | |
| `schedules.manage` | ✓ | ✓ | | |
| `schedules.read` | ✓ | ✓ | ✓ | ✓ |
| `attendance.session.create` | ✓ | ✓ | ✓ | |
| `attendance.session.manage` | ✓ | ✓ | ✓ | |
| `attendance.scan` | | | | ✓ |
| `attendance.report.read` | ✓ | ✓ | ✓ | |
| `grades.write` | ✓ | ✓ | | |

## Route Guards

| Route | Required Permission |
|---|---|
| `/admin` | `platform.manage` |
| `/attendance/session` | `attendance.session.create` |
| `/attendance/report` | `attendance.report.read` |
| `/attendance/scan` | `attendance.scan` |
| `/dashboard`, `/news`, `/profile` | Authenticated (any role) |

## Implementation

- Permission definitions: `lib/rbac/permissions.ts`
- Route guard: `components/auth/AuthGuard.tsx` + `canAccessRoute()`
- Sidebar visibility: filtered by role and permission in `components/layout/Sidebar.tsx`
- Admin role assignment: `/admin` page → `assignUserRole()` in Firestore

## Student Identification at Login

1. User authenticates via Microsoft / Google / OTP
2. `resolveUserProfile()` looks up Firestore `users/{uid}`
3. If missing, matches email against university registry (`lib/data/registry.ts`)
4. Profile (role, studentId, major) is available immediately on dashboard
5. Login page previews registry match before OTP confirmation
