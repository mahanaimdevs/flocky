# Spec 001: Members API Endpoints

## Summary

Implement backend endpoints to power the **Members List** (`/app/members`) and **Member Detail** (`/app/members/:id`) pages. Both pages currently render entirely from hardcoded mock data in the frontend. The `User` model and `CellGroupMember` join table already exist — this work is about exposing them through well-shaped API responses.

## Background

### Existing models (no schema changes needed)

| Model | Key fields |
|---|---|
| `User` | id, email, name, gender, birthday, addressStreet/City/State/PostalCode/Country, phoneNumber, avatarUrl, createdAt |
| `CellGroupMember` | user (FK), cellGroup (FK), role (LEADER/MEMBER), joinedAt, endedAt |
| `CellGroup` | id, name, zone (FK) |

### Frontend data shapes the API must satisfy

**Members list page** — each row needs:

```ts
{
  id: string           // user.id
  name: string         // user.name
  profileImage: string // user.avatarUrl
  gender: string       // user.gender
  birthday: string     // user.birthday  (ISO date)
  address: string      // concatenated address fields
  contact: string      // user.phoneNumber
  cellGroup: string    // cellGroup.name (via CellGroupMember)
  role: string         // cellGroupMember.role mapped to display value
  registeredAt: string // user.createdAt (ISO date)
}
```

**Member detail page** — all of the above, plus:

```ts
{
  notes: string | null         // (see "Notes" section below)
  attendance: AttendanceRecord[] // (see Spec 003 or future work — can be empty array for now)
}
```

## Endpoints

### 1. `GET /members`

List all members with their cell group assignment.

**Query parameters** (all optional):

| Param | Type | Default | Notes |
|---|---|---|---|
| `search` | string | — | Filters by user name (case-insensitive `LIKE`) |
| `cellGroupId` | UUID | — | Filters to members of a specific cell group |
| `page` | int | 0 | Zero-indexed page number |
| `size` | int | 20 | Page size (max 100) |
| `sort` | string | `name,asc` | Sortable fields: `name`, `birthday`, `createdAt` |

**Response** `200 OK`:

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
      "cellGroup": {
        "id": "uuid",
        "name": "사랑 목장"
      },
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

### 2. `GET /members/{id}`

Get a single member's full profile.

**Response** `200 OK`:

```json
{
  "id": "uuid",
  "name": "김민수",
  "avatarUrl": "/avatars/member-1.jpg",
  "gender": "MALE",
  "birthday": "1990-05-12",
  "address": "430 Queen Street, Auckland Central, Auckland 1010",
  "phoneNumber": "010-1234-5678",
  "cellGroup": {
    "id": "uuid",
    "name": "사랑 목장"
  },
  "role": "LEADER",
  "createdAt": "2023-03-15T00:00:00Z",
  "notes": null
}
```

**Error** `404`:

```json
{ "error": "Member not found with id: {id}" }
```

### 3. `PUT /members/{id}`

Update a member's profile fields.

**Request body** (all fields optional):

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
  "notes": "목장 모임을 성실하게 이끌고 있습니다."
}
```

**Response** `200 OK`: Same shape as `GET /members/{id}`.

## Implementation plan

### New files

| File | Purpose |
|---|---|
| `member/MemberController.kt` | REST controller with the 3 endpoints |
| `member/MemberService.kt` | Business logic — queries across User + CellGroupMember |
| `member/dto/MemberListResponse.kt` | Response DTO for list items |
| `member/dto/MemberDetailResponse.kt` | Response DTO for single member |
| `member/dto/UpdateMemberRequest.kt` | Request DTO for PUT |
| `member/dto/MemberCellGroupInfo.kt` | Nested DTO for embedded cell group info |
| `member/dto/PagedResponse.kt` | Generic paged wrapper (reusable) |
| `cellgroup/CellGroupMemberRepository.kt` | JPA repository for `CellGroupMember` |

### Changes to existing files

| File | Change |
|---|---|
| `user/UserRepository.kt` | Add `findByNameContainingIgnoreCase` and paginated query methods |

### Notes on "notes" field

The member detail page shows a free-text notes field per member. The `User` entity doesn't currently have a `notes` column. Two options:

- **Option A (recommended for this spec):** Add a `notes` TEXT column to `users` via a new Flyway migration (V010). Simple, no new tables.
- **Option B:** Create a separate `member_notes` table. Over-engineered for a single text field.

Go with Option A — add `V010__add_notes_to_users.sql` and a `notes` field on `User`.

### Address formatting

The frontend displays a single concatenated address string. The `MemberListResponse` should format it as:

```
"${addressStreet}, ${addressCity}, ${addressState} ${addressPostalCode}"
```

Omitting null segments gracefully.

### Query strategy

The list endpoint needs to join `User` with `CellGroupMember` and `CellGroup`. Use a JPQL query or Spring Data JPA `@Query` on `CellGroupMemberRepository`:

```kotlin
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
```

Members with `endedAt IS NULL` are considered active.

## Out of scope

- Attendance records (future work — the detail page can return an empty array for now)
- Member creation (handled by auth/register flow)
- Member deletion
