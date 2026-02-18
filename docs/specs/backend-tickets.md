# Backend Work Tickets

## Dependency Graph

```
          ┌──────┐
          │ BE-1 │  Shared infrastructure
          └──┬───┘
       ┌─────┼──────────┐
       ▼     ▼          ▼
   ┌──────┐┌──────┐ ┌──────┐
   │ BE-2 ││ BE-4 │ │ BE-7 │  (independent of each other)
   └──┬───┘└──┬───┘ └──┬───┘
      ▼       ▼        ▼
   ┌──────┐┌──────┐ ┌──────┐
   │ BE-3 ││ BE-5 │ │ BE-8 │
   └──────┘└──┬───┘ └──────┘
              ▼
           ┌──────┐
           │ BE-6 │
           └──────┘

   ┌──────┐  ┌───────┐
   │ BE-9 │  │ BE-10 │  (no dependencies — can start immediately)
   └──────┘  └───────┘
```

### Suggested assignment for 3 people

| Person | Tickets (in order) | Theme |
|---|---|---|
| **A** | BE-1 → BE-2 → BE-3 | Shared infra, then Members |
| **B** | BE-9 → BE-4 → BE-5 → BE-6 | Events, then Cell Groups (start with BE-9 while waiting for BE-1) |
| **C** | BE-10 → BE-7 → BE-8 | New Members, then Reports (start with BE-10 while waiting for BE-1) |

Person A starts first with BE-1 (shared infrastructure). Persons B and C can immediately begin BE-9 and BE-10 (no dependencies), then pick up their BE-1-dependent work once it's merged.

---

## BE-1: Shared Infrastructure (PagedResponse + CellGroupMemberRepository)

**Size:** Small (~1 hour)
**Dependencies:** None
**Blocked by:** Nothing — start here first

### What

Create two reusable pieces that multiple tickets depend on:

1. A generic `PagedResponse<T>` wrapper DTO for all paginated endpoints
2. `CellGroupMemberRepository` with common queries used by Members, Cell Groups, and Reports tickets

### Implementation

**New files:**

| File | Purpose |
|---|---|
| `common/dto/PagedResponse.kt` | Generic paginated response wrapper |
| `cellgroup/CellGroupMemberRepository.kt` | JPA repository for CellGroupMember |

**`PagedResponse.kt`:**

```kotlin
data class PagedResponse<T>(
    val content: List<T>,
    val page: Int,
    val size: Int,
    val totalElements: Long,
    val totalPages: Int,
) {
    companion object {
        fun <T> from(page: Page<T>): PagedResponse<T> = PagedResponse(
            content = page.content,
            page = page.number,
            size = page.size,
            totalElements = page.totalElements,
            totalPages = page.totalPages,
        )
    }
}
```

**`CellGroupMemberRepository.kt`:**

```kotlin
interface CellGroupMemberRepository : JpaRepository<CellGroupMember, CellGroupMemberId> {
    fun findByCellGroupIdAndEndedAtIsNull(cellGroupId: UUID): List<CellGroupMember>

    fun findByUserIdAndEndedAtIsNull(userId: UUID): CellGroupMember?

    @Query("""
        SELECT cgm FROM CellGroupMember cgm
        JOIN FETCH cgm.user u
        JOIN FETCH cgm.cellGroup cg
        WHERE cgm.endedAt IS NULL
        AND (:search IS NULL OR LOWER(u.name) LIKE LOWER(CONCAT('%', :search, '%')))
        AND (:cellGroupId IS NULL OR cg.id = :cellGroupId)
    """)
    fun findActiveMembers(
        @Param("search") search: String?,
        @Param("cellGroupId") cellGroupId: UUID?,
        pageable: Pageable
    ): Page<CellGroupMember>
}
```

### Done when
- `PagedResponse` compiles and has the `from(Page<T>)` factory
- `CellGroupMemberRepository` compiles with all three query methods
- Both are on `main` and available for other tickets

---

## BE-2: Members List API

**Size:** Medium (~2 hours)
**Dependencies:** BE-1
**Frontend page:** `/app/members` (`apps/web/app/routes/app/members/index.tsx`)

### What

`GET /members` — paginated list of members with their cell group assignment.

### Endpoint

**`GET /members`**

| Query param | Type | Default | Notes |
|---|---|---|---|
| `search` | string | — | Filter by name (case-insensitive LIKE) |
| `cellGroupId` | UUID | — | Filter to members of a cell group |
| `page` | int | 0 | Zero-indexed |
| `size` | int | 20 | Max 100 |
| `sort` | string | `name,asc` | Sortable: `name`, `birthday`, `createdAt` |

**Response `200`:**

```json
{
  "content": [
    {
      "id": "uuid",
      "name": "김민수",
      "avatarUrl": "/avatars/member-1.jpg",
      "gender": "MALE",
      "birthday": "1990-05-12",
      "address": "430 Queen Street, Auckland Central, Auckland 1010",
      "phoneNumber": "010-1234-5678",
      "cellGroup": { "id": "uuid", "name": "사랑 목장" },
      "role": "LEADER",
      "createdAt": "2023-03-15T00:00:00Z"
    }
  ],
  "page": 0,
  "size": 20,
  "totalElements": 15,
  "totalPages": 1
}
```

### Implementation

**New files:**

| File | Purpose |
|---|---|
| `member/MemberController.kt` | REST controller |
| `member/MemberService.kt` | Service — queries `CellGroupMemberRepository.findActiveMembers()` |
| `member/dto/MemberListResponse.kt` | Response DTO for list items |
| `member/dto/CellGroupInfo.kt` | Nested `{ id, name }` DTO |

### Notes

- Only return active members (`endedAt IS NULL` on `CellGroupMember`)
- Address: concatenate `addressStreet`, `addressCity`, `addressState`, `addressPostalCode` — skip null segments
- `role` maps from `CellGroupMemberRole.LEADER` / `MEMBER`
- Uses `PagedResponse` from BE-1

### Done when
- `GET /members` returns paginated results matching the response shape
- Search by name filters correctly
- Filter by `cellGroupId` works
- Sorting works on `name`, `birthday`, `createdAt`

---

## BE-3: Member Detail & Update API

**Size:** Medium (~2 hours)
**Dependencies:** BE-2 (reuses `MemberService`, `MemberController`, DTOs)
**Frontend page:** `/app/members/:id` (`apps/web/app/routes/app/members/details.tsx`)

### What

`GET /members/{id}` and `PUT /members/{id}` — view and update a member's profile. Includes a Flyway migration to add a `notes` column to `users`.

### Database change

**`V010__add_notes_to_users.sql`:**
```sql
ALTER TABLE users ADD COLUMN notes TEXT;
```

Update the `User` entity to include `var notes: String? = null`.

### Endpoints

**`GET /members/{id}`** — Response `200`:

```json
{
  "id": "uuid",
  "name": "김민수",
  "avatarUrl": "/avatars/member-1.jpg",
  "gender": "MALE",
  "birthday": "1990-05-12",
  "address": "430 Queen Street, Auckland Central, Auckland 1010",
  "phoneNumber": "010-1234-5678",
  "cellGroup": { "id": "uuid", "name": "사랑 목장" },
  "role": "LEADER",
  "createdAt": "2023-03-15T00:00:00Z",
  "notes": "목장 모임을 성실하게 이끌고 있습니다."
}
```

**`PUT /members/{id}`** — Request body (all optional):

```json
{
  "name": "김민수",
  "gender": "MALE",
  "birthday": "1990-05-12",
  "phoneNumber": "010-1234-5678",
  "addressStreet": "430 Queen Street",
  "addressCity": "Auckland Central",
  "addressState": "Auckland",
  "addressPostalCode": "1010",
  "addressCountry": "New Zealand",
  "avatarUrl": "/avatars/member-1.jpg",
  "notes": "Updated notes."
}
```

Returns the same shape as `GET /members/{id}`.

### New files

| File | Purpose |
|---|---|
| `member/dto/MemberDetailResponse.kt` | Response DTO with `notes` field |
| `member/dto/UpdateMemberRequest.kt` | Request DTO |
| `db/migration/V010__add_notes_to_users.sql` | Migration |

### Done when
- `GET /members/{id}` returns the full profile including `notes`
- `GET /members/{nonexistent-id}` returns 404
- `PUT /members/{id}` updates only the provided fields
- `notes` column exists in the database

---

## BE-4: Enriched Cell Groups List API

**Size:** Medium (~2 hours)
**Dependencies:** BE-1
**Frontend page:** `/app/cell-groups` (`apps/web/app/routes/app/cell-groups/index.tsx`)

### What

Modify the existing `GET /cell-groups` to return zone name, leader name, and member count. Add pagination and search. This is a breaking change to the response shape (acceptable since frontend isn't consuming it yet).

### Endpoint

**`GET /cell-groups`** (modified):

| Query param | Type | Default | Notes |
|---|---|---|---|
| `search` | string | — | Filter by cell group name |
| `zoneId` | UUID | — | Filter by zone |
| `page` | int | 0 | Zero-indexed |
| `size` | int | 20 | Max 100 |
| `sort` | string | `name,asc` | Sortable: `name`, `createdAt` |

**Response `200`:**

```json
{
  "content": [
    {
      "id": "uuid",
      "name": "사랑 목장",
      "description": null,
      "zone": { "id": "uuid", "name": "1초원" },
      "leader": { "id": "uuid", "name": "김민수" },
      "memberCount": 8,
      "createdAt": "2024-03-15T00:00:00Z"
    }
  ],
  "page": 0,
  "size": 20,
  "totalElements": 15,
  "totalPages": 1
}
```

### Changes to existing files

| File | Change |
|---|---|
| `cellgroup/CellGroupController.kt` | Update `getAll()` signature with query params, return new DTO |
| `cellgroup/CellGroupService.kt` | Rewrite `getAll()` to join Zone + CellGroupMember for leader/count |
| `cellgroup/CellGroupRepository.kt` | Add filtered/paginated query |

### New files

| File | Purpose |
|---|---|
| `cellgroup/dto/CellGroupListResponse.kt` | Enriched response DTO |
| `cellgroup/dto/ZoneInfo.kt` | Nested `{ id, name }` for zone |
| `cellgroup/dto/LeaderInfo.kt` | Nested `{ id, name }` for leader |

### Notes

- For each cell group, find the leader by querying `CellGroupMember` where `role = LEADER` and `endedAt IS NULL`
- Member count = count of active `CellGroupMember` records
- `zone` and `leader` can be `null` (cell group might not have a zone or a leader assigned yet)
- N+1 queries are acceptable at expected scale (< 50 cell groups)

### Done when
- `GET /cell-groups` returns paginated results with zone, leader, memberCount
- Search by name works
- Filter by zoneId works
- Old flat response is replaced

---

## BE-5: Zone List + Cell Group Detail Enrichment

**Size:** Small-Medium (~1.5 hours)
**Dependencies:** BE-4
**Frontend pages:** Zone filter dropdown on cell groups page, `GET /cell-groups/{id}` detail

### What

1. Create a `GET /zones` endpoint for the zone filter dropdown
2. Update `GET /cell-groups/{id}` to return the same enriched shape as the list

### Endpoints

**`GET /zones`** — Response `200`:

```json
[
  { "id": "uuid", "name": "1초원", "createdAt": "2024-01-01T00:00:00Z" },
  { "id": "uuid", "name": "2초원", "createdAt": "2024-01-01T00:00:00Z" }
]
```

**`GET /cell-groups/{id}`** (modified) — same enriched shape as list items from BE-4.

### New files

| File | Purpose |
|---|---|
| `zone/ZoneController.kt` | REST controller |
| `zone/ZoneService.kt` | Service |
| `zone/ZoneRepository.kt` | JPA repository |
| `zone/dto/ZoneResponse.kt` | Response DTO |

### Changes to existing files

| File | Change |
|---|---|
| `cellgroup/CellGroupController.kt` | Update `getById()` return type to `CellGroupListResponse` |
| `cellgroup/CellGroupService.kt` | Extract enrichment logic to a shared method used by both list and detail |

### Done when
- `GET /zones` returns all zones sorted by name
- `GET /cell-groups/{id}` returns enriched response with zone, leader, memberCount
- `GET /cell-groups/{nonexistent-id}` returns 404

---

## BE-6: Cell Group Members Roster API

**Size:** Small (~1 hour)
**Dependencies:** BE-5 (cell group detail should exist first)
**Frontend page:** `/app/cell-groups/:id` (`apps/web/app/routes/app/cell-groups/details.tsx`)

### What

`GET /cell-groups/{id}/members` — returns the member roster for a cell group.

### Endpoint

**`GET /cell-groups/{id}/members`** — Response `200`:

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

### Implementation

Add to `CellGroupController` or create `CellGroupMemberController`. Query `CellGroupMemberRepository.findByCellGroupIdAndEndedAtIsNull()`, sort leader first, then alphabetical.

### New files

| File | Purpose |
|---|---|
| `cellgroup/dto/CellGroupMemberResponse.kt` | Response DTO |

### Done when
- `GET /cell-groups/{id}/members` returns member list with leader sorted first
- Returns 404 if cell group doesn't exist
- Only active members returned (endedAt IS NULL)

---

## BE-7: Cell Group Reports — Model + Read/Create

**Size:** Medium (~2.5 hours)
**Dependencies:** BE-1
**Frontend page:** `/app/cell-groups/:id` reports section

### What

Create the `CellGroupReport` entity, Flyway migration, and implement `GET` (list) and `POST` (create) endpoints.

### Database change

**`V011__create_cell_group_reports.sql`** (or V010 if BE-3's migration uses a different number):

```sql
CREATE TABLE cell_group_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cell_group_id UUID NOT NULL REFERENCES cell_groups(id),
    author_id UUID NOT NULL REFERENCES users(id),
    meeting_date DATE NOT NULL,
    attendee_count INT NOT NULL,
    total_members INT NOT NULL,
    prayer_topics TEXT,
    content TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

### Endpoints

**`GET /cell-groups/{id}/reports`**:

| Query param | Type | Default |
|---|---|---|
| `page` | int | 0 |
| `size` | int | 10 (max 50) |

Response `200`:
```json
{
  "content": [
    {
      "id": "uuid",
      "meetingDate": "2025-02-09",
      "attendeeCount": 7,
      "totalMembers": 8,
      "prayerTopics": "새 학기 자녀들의 적응을 위해",
      "content": null,
      "author": { "id": "uuid", "name": "김민수" },
      "createdAt": "2025-02-09T10:00:00Z"
    }
  ],
  "page": 0,
  "size": 10,
  "totalElements": 5,
  "totalPages": 1
}
```

**`POST /cell-groups/{id}/reports`** — Request body:

```json
{
  "meetingDate": "2025-02-09",
  "attendeeCount": 7,
  "totalMembers": 8,
  "prayerTopics": "기도 제목",
  "content": "내용"
}
```

Validation: `meetingDate` required and not in future, `attendeeCount >= 0`, `totalMembers >= 1`, `attendeeCount <= totalMembers`. Author set from authenticated user (`SecurityContextHolder.getContext().authentication.principal as User`).

Response `201`: single report object.

### New files

| File | Purpose |
|---|---|
| `cellgroup/CellGroupReport.kt` | JPA entity |
| `cellgroup/CellGroupReportRepository.kt` | JPA repository |
| `cellgroup/CellGroupReportService.kt` | Service |
| `cellgroup/CellGroupReportController.kt` | REST controller |
| `cellgroup/dto/CellGroupReportResponse.kt` | Response DTO |
| `cellgroup/dto/CreateReportRequest.kt` | Request DTO |
| `cellgroup/dto/AuthorInfo.kt` | Nested `{ id, name }` DTO |
| `db/migration/V011__create_cell_group_reports.sql` | Migration |

### Done when
- Migration runs and creates the table
- `GET /cell-groups/{id}/reports` returns paginated reports, newest first
- `POST /cell-groups/{id}/reports` creates a report with the authenticated user as author
- Validation errors return 400

---

## BE-8: Cell Group Reports — Update & Delete

**Size:** Small (~1 hour)
**Dependencies:** BE-7
**Frontend page:** `/app/cell-groups/:id` reports section

### What

`PUT` and `DELETE` for cell group reports, with authorization checks.

### Endpoints

**`PUT /cell-groups/{id}/reports/{reportId}`** — Request body (all optional):

```json
{
  "meetingDate": "2025-02-09",
  "attendeeCount": 7,
  "totalMembers": 8,
  "prayerTopics": "Updated topics",
  "content": "Updated content"
}
```

- Only the original author can update → return `403` otherwise
- Response `200`: updated report object

**`DELETE /cell-groups/{id}/reports/{reportId}`**

- Only the original author **or** the cell group leader can delete → return `403` otherwise
- Response `204 No Content`

### New files

| File | Purpose |
|---|---|
| `cellgroup/dto/UpdateReportRequest.kt` | Request DTO |

### Changes to existing files

| File | Change |
|---|---|
| `cellgroup/CellGroupReportController.kt` | Add `update()` and `delete()` methods |
| `cellgroup/CellGroupReportService.kt` | Add `update()` and `delete()` with auth checks |

### Done when
- `PUT` updates report fields, returns 403 for non-author
- `DELETE` removes report, returns 403 for unauthorized users
- Leader of the cell group can delete any report in their group

---

## BE-9: Events Model + CRUD

**Size:** Medium (~2 hours)
**Dependencies:** None
**Frontend page:** `/app/calendar` (`apps/web/app/routes/app/calendar.tsx`)

### What

New `Event` entity and full CRUD endpoints. Powers the calendar page.

### Database change

**`V012__create_events.sql`:**

```sql
CREATE TABLE events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(200) NOT NULL,
    description TEXT,
    location VARCHAR(300),
    color VARCHAR(7) NOT NULL DEFAULT '#3b82f6',
    start_date TIMESTAMPTZ NOT NULL,
    end_date TIMESTAMPTZ NOT NULL,
    all_day BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

### Endpoints

**`GET /events`**:

| Query param | Type | Default | Notes |
|---|---|---|---|
| `from` | ISO date | — | Filter events starting from this date |
| `to` | ISO date | — | Filter events ending before this date |

Response `200`:
```json
[
  {
    "id": "uuid",
    "title": "주일예배",
    "description": "주일 오전 예배",
    "location": "본당",
    "color": "#3b82f6",
    "startDate": "2026-02-15T11:00:00Z",
    "endDate": "2026-02-15T12:30:00Z",
    "allDay": false,
    "createdAt": "2026-01-01T00:00:00Z"
  }
]
```

**`POST /events`** — Request body:
```json
{
  "title": "주일예배",
  "description": "주일 오전 예배",
  "location": "본당",
  "color": "#3b82f6",
  "startDate": "2026-02-15T11:00:00Z",
  "endDate": "2026-02-15T12:30:00Z",
  "allDay": false
}
```

Validation: `title` required, `startDate` required, `endDate` required and must be after `startDate`, `color` must be valid hex.

**`PUT /events/{id}`** — same body, all optional. Response `200`.

**`DELETE /events/{id}`** — Response `204`.

### New files

| File | Purpose |
|---|---|
| `event/Event.kt` | JPA entity |
| `event/EventRepository.kt` | JPA repository with date range query |
| `event/EventService.kt` | Service |
| `event/EventController.kt` | REST controller |
| `event/dto/EventResponse.kt` | Response DTO |
| `event/dto/CreateEventRequest.kt` | Request DTO |
| `event/dto/UpdateEventRequest.kt` | Request DTO |
| `db/migration/V012__create_events.sql` | Migration |

### Notes

- No pagination needed — events are queried by date range, typical result set is small
- The `from`/`to` query params let the frontend fetch events for the visible calendar range
- Returns list (not paged) sorted by `startDate` ascending

### Done when
- Migration runs and creates the table
- Full CRUD works at `/events`
- Date range filtering works with `from` and `to` params
- Validation errors return 400

---

## BE-10: New Member Education Tracking

**Size:** Medium (~2 hours)
**Dependencies:** None
**Frontend page:** `/app/members/new-members` (`apps/web/app/routes/app/members/new-members.tsx`)

### What

Track new member education progress (4-week program) and cell group assignment. New `NewMemberEducation` entity.

### Database change

**`V013__create_new_member_education.sql`:**

```sql
CREATE TABLE new_member_education (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) UNIQUE,
    education_week INT NOT NULL DEFAULT 1 CHECK (education_week BETWEEN 1 AND 4),
    education_completed BOOLEAN NOT NULL DEFAULT false,
    assigned_cell_group_id UUID REFERENCES cell_groups(id),
    assigned_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

### Endpoints

**`GET /new-members`** — Response `200`:

```json
{
  "inEducation": [
    {
      "id": "uuid",
      "name": "김서윤",
      "avatarUrl": null,
      "gender": "FEMALE",
      "birthday": "1999-03-14",
      "phoneNumber": "010-1122-3344",
      "registeredAt": "2026-02-09T00:00:00Z",
      "educationWeek": 1,
      "educationCompleted": false
    }
  ],
  "assigned": [
    {
      "id": "uuid",
      "name": "강지호",
      "avatarUrl": null,
      "gender": "MALE",
      "birthday": "1993-01-09",
      "phoneNumber": "010-8899-0011",
      "registeredAt": "2025-12-15T00:00:00Z",
      "educationWeek": 4,
      "educationCompleted": true,
      "cellGroup": { "id": "uuid", "name": "사랑 목장" },
      "assignedAt": "2026-01-12T00:00:00Z"
    }
  ],
  "totalCount": 12,
  "inEducationCount": 7,
  "assignedCount": 5
}
```

**`PUT /new-members/{id}/education`** — update education progress:

```json
{ "educationWeek": 2 }
```

**`PUT /new-members/{id}/assign`** — assign to cell group:

```json
{ "cellGroupId": "uuid" }
```

Sets `educationCompleted = true`, `assignedCellGroupId`, `assignedAt = now()`. Also creates a `CellGroupMember` record for the user. **Depends on BE-1** only if creating the `CellGroupMember` — can stub this out or handle inline.

### New files

| File | Purpose |
|---|---|
| `newmember/NewMemberEducation.kt` | JPA entity |
| `newmember/NewMemberEducationRepository.kt` | JPA repository |
| `newmember/NewMemberService.kt` | Service |
| `newmember/NewMemberController.kt` | REST controller |
| `newmember/dto/NewMembersResponse.kt` | Response DTO |
| `newmember/dto/NewMemberInEducationResponse.kt` | DTO for in-education members |
| `newmember/dto/NewMemberAssignedResponse.kt` | DTO for assigned members |
| `newmember/dto/UpdateEducationRequest.kt` | Request DTO |
| `newmember/dto/AssignCellGroupRequest.kt` | Request DTO |
| `db/migration/V013__create_new_member_education.sql` | Migration |

### Done when
- Migration runs
- `GET /new-members` returns members split into `inEducation` and `assigned` groups with counts
- `PUT /new-members/{id}/education` advances education week
- `PUT /new-members/{id}/assign` assigns to a cell group and marks education complete

---

## Migration number coordination

Since BE-3, BE-7, BE-9, and BE-10 each add a Flyway migration, coordinate numbers:

| Ticket | Migration |
|---|---|
| BE-3 | `V010__add_notes_to_users.sql` |
| BE-7 | `V011__create_cell_group_reports.sql` |
| BE-9 | `V012__create_events.sql` |
| BE-10 | `V013__create_new_member_education.sql` |

If tickets land out of order, renumber before merging. Flyway requires sequential, gap-free version numbers.
