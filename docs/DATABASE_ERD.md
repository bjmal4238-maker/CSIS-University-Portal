# CSIS Portal — Database ERD

## Entity Relationship Diagram

```mermaid
erDiagram
    USERS ||--o{ ENROLLMENTS : has
    USERS ||--o{ NEWS : publishes
    USERS ||--o{ ATTENDANCE_SESSIONS : creates
    USERS ||--o{ ATTENDANCE_RECORDS : marks
    SUBJECTS ||--o{ ENROLLMENTS : includes
    SUBJECTS ||--o{ NEWS : relates
    SUBJECTS ||--o{ ATTENDANCE_SESSIONS : hosts
    ATTENDANCE_SESSIONS ||--o{ ATTENDANCE_RECORDS : contains
    ROLES ||--o{ USERS : assigns

    USERS {
        string uid PK
        string email
        string displayName
        string role FK
        string studentId
        string major
        string year
        string phone
        string avatarUrl
        string status
        timestamp createdAt
        timestamp updatedAt
    }

    ROLES {
        string id PK
        string name
        string[] permissions
    }

    SUBJECTS {
        string id PK
        string code
        string name
        string doctorId FK
        string[] taIds
        string room
        string schedule
    }

    ENROLLMENTS {
        string id PK
        string studentUid FK
        string studentId
        string subjectId FK
        string section
        string semester
    }

    NEWS {
        string id PK
        string authorId FK
        string authorName
        string authorRole
        string subjectId FK
        string title
        string body
        timestamp createdAt
    }

    ATTENDANCE_SESSIONS {
        string id PK
        string subjectId FK
        string doctorId FK
        string section
        string room
        boolean active
        string currentToken
        number tokenExpiresAt
        number attendeeCount
        timestamp startedAt
        number durationMinutes
    }

    ATTENDANCE_RECORDS {
        string id PK
        string sessionId FK
        string studentUid FK
        string studentId
        string studentName
        string tokenUsed
        timestamp markedAt
    }
```

## Firestore Collections

| Collection | Document ID | Description |
|---|---|---|
| `users` | Firebase Auth UID | User profiles and roles |
| `subjects` | Subject slug (e.g. `cs341`) | Academic courses |
| `enrollments` | Auto ID | Student ↔ subject mapping |
| `news` | Auto ID | News feed items |
| `attendance_sessions` | Auto ID | Active QR sessions |
| `attendance_records` | Auto ID | Student attendance marks |
| `otp_codes` | Email (lowercase) | OTP verification codes |

## Indexes Required

- `news`: `createdAt` DESC
- `attendance_records`: composite `(sessionId, studentUid)`
- `attendance_sessions`: `doctorId`
- `users`: `email`
