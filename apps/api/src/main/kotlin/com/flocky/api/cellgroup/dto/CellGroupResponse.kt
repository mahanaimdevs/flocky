package com.flocky.api.cellgroup.dto

import com.flocky.api.cellgroup.CellGroup
import java.time.Instant
import java.util.UUID

data class CellGroupResponse(
    val id: UUID,
    val name: String,
    val description: String?,
    val createdAt: Instant,
    val updatedAt: Instant,
) {
    companion object {
        fun from(cellGroup: CellGroup): CellGroupResponse =
            CellGroupResponse(
                id = cellGroup.id!!,
                name = cellGroup.name,
                description = cellGroup.description,
                createdAt = cellGroup.createdAt,
                updatedAt = cellGroup.updatedAt,
            )
    }
}
