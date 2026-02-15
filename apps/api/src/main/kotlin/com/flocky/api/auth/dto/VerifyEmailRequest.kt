package com.flocky.api.auth.dto

import jakarta.validation.constraints.NotBlank

data class VerifyEmailRequest(
    @field:NotBlank
    val identifier: String,

    @field:NotBlank
    val value: String,
)
