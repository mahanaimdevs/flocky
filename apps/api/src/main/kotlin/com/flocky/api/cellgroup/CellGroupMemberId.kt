package com.flocky.api.cellgroup

import java.io.Serializable
import java.util.UUID

// Composite primary key
data class CellGroupMemberId(
    val user: UUID? = null,
    val cellGroup: UUID? = null,
) : Serializable
