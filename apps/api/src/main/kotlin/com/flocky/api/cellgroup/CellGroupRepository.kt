package com.flocky.api.cellgroup

import org.springframework.data.jpa.repository.JpaRepository
import java.util.UUID

interface CellGroupRepository : JpaRepository<CellGroup, UUID>
