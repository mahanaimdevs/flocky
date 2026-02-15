package com.flocky.api.cellgroup

import com.flocky.api.cellgroup.dto.CellGroupResponse
import com.flocky.api.cellgroup.dto.CreateCellGroupRequest
import com.flocky.api.cellgroup.dto.UpdateCellGroupRequest
import jakarta.validation.Valid
import org.springframework.http.HttpStatus
import org.springframework.web.bind.annotation.DeleteMapping
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.PutMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.ResponseStatus
import org.springframework.web.bind.annotation.RestController
import java.util.UUID

@RestController
@RequestMapping("cell-groups")
class CellGroupController(
    private val cellGroupService: CellGroupService,
) {
    @GetMapping
    fun getAll(): List<CellGroupResponse> = cellGroupService.getAll()

    @GetMapping("{id}")
    fun getById(
        @PathVariable id: UUID,
    ): CellGroupResponse = cellGroupService.getById(id)

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    fun create(
        @Valid @RequestBody request: CreateCellGroupRequest,
    ): CellGroupResponse = cellGroupService.create(request)

    @PutMapping("{id}")
    fun update(
        @PathVariable id: UUID,
        @Valid @RequestBody request: UpdateCellGroupRequest,
    ): CellGroupResponse = cellGroupService.update(id, request)

    @DeleteMapping("{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    fun delete(
        @PathVariable id: UUID,
    ) = cellGroupService.delete(id)
}
