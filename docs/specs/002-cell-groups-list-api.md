# Spec 002: Enriched Cell Groups List API

## Summary

Extend the existing `GET /cell-groups` endpoint to return the data the **Cell Groups List** page (`/app/cell-groups`) actually needs: zone name, leader name, member count, and attendance rate. The current endpoint only returns `{ id, name, description, createdAt, updatedAt }`, which is missing most of what the frontend table displays.

## Background

### What exists today

The `CellGroupController` already has full CRUD at `/cell-groups`. The response DTO (`CellGroupResponse`) only maps basic `CellGroup` fields. The frontend page needs:

```ts
{
  id: string
  name: string          // cellGroup.name
  zone: string          // zone.name (via cellGroup.zone FK)
  leader: string        // user.name where cellGroupMember.role = LEADER
  memberCount: number   // count of active CellGroupMembers
  attendanceRate: number // (future — hardcode 0 for now)
  createdAt: string     // cellGroup.createdAt
}
```

### Existing models (no schema changes needed)

| Model | Relevant fields |
|---|---|
| `CellGroup` | id, name, zone (FK → Zone) |
| `Zone` | id, name |
| `CellGroupMember` | user (FK), cellGroup (FK), role, endedAt |
| `User` | id, name |

All relationships and tables already exist.

## Endpoints

### 1. `GET /cell-groups` (modify existing)

Replace the current flat response with an enriched one. This is a **breaking change** to the response shape, which is acceptable since no frontend consumer is using the current response yet.

**Query parameters** (all optional, all new):

| Param | Type | Default | Notes |
|---|---|---|---|
| `search` | string | — | Filters by cell group name (case-insensitive) |
| `zoneId` | UUID | — | Filters to cell groups in a specific zone |
| `page` | int | 0 | Zero-indexed page number |
| `size` | int | 20 | Page size (max 100) |
| `sort` | string | `name,asc` | Sortable: `name`, `memberCount`, `createdAt` |

**Response** `200 OK`:

```json
{
  "content": [
    {
      "id": "uuid",
      "name": "사랑 목장",
      "zone": {
        "id": "uuid",
        "name": "1초원"
      },
      "leader": {
        "id": "uuid",
        "name": "김민수"
      },
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

### 2. `GET /cell-groups/{id}` (modify existing)

Return the same enriched shape for a single cell group.

**Response** `200 OK`: Same object shape as a single item in the list above.

### 3. Zone endpoints: `GET /zones`

A simple list endpoint for zones, needed by the frontend for the zone filter dropdown on the cell groups page.

**Response** `200 OK`:

```json
[
  { "id": "uuid", "name": "1초원", "createdAt": "2024-01-01T00:00:00Z" },
  { "id": "uuid", "name": "2초원", "createdAt": "2024-01-01T00:00:00Z" }
]
```

## Implementation plan

### New files

| File | Purpose |
|---|---|
| `cellgroup/CellGroupMemberRepository.kt` | JPA repository (may already be created in Spec 001 — shared) |
| `cellgroup/dto/CellGroupListResponse.kt` | New enriched response DTO |
| `cellgroup/dto/ZoneInfo.kt` | Nested DTO for zone |
| `cellgroup/dto/LeaderInfo.kt` | Nested DTO for leader |
| `zone/ZoneController.kt` | Simple REST controller |
| `zone/ZoneService.kt` | Service layer |
| `zone/ZoneRepository.kt` | JPA repository |
| `zone/dto/ZoneResponse.kt` | Response DTO |

### Changes to existing files

| File | Change |
|---|---|
| `cellgroup/CellGroupController.kt` | Update return types to use new enriched DTOs; add query params |
| `cellgroup/CellGroupService.kt` | Rewrite `getAll()` and `getById()` to join with Zone + CellGroupMember; inject new repositories |
| `cellgroup/dto/CellGroupResponse.kt` | Can keep for create/update responses, or replace entirely |

### Query strategy

The enriched list needs data from three tables. Use a JPQL query or build it in the service layer:

```kotlin
// In CellGroupService
fun getAll(search: String?, zoneId: UUID?, pageable: Pageable): Page<CellGroupListResponse> {
    val cellGroups = cellGroupRepository.findFiltered(search, zoneId, pageable)
    return cellGroups.map { cg ->
        val members = cellGroupMemberRepository.findActiveByCellGroupId(cg.id!!)
        val leader = members.find { it.role == CellGroupMemberRole.LEADER }
        CellGroupListResponse(
            id = cg.id,
            name = cg.name,
            zone = cg.zone?.let { ZoneInfo(it.id!!, it.name) },
            leader = leader?.let { LeaderInfo(it.user.id!!, it.user.name) },
            memberCount = members.size,
            createdAt = cg.createdAt,
        )
    }
}
```

For better performance, this could use a single query with aggregation, but the N+1 approach is acceptable at the expected data scale (< 50 cell groups).

### Pagination

Reuse the `PagedResponse` generic wrapper from Spec 001.

## Relationship to Spec 001

- Both specs need `CellGroupMemberRepository`. Whichever is implemented first creates it; the second reuses it.
- Both specs use the same `PagedResponse` wrapper.
- These two specs can be implemented in either order or in parallel.

## Out of scope

- Attendance rate calculation (return `null` or omit for now — requires attendance tracking infrastructure)
- Zone CRUD beyond the list endpoint (create/update/delete zones)
- Zone member management
