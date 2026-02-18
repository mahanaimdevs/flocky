# Spec 003: Cell Group Detail Page API — Members & Reports

## Summary

Implement the backend endpoints needed for the **Cell Group Detail** page (`/app/cell-groups/:id`). This page shows the cell group's member roster and a list of weekly reports (주간 보고서). The members data builds on Spec 002's enriched cell group response, while the reports system requires a new `CellGroupReport` model and full CRUD.

## Background

### Frontend data shapes

**Cell group detail page** needs the enriched cell group from Spec 002 *plus*:

**Members roster:**
```ts
{
  members: Array<{
    id: string
    name: string
    gender: string
    role: "목자" | "목원"
    avatarUrl: string | null
  }>
}
```

**Reports list:**
```ts
{
  reports: Array<{
    id: string
    date: string              // the date of the cell group meeting
    attendeeCount: number
    totalMembers: number
    prayerTopics: string
    author: string            // name of report author
    createdAt: string
  }>
}
```

### Existing models

- `CellGroup`, `CellGroupMember`, `User`, `Zone` — all exist.
- **No report model exists yet.** This spec introduces one.

## New database model

### `CellGroupReport`

| Column | Type | Nullable | Notes |
|---|---|---|---|
| `id` | UUID | PK | Auto-generated |
| `cell_group_id` | UUID | NOT NULL | FK → cell_groups |
| `author_id` | UUID | NOT NULL | FK → users |
| `meeting_date` | DATE | NOT NULL | The date the cell group met |
| `attendee_count` | INT | NOT NULL | Number of attendees |
| `total_members` | INT | NOT NULL | Total members at time of report |
| `prayer_topics` | TEXT | NULL | Free-text prayer topics |
| `content` | TEXT | NULL | Additional report content |
| `created_at` | TIMESTAMP | NOT NULL | Auto-audited |
| `updated_at` | TIMESTAMP | NOT NULL | Auto-audited |

**Flyway migration:** `V010__create_cell_group_reports.sql` (or V011 if Spec 001's notes migration is V010).

## Endpoints

### 1. `GET /cell-groups/{id}/members`

Returns the members of a specific cell group.

**Response** `200 OK`:

```json
[
  {
    "id": "uuid",
    "name": "김민수",
    "gender": "MALE",
    "role": "LEADER",
    "avatarUrl": "/avatars/member-1.jpg"
  },
  {
    "id": "uuid",
    "name": "이영희",
    "gender": "FEMALE",
    "role": "MEMBER",
    "avatarUrl": null
  }
]
```

Leader is always included in the list. Sort order: leader first, then members alphabetically.

**Error** `404` if cell group not found.

### 2. `GET /cell-groups/{id}/reports`

List all reports for a cell group, newest first.

**Query parameters** (all optional):

| Param | Type | Default | Notes |
|---|---|---|---|
| `page` | int | 0 | Zero-indexed |
| `size` | int | 10 | Page size (max 50) |

**Response** `200 OK`:

```json
{
  "content": [
    {
      "id": "uuid",
      "meetingDate": "2025-02-09",
      "attendeeCount": 7,
      "totalMembers": 8,
      "prayerTopics": "새 학기 자녀들의 적응을 위해, 건강 회복을 위해",
      "content": null,
      "author": {
        "id": "uuid",
        "name": "김민수"
      },
      "createdAt": "2025-02-09T10:00:00Z"
    }
  ],
  "page": 0,
  "size": 10,
  "totalElements": 5,
  "totalPages": 1
}
```

### 3. `POST /cell-groups/{id}/reports`

Create a new weekly report.

**Request body:**

```json
{
  "meetingDate": "2025-02-09",
  "attendeeCount": 7,
  "totalMembers": 8,
  "prayerTopics": "새 학기 자녀들의 적응을 위해",
  "content": "좋은 나눔의 시간이었습니다."
}
```

**Validation:**
- `meetingDate`: required, must not be in the future
- `attendeeCount`: required, >= 0
- `totalMembers`: required, >= 1
- `attendeeCount` <= `totalMembers`
- `prayerTopics`: optional, max 2000 chars
- `content`: optional, max 5000 chars

**Response** `201 Created`: Same shape as a single report in the list response.

The `author` is set from the authenticated user's session.

### 4. `PUT /cell-groups/{id}/reports/{reportId}`

Update an existing report. Only the original author can update.

**Request body:** Same as POST (all fields optional for partial update).

**Response** `200 OK`: Updated report object.

**Error** `403` if the authenticated user is not the author.

### 5. `DELETE /cell-groups/{id}/reports/{reportId}`

Delete a report. Only the original author or a cell group leader can delete.

**Response** `204 No Content`.

## Implementation plan

### New files

| File | Purpose |
|---|---|
| `cellgroup/CellGroupReport.kt` | JPA entity |
| `cellgroup/CellGroupReportRepository.kt` | JPA repository |
| `cellgroup/CellGroupReportService.kt` | Business logic for report CRUD |
| `cellgroup/CellGroupReportController.kt` | REST controller for report endpoints |
| `cellgroup/CellGroupMemberController.kt` | REST controller for members sub-resource (or add to existing controller) |
| `cellgroup/dto/CellGroupMemberResponse.kt` | Response DTO for member roster |
| `cellgroup/dto/CellGroupReportResponse.kt` | Response DTO for reports |
| `cellgroup/dto/CreateReportRequest.kt` | Request DTO |
| `cellgroup/dto/UpdateReportRequest.kt` | Request DTO |
| `cellgroup/dto/AuthorInfo.kt` | Nested DTO |
| `db/migration/V010__create_cell_group_reports.sql` or `V011` | Flyway migration |

### Changes to existing files

| File | Change |
|---|---|
| `cellgroup/CellGroupMemberRepository.kt` | Add `findByCellGroupIdAndEndedAtIsNull()` if not already present from Spec 001/002 |

### Query strategy

**Members endpoint:** Simple query on `CellGroupMemberRepository`:

```kotlin
fun findByCellGroupIdAndEndedAtIsNull(cellGroupId: UUID): List<CellGroupMember>
```

Then map to DTOs, sorting leader first.

**Reports endpoint:** Query on `CellGroupReportRepository`:

```kotlin
fun findByCellGroupIdOrderByMeetingDateDesc(
    cellGroupId: UUID,
    pageable: Pageable
): Page<CellGroupReport>
```

### Authentication requirement

The report create/update/delete endpoints need the authenticated user from the session. The existing `SessionAuthenticationFilter` already resolves the user — ensure the controller can access the principal.

## Dependencies

- **Spec 002** should ideally be done first so the enriched cell group response already exists. The members sub-resource and reports can then be layered on top.
- **Spec 001** shares the `CellGroupMemberRepository`.

## Out of scope

- Individual attendance tracking per member per report (a future join table between report and members)
- Report attachments/images
- Notifications when a report is submitted
