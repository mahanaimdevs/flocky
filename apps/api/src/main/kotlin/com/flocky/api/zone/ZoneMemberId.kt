package com.flocky.api.zone

import java.io.Serializable
import java.util.UUID

// Composite primary key
data class ZoneMemberId(
    val user: UUID? = null,
    val zone: UUID? = null,
) : Serializable
