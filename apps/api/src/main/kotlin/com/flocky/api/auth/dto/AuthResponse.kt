package com.flocky.api.auth.dto

import java.time.Instant
import java.util.UUID

data class AuthResponse(
    val token: String,
    val expiresAt: Instant,
    val user: UserInfo,
) {
    data class UserInfo(
        val id: UUID,
        val email: String,
        val name: String,
        val emailVerified: Boolean,
    )
}
