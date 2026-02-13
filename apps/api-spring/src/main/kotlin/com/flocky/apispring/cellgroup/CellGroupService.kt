package com.flocky.apispring.cellgroup

import com.flocky.apispring.cellgroup.dto.CellGroupResponse
import com.flocky.apispring.cellgroup.dto.CreateCellGroupRequest
import com.flocky.apispring.cellgroup.dto.UpdateCellGroupRequest
import com.flocky.apispring.common.exception.NotFoundException
import org.springframework.stereotype.Service
import java.util.UUID

@Service
class CellGroupService(
    private val cellGroupRepository: CellGroupRepository,
) {
    fun getAll(): List<CellGroupResponse> = cellGroupRepository.findAll().map(CellGroupResponse::from)

    fun getById(id: UUID): CellGroupResponse {
        val cellGroup =
            cellGroupRepository
                .findById(id)
                .orElseThrow { NotFoundException("Cell group not found with id: $id") }
        return CellGroupResponse.from(cellGroup)
    }

    fun create(request: CreateCellGroupRequest): CellGroupResponse {
        val cellGroup =
            CellGroup(
                name = request.name,
                description = request.description,
            )
        return CellGroupResponse.from(cellGroupRepository.save(cellGroup))
    }

    fun update(
        id: UUID,
        request: UpdateCellGroupRequest,
    ): CellGroupResponse {
        val cellGroup =
            cellGroupRepository
                .findById(id)
                .orElseThrow { NotFoundException("Cell group not found with id: $id") }

        request.name?.let { cellGroup.name = it }
        request.description?.let { cellGroup.description = it }

        return CellGroupResponse.from(cellGroupRepository.save(cellGroup))
    }

    fun delete(id: UUID) {
        if (!cellGroupRepository.existsById(id)) {
            throw NotFoundException("Cell group not found with id: $id")
        }
        cellGroupRepository.deleteById(id)
    }
}
